import mongoose from 'mongoose';

const TestCaseSchema = new mongoose.Schema({
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
    index: true,
  },
  version: {
    type: Number,
    required: true,
    default: 1,
  },
  input: {
    type: String,
    required: true,
  },
  expectedOutput: {
    type: String,
    required: true,
  },
  isSample: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// TestCaseSchema.index({ problemId: 1, version: 1 });
// TestCaseSchema.index({ problemId: 1, isSample: 1 });

export const TestCase = mongoose.model('TestCase', TestCaseSchema);
