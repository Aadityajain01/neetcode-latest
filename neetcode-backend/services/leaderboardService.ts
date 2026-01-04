import { redisClient } from '../utils/redis';
import { User, Submission, Problem, CommunityMember } from '../models/index';
import { logger } from '../logger/index';

const GLOBAL_LEADERBOARD_KEY = 'leaderboard:global';
const SCORE_KEY_PREFIX = 'user:score:';

const SCORE_VALUES = {
  easy: 20,
  medium: 30,
  hard: 50,
};

export class LeaderboardService {
  public async initializeUser(userId: string): Promise<void> {
    const exists = await redisClient.zScore(GLOBAL_LEADERBOARD_KEY, userId);
    if (exists === null) {
      await redisClient.zAdd(GLOBAL_LEADERBOARD_KEY, 0, userId);
      await redisClient.set(`${SCORE_KEY_PREFIX}${userId}:solved`, '0');
      await redisClient.set(`${SCORE_KEY_PREFIX}${userId}:lastSolved`, '0');
    }
  }

  public async updateScore(userId: string, problemId: string, difficulty: string): Promise<void> {
    const userScoreKey = `${SCORE_KEY_PREFIX}${userId}`;
    const solvedKey = `${userScoreKey}:solved`;

    const isSolved = await redisClient.get(`${userScoreKey}:problem:${problemId}`);

    if (isSolved) {
      return;
    }

    await redisClient.set(`${userScoreKey}:problem:${problemId}`, '1');

    const scoreIncrement = SCORE_VALUES[difficulty as keyof typeof SCORE_VALUES] || 0;

    await redisClient.zAdd(GLOBAL_LEADERBOARD_KEY, scoreIncrement, userId);
    await redisClient.set(solvedKey, '1');
    await redisClient.set(`${userScoreKey}:lastSolved`, Date.now().toString());

    await this.persistToMongoDB(userId);
  }

  public async getUserScore(userId: string): Promise<number> {
    const score = await redisClient.zScore(GLOBAL_LEADERBOARD_KEY, userId);
    return Math.floor(score || 0);
  }

  public async getUserSolvedCount(userId: string): Promise<number> {
    const solved = await redisClient.get(`${SCORE_KEY_PREFIX}${userId}:solved`);
    return parseInt(solved || '0', 10);
  }

  public async getUserRank(userId: string): Promise<number> {
    const rank = await redisClient.zRank(GLOBAL_LEADERBOARD_KEY, userId);
    return rank !== null ? rank + 1 : 0;
  }

  public async getGlobalLeaderboard(limit: number = 100, offset: number = 0): Promise<any[]> {
    const entries = await redisClient.zRevRangeWithScores(
      GLOBAL_LEADERBOARD_KEY,
      offset,
      offset + limit - 1
    );

    const userIds = entries.map(e => e.value);
    const users = await User.find({ _id: { $in: userIds } }).select('displayName email');

    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    return entries.map((entry, index) => {
      const user = userMap.get(entry.value);
      return {
        userId: entry.value,
        displayName: user?.displayName || user?.email || 'Anonymous',
        score: Math.floor(entry.score),
        rank: offset + index + 1,
      };
    });
  }

  public async getCommunityLeaderboard(
    communityId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<any[]> {
    const members = await CommunityMember.find({ communityId }).select('userId');
    const memberIds = members.map(m => m.userId.toString());

    const globalLeaderboard = await redisClient.zRevRangeWithScores(
      GLOBAL_LEADERBOARD_KEY,
      0,
      -1
    );

    const memberSet = new Set(memberIds);
    const communityEntries = globalLeaderboard.filter(e => memberSet.has(e.value));

    const paginatedEntries = communityEntries.slice(offset, offset + limit);

    const userIds = paginatedEntries.map(e => e.value);
    const users = await User.find({ _id: { $in: userIds } }).select('displayName email');

    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    return paginatedEntries.map((entry, index) => {
      const user = userMap.get(entry.value);
      return {
        userId: entry.value,
        displayName: user?.displayName || user?.email || 'Anonymous',
        score: Math.floor(entry.score),
        rank: offset + index + 1,
      };
    });
  }

  public async getMyRankInCommunity(userId: string, communityId: string): Promise<number> {
    const members = await CommunityMember.find({ communityId }).select('userId');
    const memberIds = members.map(m => m.userId.toString());

    if (!memberIds.includes(userId)) {
      return 0;
    }

    const globalLeaderboard = await redisClient.zRevRangeWithScores(
      GLOBAL_LEADERBOARD_KEY,
      0,
      -1
    );

    const memberSet = new Set(memberIds);
    const communityLeaderboard = globalLeaderboard.filter(e => memberSet.has(e.value));

    const rank = communityLeaderboard.findIndex(e => e.value === userId);
    return rank !== -1 ? rank + 1 : 0;
  }

  public async rebuildLeaderboard(): Promise<void> {
    logger.info('Rebuilding leaderboard from MongoDB...');

    await redisClient.del(GLOBAL_LEADERBOARD_KEY);

    const solvedProblems = await Submission.aggregate([
      {
        $match: {
          problemId: { $exists: true },
          status: 'accepted',
        },
      },
      {
        $lookup: {
          from: 'problems',
          localField: 'problemId',
          foreignField: '_id',
          as: 'problem',
        },
      },
      {
        $unwind: '$problem',
      },
      {
        $match: {
          'problem.type': 'dsa',
        },
      },
      {
        $group: {
          _id: {
            userId: '$userId',
            problemId: '$problemId',
          },
          firstSubmission: { $min: '$createdAt' },
          difficulty: { $first: '$problem.difficulty' },
        },
      },
      {
        $group: {
          _id: '$_id.userId',
          solvedCount: { $sum: 1 },
          totalScore: {
            $sum: {
              $switch: {
                branches: [
                  { case: { $eq: ['$difficulty', 'easy'] }, then: 20 },
                  { case: { $eq: ['$difficulty', 'medium'] }, then: 30 },
                  { case: { $eq: ['$difficulty', 'hard'] }, then: 50 },
                ],
                default: 0,
              },
            },
          },
          lastSolvedAt: { $max: '$firstSubmission' },
        },
      },
    ]);

    const pipeline = redisClient.getClient().multi();

    for (const entry of solvedProblems) {
      const userId = entry._id.toString();
      pipeline.zAdd(GLOBAL_LEADERBOARD_KEY, entry.totalScore, userId);
      pipeline.set(`${SCORE_KEY_PREFIX}${userId}:solved`, entry.solvedCount.toString());
      pipeline.set(`${SCORE_KEY_PREFIX}${userId}:lastSolved`, entry.lastSolvedAt.getTime().toString());

      await Submission.find({
        userId,
        status: 'accepted',
        problemId: { $exists: true },
      }).distinct('problemId').then(async (problemIds) => {
        for (const problemId of problemIds) {
          pipeline.set(`${SCORE_KEY_PREFIX}${userId}:problem:${problemId}`, '1');
        }
      });
    }

    await pipeline.exec();
    logger.info('Leaderboard rebuilt successfully');
  }

  private async persistToMongoDB(userId: string): Promise<void> {
    // Leaderboard data is persisted in MongoDB via Submissions
    // This is just a placeholder if we want to add a separate leaderboard collection
  }
}

export const leaderboardService = new LeaderboardService();
