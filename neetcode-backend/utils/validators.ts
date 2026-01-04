import { z } from 'zod';

export const registerSchema = z.object({
  firebaseUid: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().optional(),
});

export const loginSchema = z.object({
  idToken: z.string().min(1),
});

export const createCommunitySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  type: z.enum(['open', 'domain_restricted']),
  domain: z.string().email().optional(),
});

export const updateCommunitySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
});

export const submitMCQSchema = z.object({
  mcqId: z.string(),
  answer: z.number().min(0),
});

export const submitCodeSchema = z.object({
  problemId: z.string(),
  code: z.string().min(1),
  language: z.string().min(1),
});

export const createProblemSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  type: z.enum(['dsa', 'practice']),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  tags: z.array(z.string()).default([]),
  timeLimit: z.number().positive().default(1),
  memoryLimit: z.number().positive().default(256),
  languages: z.array(z.string()).min(1),
});

export const updateProblemSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  tags: z.array(z.string()).optional(),
  timeLimit: z.number().positive().optional(),
  memoryLimit: z.number().positive().optional(),
  languages: z.array(z.string()).min(1).optional(),
});

export const createTestCasesSchema = z.object({
  testCases: z.array(z.object({
    input: z.string(),
    expectedOutput: z.string(),
    isSample: z.boolean().default(false),
  })).min(1),
});

export const updateTestCasesSchema = z.object({
  version: z.number().positive(),
  testCases: z.array(z.object({
    input: z.string(),
    expectedOutput: z.string(),
    isSample: z.boolean().default(false),
  })).min(1),
});

export const createMCQSchema = z.object({
  question: z.string().min(1),
  language: z.string().min(1),
  options: z.array(z.string()).min(2).max(10),
  correctAnswer: z.number().min(0),
  explanation: z.string().optional(),
  tags: z.array(z.string()).default([]),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

export const updateMCQSchema = z.object({
  question: z.string().min(1).optional(),
  language: z.string().min(1).optional(),
  options: z.array(z.string()).min(2).max(10).optional(),
  correctAnswer: z.number().min(0).optional(),
  explanation: z.string().optional(),
  tags: z.array(z.string()).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

export function validateRequest(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
        return;
      }
      res.status(400).json({ error: 'Invalid request data' });
    }
  };
}
