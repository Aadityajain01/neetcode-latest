import mongoose from 'mongoose';

const MCQSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
    trim: true,
  },
  options: [{
    type: String,
    required: true,
  }],
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
  },
  explanation: {
    type: String,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// MCQSchema.index({ language: 1 });
// MCQSchema.index({ difficulty: 1 });
// MCQSchema.index({ tags: 1 });

export const MCQ = mongoose.model('MCQ', MCQSchema);
