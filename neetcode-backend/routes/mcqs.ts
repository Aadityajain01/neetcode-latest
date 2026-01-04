import { Router, Response } from 'express';
import { MCQ, Submission } from '../models/index';
import { AuthenticatedRequest } from '../types/index';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get(
  '/',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { language, difficulty, tags, search, limit = 20, offset = 0 } = req.query;

    const filter: any = {};

    if (language) {
      filter.language = language;
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : (tags as string).split(',');
      filter.tags = { $in: tagArray };
    }

    if (search) {
      filter.question = { $regex: search, $options: 'i' };
    }

    const mcqs = await MCQ.find(filter)
      .populate('createdBy', 'displayName')
      .select('-correctAnswer -explanation')
      .sort({ createdAt: -1 })
      .skip(Number(offset))
      .limit(Number(limit));

    const total = await MCQ.countDocuments(filter);

    res.json({
      mcqs,
      pagination: {
        total,
        offset: Number(offset),
        limit: Number(limit),
      },
    });
  })
);

router.get(
  '/:mcqId',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { mcqId } = req.params;

    const mcq = await MCQ.findById(mcqId).populate('createdBy', 'displayName');

    if (!mcq) {
      res.status(404).json({ error: 'MCQ not found' });
      return;
    }

    const previousAttempts = await Submission.countDocuments({
      userId: req.userId,
      mcqId,
    });

    const hasAttempted = previousAttempts > 0;

    res.json({
      mcq: {
        ...mcq.toObject(),
        correctAnswer: hasAttempted ? mcq.correctAnswer : undefined,
        explanation: hasAttempted ? mcq.explanation : undefined,
      },
    });
  })
);

router.post(
  '/submit',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { mcqId, answer } = req.body;

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

    res.json({
      submission: {
        id: submission._id,
        status: submission.status,
        isCorrect,
        ...(isCorrect && { explanation: mcq.explanation }),
      },
    });
  })
);

router.get(
  '/me/attempts',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { limit = 20, offset = 0 } = req.query;

    const submissions = await Submission.find({
      userId: req.userId,
      mcqId: { $exists: true },
    })
      .populate('mcqId', 'question language')
      .sort({ createdAt: -1 })
      .skip(Number(offset))
      .limit(Number(limit));

    const total = await Submission.countDocuments({
      userId: req.userId,
      mcqId: { $exists: true },
    });

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
  '/stats',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { userId = req.userId } = req.query;

    const totalAttempts = await Submission.countDocuments({
      userId,
      mcqId: { $exists: true },
    });

    const correctAttempts = await Submission.countDocuments({
      userId,
      mcqId: { $exists: true },
      status: 'accepted',
    });

    const uniqueMCQsAttempted = await Submission.distinct('mcqId', {
      userId,
      mcqId: { $exists: true },
    });

    const languageStats = await Submission.aggregate([
      {
        $match: {
          userId: userId as string,
          mcqId: { $exists: true },
        },
      },
      {
        $lookup: {
          from: 'mcqs',
          localField: 'mcqId',
          foreignField: '_id',
          as: 'mcq',
        },
      },
      {
        $unwind: '$mcq',
      },
      {
        $group: {
          _id: '$mcq.language',
          attempts: { $sum: 1 },
          correct: {
            $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({
      stats: {
        totalAttempts,
        correctAttempts,
        accuracy: totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0,
        uniqueMCQsAttempted: uniqueMCQsAttempted.length,
        byLanguage: languageStats,
      },
    });
  })
);

export default router;
