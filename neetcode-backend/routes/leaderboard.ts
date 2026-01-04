import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../types/index';
import { authMiddleware } from '../middleware/auth';
import { leaderboardService } from '../services/leaderboardService';
import { CommunityMember } from '../models/index';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get(
  '/global',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { limit = 100, offset = 0 } = req.query;

    const leaderboard = await leaderboardService.getGlobalLeaderboard(
      Number(limit),
      Number(offset)
    );

    res.json({ leaderboard });
  })
);

router.get(
  '/global/me',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId!;

    const score = await leaderboardService.getUserScore(userId);
    const solvedCount = await leaderboardService.getUserSolvedCount(userId);
    const rank = await leaderboardService.getUserRank(userId);

    res.json({
      me: {
        userId,
        score,
        solvedCount,
        rank,
      },
    });
  })
);

router.get(
  '/community/:communityId',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { communityId } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    const community = await CommunityMember.findOne({ communityId, userId: req.userId });

    if (!community) {
      res.status(403).json({ error: 'Not a member of this community' });
      return;
    }

    const leaderboard = await leaderboardService.getCommunityLeaderboard(
      communityId,
      Number(limit),
      Number(offset)
    );

    res.json({ leaderboard });
  })
);

router.get(
  '/community/:communityId/me',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { communityId } = req.params;
    const userId = req.userId!;

    const membership = await CommunityMember.findOne({ communityId, userId });

    if (!membership) {
      res.status(403).json({ error: 'Not a member of this community' });
      return;
    }

    const score = await leaderboardService.getUserScore(userId);
    const solvedCount = await leaderboardService.getUserSolvedCount(userId);
    const rank = await leaderboardService.getMyRankInCommunity(userId, communityId);

    res.json({
      me: {
        userId,
        score,
        solvedCount,
        rank,
      },
    });
  })
);

export default router;
