import { Router, Response } from 'express';
import { Problem, TestCase, MCQ, Submission } from '../models/index';
import { AuthenticatedRequest } from '../types/index';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../logger/index';
import { judge0Service } from '../services/executionService';
import { leaderboardService } from '../services/leaderboardService';

const router = Router();

router.post(
  '/problems',
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { title, description, type, difficulty, tags, timeLimit, memoryLimit, languages } = req.body as any as any;

    const problem = new Problem({
      title,
      description,
      type,
      difficulty,
      tags,
      timeLimit,
      memoryLimit,
      languages,
      createdBy: req.userId,
    });

    await problem.save();

    logger.info('Problem created', { problemId: problem._id, createdBy: req.userId });

    res.status(201).json({ problem });
  })
);

router.patch(
  '/problems/:problemId',
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { problemId } = req.params as any;
    const updates = req.body as any as any;

    const problem = await Problem.findByIdAndUpdate(
      problemId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!problem) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }

    logger.info('Problem updated', { problemId, updatedBy: req.userId });

    res.json({ problem });
  })
);

router.delete(
  '/problems/:problemId',
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { problemId } = req.params as any;

    const problem = await Problem.findByIdAndDelete(problemId);

    if (!problem) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }

    await TestCase.deleteMany({ problemId });

    logger.info('Problem deleted', { problemId, deletedBy: req.userId });

    res.json({ message: 'Problem deleted successfully' });
  })
);

router.post(
  '/problems/:problemId/testcases',
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { problemId } = req.params as any;
    const { testCases } = req.body as any;

    const problem = await Problem.findById(problemId);

    if (!problem) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }

    const latestVersion = await TestCase.findOne({ problemId })
      .sort({ version: -1 })
      .select('version');

    const nextVersion = (latestVersion?.version || 0) + 1;

    const createdTestCases = [];

    for (const testCase of testCases) {
      const newTestCase = new TestCase({
        problemId,
        version: nextVersion,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        isSample: testCase.isSample || false,
      });

      await newTestCase.save();
      createdTestCases.push(newTestCase);
    }

    logger.info('Test cases created', { problemId, version: nextVersion, count: testCases.length });

    res.status(201).json({
      testCases: createdTestCases,
      version: nextVersion,
    });
  })
);

router.patch(
  '/problems/:problemId/testcases',
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { problemId } = req.params as any;
    const { version, testCases } = req.body as any;

    const problem = await Problem.findById(problemId);

    if (!problem) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }

    const existingVersion = await TestCase.findOne({ problemId, version });

    if (!existingVersion) {
      res.status(404).json({ error: 'Test case version not found' });
      return;
    }

    await TestCase.deleteMany({ problemId, version });

    const updatedTestCases = [];

    for (const testCase of testCases) {
      const updatedTestCase = new TestCase({
        problemId,
        version,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        isSample: testCase.isSample || false,
      });

      await updatedTestCase.save();
      updatedTestCases.push(updatedTestCase);
    }

    logger.info('Test cases updated', { problemId, version, count: testCases.length });

    res.json({
      testCases: updatedTestCases,
      version,
    });
  })
);

router.post(
  '/mcqs',
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { question, language, options, correctAnswer, explanation, tags, difficulty } = req.body as any;

    const mcq = new MCQ({
      question,
      language,
      options,
      correctAnswer,
      explanation,
      tags,
      difficulty,
      createdBy: req.userId,
    });

    await mcq.save();

    logger.info('MCQ created', { mcqId: mcq._id, createdBy: req.userId });

    res.status(201).json({ mcq });
  })
);

router.patch(
  '/mcqs/:mcqId',
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { mcqId } = req.params as any;
    const updates = req.body as any;

    const mcq = await MCQ.findByIdAndUpdate(
      mcqId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!mcq) {
      res.status(404).json({ error: 'MCQ not found' });
      return;
    }

    logger.info('MCQ updated', { mcqId, updatedBy: req.userId });

    res.json({ mcq });
  })
);

router.delete(
  '/mcqs/:mcqId',
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { mcqId } = req.params as any;

    const mcq = await MCQ.findByIdAndDelete(mcqId);

    if (!mcq) {
      res.status(404).json({ error: 'MCQ not found' });
      return;
    }

    await Submission.deleteMany({ mcqId });

    logger.info('MCQ deleted', { mcqId, deletedBy: req.userId });

    res.json({ message: 'MCQ deleted successfully' });
  })
);

router.post(
  '/rejudge/:submissionId',
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { submissionId } = req.params as any;

    const submission = await Submission.findById(submissionId);

    if (!submission) {
      res.status(404).json({ error: 'Submission not found' });
      return;
    }

    if (!submission.problemId) {
      res.status(400).json({ error: 'Can only rejudge code submissions' });
      return;
    }

    if (!submission.code || !submission.language) {
      res.status(400).json({ error: 'Cannot rejudge this submission' });
      return;
    }

    submission.status = 'pending';
    await submission.save();

    processRejudge(submissionId, submission.problemId.toString(), submission.code, submission.language).catch(error => {
      logger.error('Failed to process rejudge:', error);
    });

    logger.info('Submission queued for rejudge', { submissionId, judgeBy: req.userId });

    res.json({ message: 'Submission queued for rejudge' });
  })
);

async function processRejudge(
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
        break;
      }

      passedCount++;
    }

    submission.status = allPassed ? 'accepted' : 'wrong_answer';
    submission.testCasesPassed = passedCount;
    submission.totalTestCases = testCases.length;
    submission.completedAt = new Date();

    const oldScore = submission.score;
    submission.score = 0;

    if (allPassed && problem.type === 'dsa') {
      submission.score = getScoreForDifficulty(problem.difficulty);
    }

    await submission.save();

    if (oldScore !== submission.score) {
      await leaderboardService.rebuildLeaderboard();
    }

  } catch (error) {
    logger.error('Error processing rejudge:', error);

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

export default router;
