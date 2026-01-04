// import mongoose from 'mongoose';

// const CommunityMemberSchema = new mongoose.Schema({
//   communityId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Community',
//     required: true,
//     index: true,
//   },
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     index: true,
//   },
//   role: {
//     type: String,
//     enum: ['owner', 'admin', 'member'],
//     default: 'member',
//   },
//   joinedAt: {
//     type: Date,
//     default: Date.now,
//   },
// }, {
//   timestamps: true,
// });

// // CommunityMemberSchema.index({ communityId: 1, userId: 1 }, { unique: true });
// // CommunityMemberSchema.index({ userId: 1 });
// // CommunityMemberSchema.index({ communityId: 1 });

// export const CommunityMember = mongoose.model('CommunityMember', CommunityMemberSchema);


import mongoose from 'mongoose';

const CommunityMemberSchema = new mongoose.Schema({
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'member'],
    default: 'member',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Ensure a user can't join the same community twice
CommunityMemberSchema.index({ communityId: 1, userId: 1 }, { unique: true });

export const CommunityMember = mongoose.model('CommunityMember', CommunityMemberSchema);