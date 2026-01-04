import mongoose from 'mongoose';

const ProblemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['dsa', 'practice'],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: function(this: any) {
      return this.type === 'dsa';
    },
  },
  tags: [{
    type: String,
    trim: true,
  }],
  timeLimit: {
    type: Number,
    required: true,
    default: 1,
  },
  memoryLimit: {
    type: Number,
    required: true,
    default: 256,
  },
  languages: [{
    type: String,
    required: true,
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// ProblemSchema.index({ type: 1 });
// ProblemSchema.index({ difficulty: 1 });
// ProblemSchema.index({ tags: 1 });
// ProblemSchema.index({ type: 1, difficulty: 1 });

export const Problem = mongoose.model('Problem', ProblemSchema);
