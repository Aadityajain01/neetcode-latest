import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    index: true,
  },
  mcqId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MCQ',
    index: true,
  },
  code: {
    type: String,
  },
  language: {
    type: String,
  },
  answer: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'compile_error', 'runtime_error'],
    default: 'pending',
  },
  testCasesPassed: {
    type: Number,
    default: 0,
  },
  totalTestCases: {
    type: Number,
    default: 0,
  },
  executionTime: {
    type: Number,
  },
  memoryUsed: {
    type: Number,
  },
  score: {
    type: Number,
    default: 0,
  },
  completedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// SubmissionSchema.index({ userId: 1, createdAt: -1 });
// SubmissionSchema.index({ problemId: 1 });
// SubmissionSchema.index({ mcqId: 1 });
// SubmissionSchema.index({ status: 1 });
// SubmissionSchema.index({ userId: 1, status: 1 });

export const Submission = mongoose.model('Submission', SubmissionSchema);
