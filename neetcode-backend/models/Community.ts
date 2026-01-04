// import { Router, Response } from 'express';
// import { Community, CommunityMember, User } from '../models/index';
// import { AuthenticatedRequest } from '../types/index';
// import { authMiddleware } from '../middleware/auth';
// import { asyncHandler } from '../middleware/errorHandler';

// const router = Router();

// // Create Community
// router.post('/', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
//   const { name, description, type, domain } = req.body;

//   if (type === 'domain_restricted' && !domain) {
//     res.status(400).json({ error: 'Domain is required for domain_restricted communities' });
//     return;
//   }

//   const community = new Community({
//     name,
//     description,
//     ownerId: req.userId,
//     type,
//     domain: type === 'domain_restricted' ? domain : undefined,
//     memberCount: 1, // Start with 1 (the owner)
//   });

//   await community.save();

//   // Add owner as first member
//   const member = new CommunityMember({
//     communityId: community._id,
//     userId: req.userId,
//     role: 'owner',
//   });

//   await member.save();

//   res.status(201).json({ community });
// }));

// // List Communities
// router.get('/', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
//   const { type, search } = req.query;
//   const filter: any = {};

//   if (type) filter.type = type;
//   if (search) filter.name = { $regex: search, $options: 'i' };

//   const communities = await Community.find(filter)
//     .populate('ownerId', 'displayName email')
//     .sort({ memberCount: -1, createdAt: -1 })
//     .limit(50);

//   res.json({ communities });
// }));

// // Get Single Community
// router.get('/:communityId', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
//   const { communityId } = req.params;

//   const community = await Community.findById(communityId).populate('ownerId', 'displayName email');

//   if (!community) {
//     res.status(404).json({ error: 'Community not found' });
//     return;
//   }

//   const userMembership = await CommunityMember.findOne({
//     communityId,
//     userId: req.userId,
//   });

//   res.json({
//     community,
//     isMember: !!userMembership,
//     userRole: userMembership?.role,
//   });
// }));

// // Join Community
// router.post('/:communityId/join', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
//   const { communityId } = req.params;

//   const community = await Community.findById(communityId);
//   if (!community) {
//     res.status(404).json({ error: 'Community not found' });
//     return;
//   }

//   const existingMember = await CommunityMember.findOne({ communityId, userId: req.userId });
//   if (existingMember) {
//     res.status(400).json({ error: 'Already a member' });
//     return;
//   }

//   // Domain Check
//   if (community.type === 'domain_restricted' && community.domain) {
//     const user = await User.findById(req.userId);
//     if (!user || !user.email) {
//       res.status(400).json({ error: 'User email required for verification' });
//       return;
//     }

//     const userDomain = user.email.split('@')[1];
//     if (userDomain !== community.domain) {
//       res.status(403).json({ error: `Email must belong to ${community.domain}` });
//       return;
//     }
//   }

//   await CommunityMember.create({
//     communityId,
//     userId: req.userId,
//     role: 'member',
//   });

//   // Increment count
//   await Community.findByIdAndUpdate(communityId, { $inc: { memberCount: 1 } });

//   res.json({ message: 'Joined successfully' });
// }));

// // Leave Community
// router.delete('/:communityId/leave', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
//   const { communityId } = req.params;

//   const member = await CommunityMember.findOne({ communityId, userId: req.userId });
//   if (!member) {
//     res.status(400).json({ error: 'Not a member' });
//     return;
//   }

//   if (member.role === 'owner') {
//     res.status(400).json({ error: 'Owners cannot leave. Transfer ownership or delete community.' });
//     return;
//   }

//   await CommunityMember.deleteOne({ _id: member._id });
//   await Community.findByIdAndUpdate(communityId, { $inc: { memberCount: -1 } });

//   res.json({ message: 'Left community' });
// }));

// // Get Members
// router.get('/:communityId/members', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
//   const { communityId } = req.params;
//   const { limit = 50, offset = 0 } = req.query;

//   const members = await CommunityMember.find({ communityId })
//     .populate('userId', 'displayName email')
//     .sort({ joinedAt: -1 })
//     .skip(Number(offset))
//     .limit(Number(limit));

//   res.json({ members });
// }));

// export const communityRouter = router;



import mongoose from 'mongoose';

const CommunitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['open', 'domain_restricted'],
    required: true,
  },
  domain: {
    type: String,
    trim: true,
    lowercase: true,
    // Validate: required only if type is domain_restricted
    required: function(this: any) {
      return this.type === 'domain_restricted';
    },
  },
  memberCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export const Community = mongoose.model('Community', CommunitySchema);