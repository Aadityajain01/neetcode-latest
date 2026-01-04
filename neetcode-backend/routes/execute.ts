import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../types/index';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { judge0Service } from '../services/executionService';
import { asyncHandler } from '../middleware/errorHandler';
import { strictRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post(
  '/execute',
  authMiddleware,
  // adminMiddleware,
  strictRateLimiter,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { source_code, language_id, stdin, expected_output, cpu_time_limit, memory_limit } = req.body;

    if (!source_code || !language_id) {
      res.status(400).json({ error: 'source_code and language_id are required' });
      return;
    }

    const response = await judge0Service.execute({
      source_code,
      language_id,
      stdin,
      expected_output,
      cpu_time_limit,
      memory_limit,
    });

    res.json({ token: response.token });
    
  })
);

router.get(
  '/execute/:token/status',
  authMiddleware,
  // adminMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { token } = req.params;

    const result = await judge0Service.getSubmissionStatus(token);

    res.json({
      token: result.token,
      status: {
        id: result.status.id,
        description: result.status.description,
      },
      stdout: result.stdout,
      stderr: result.stderr,
      compile_output: result.compile_output,
      time: result.time,
      memory: result.memory,
      exit_code: result.exit_code,
    });
  })
);

export default router;
