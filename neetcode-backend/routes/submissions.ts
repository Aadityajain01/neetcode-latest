import { Router, Response } from 'express';
import { Submission, Problem, TestCase, MCQ } from '../models/index';
import { AuthenticatedRequest } from '../types/index';
import { authMiddleware } from '../middleware/auth';
import { judge0Service } from '../services/executionService';
import { leaderboardService } from '../services/leaderboardService';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../logger/index';

const router = Router();

router.post(
  '/',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { problemId, code, language, mcqId, answer } = req.body;

    if (mcqId) {
      const mcq = await MCQ.findById(mcqId);
      if (!mcq) {
        res.status(404).json({ error: 'MCQ not found' });
        return;
      }

      const isCorrect = answer === mcq.correctAnswer;

      const submission = new Submission({
        userId: req.userId,
        mcqId,
        answer,
        status: isCorrect ? 'accepted' : 'wrong_answer',
        completedAt: new Date(),
      });

      await submission.save();

      res.status(201).json({ submission });

      return;
    }

    if (!problemId || !code || !language) {
      res.status(400).json({ error: 'problemId, code, and language are required' });
      return;
    }

    const problem = await Problem.findById(problemId);

    if (!problem) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }

    const submission = new Submission({
      userId: req.userId,
      problemId,
      code,
      language,
      status: 'pending',
    });

    await submission.save();

    res.status(201).json({ submission });

    processSubmission(submission._id.toString(), problemId, code, language).catch(error => {
      logger.error('Failed to process submission:', error);
    });
  })
);

async function processSubmission(
  submissionId: string,
  problemId: string,
  code: string,
  language: string
): Promise<void> {
  try {
    const submission = await Submission.findById(submissionId);
    if (!submission) return;

    const problem = await Problem.findById(problemId);
    if (!problem) return;

    const testCases = await TestCase.find({ problemId, isSample: false });

    submission.status = 'running';
    await submission.save();

    if (testCases.length === 0) {
      submission.status = 'runtime_error';
      submission.completedAt = new Date();
      await submission.save();
      return;
    }

    let allPassed = true;
    let passedCount = 0;
    const results = [];

    for (const testCase of testCases) {
      const response = await judge0Service.execute({
        source_code: code,
        language_id: language as any,
        stdin: testCase.input,
        expected_output: testCase.expectedOutput,
        cpu_time_limit: problem.timeLimit,
        memory_limit: problem.memoryLimit,
      });

      const result = await judge0Service.waitForCompletion(response.token);

      const ourStatus = judge0Service.judge0StatusToOurStatus(result.status.id);

      if (ourStatus !== 'accepted') {
        allPassed = false;
        results.push({
          testCaseId: testCase._id,
          status: ourStatus,
          time: result.time,
          memory: result.memory,
        });
        break;
      }

      passedCount++;
      results.push({
        testCaseId: testCase._id,
        status: 'accepted',
        time: result.time,
        memory: result.memory,
      });
    }

    submission.status = allPassed ? 'accepted' : 'wrong_answer';
    submission.testCasesPassed = passedCount;
    submission.totalTestCases = testCases.length;
    submission.completedAt = new Date();

    if (allPassed && problem.type === 'dsa') {
      submission.score = getScoreForDifficulty(problem.difficulty);
      await leaderboardService.updateScore(
        req.userId,
        problemId,
        problem.difficulty || 'easy'
      );
    }

    await submission.save();
  } catch (error) {
    logger.error('Error processing submission:', error);

    const submission = await Submission.findById(submissionId);
    if (submission) {
      submission.status = 'runtime_error';
      submission.completedAt = new Date();
      await submission.save();
    }
  }
}

function getScoreForDifficulty(difficulty?: string): number {
  const scores: any = {
    easy: 20,
    medium: 30,
    hard: 50,
  };
  return scores[difficulty || 'easy'] || 0;
}

router.get(
  '/:submissionId',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { submissionId } = req.params;

    const submission = await Submission.findById(submissionId)
      .populate('userId', 'displayName email')
      .populate('problemId', 'title type difficulty')
      .populate('mcqId', 'question language');

    if (!submission) {
      res.status(404).json({ error: 'Submission not found' });
      return;
    }

    if (submission.userId._id.toString() !== req.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({ submission });
  })
);

router.get(
  '/me',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { limit = 20, offset = 0, type } = req.query;

    const filter: any = { userId: req.userId };

    if (type === 'dsa') {
      filter.problemId = { $exists: true };
    } else if (type === 'practice') {
      filter.problemId = { $exists: true };
    } else if (type === 'mcq') {
      filter.mcqId = { $exists: true };
    }

    const submissions = await Submission.find(filter)
      .populate('problemId', 'title type difficulty')
      .populate('mcqId', 'question language')
      .sort({ createdAt: -1 })
      .skip(Number(offset))
      .limit(Number(limit));

    const total = await Submission.countDocuments(filter);

    res.json({
      submissions,
      pagination: {
        total,
        offset: Number(offset),
        limit: Number(limit),
      },
    });
  })
);

router.get(
  '/me/dsa',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { limit = 20, offset = 0 } = req.query;

    const submissions = await Submission.find({
      userId: req.userId,
      problemId: { $exists: true },
    })
      .populate({
        path: 'problemId',
        match: { type: 'dsa' },
        select: 'title difficulty',
      })
      .sort({ createdAt: -1 })
      .skip(Number(offset))
      .limit(Number(limit));

    const filteredSubmissions = submissions.filter(s => s.problemId);

    const total = await Submission.countDocuments({
      userId: req.userId,
      problemId: { $exists: true },
    });

    res.json({
      submissions: filteredSubmissions,
      pagination: {
        total,
        offset: Number(offset),
        limit: Number(limit),
      },
    });
  })
);

router.get(
  '/me/practice',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { limit = 20, offset = 0 } = req.query;

    const submissions = await Submission.find({
      userId: req.userId,
      problemId: { $exists: true },
    })
      .populate({
        path: 'problemId',
        match: { type: 'practice' },
        select: 'title',
      })
      .sort({ createdAt: -1 })
      .skip(Number(offset))
      .limit(Number(limit));

    const filteredSubmissions = submissions.filter(s => s.problemId);

    const total = await Submission.countDocuments({
      userId: req.userId,
      problemId: { $exists: true },
    });

    res.json({
      submissions: filteredSubmissions,
      pagination: {
        total,
        offset: Number(offset),
        limit: Number(limit),
      },
    });
  })
);

router.post(
  '/:submissionId/retry',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { submissionId } = req.params;

    const submission = await Submission.findById(submissionId);

    if (!submission) {
      res.status(404).json({ error: 'Submission not found' });
      return;
    }

    if (submission.userId.toString() !== req.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    if (!submission.problemId) {
      res.status(400).json({ error: 'Can only retry code submissions' });
      return;
    }

    if (!submission.code || !submission.language) {
      res.status(400).json({ error: 'Cannot retry this submission' });
      return;
    }

    submission.status = 'pending';
    await submission.save();

    processSubmission(submission._id.toString(), submission.problemId.toString(), submission.code, submission.language).catch(error => {
      logger.error('Failed to process retry:', error);
    });

    res.json({ message: 'Submission queued for retry' });
  })
);

export default router;
