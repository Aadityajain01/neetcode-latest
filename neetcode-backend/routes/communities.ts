import { Router, Response } from 'express';
import { Community, CommunityMember, User } from '../models/index';
import { AuthenticatedRequest } from '../types/index';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.post(
  '/',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { name, description, type, domain } = req.body;

    if (type === 'domain_restricted' && !domain) {
      res.status(400).json({ error: 'Domain is required for domain_restricted communities' });
      return;
    }

    const community = new Community({
      name,
      description,
      ownerId: req.userId,
      type,
      domain: type === 'domain_restricted' ? domain : undefined,
      memberCount: 1,
    });

    await community.save();

    const member = new CommunityMember({
      communityId: community._id,
      userId: req.userId,
      role: 'owner',
    });

    await member.save();

    res.status(201).json({ community });
  })
);

router.get(
  '/',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { type, search } = req.query;
    const filter: any = {};

    if (type) {
      filter.type = type;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const communities = await Community.find(filter)
      .populate('ownerId', 'displayName email')
      .sort({ memberCount: -1, createdAt: -1 })
      .limit(50);

    res.json({ communities });
  })
);

router.get(
  '/:communityId',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { communityId } = req.params;

    const community = await Community.findById(communityId).populate('ownerId', 'displayName email');

    if (!community) {
      res.status(404).json({ error: 'Community not found' });
      return;
    }

    const userMembership = await CommunityMember.findOne({
      communityId,
      userId: req.userId,
    });

    res.json({
      community,
      isMember: !!userMembership,
      userRole: userMembership?.role,
    });
  })
);

router.post(
  '/:communityId/join',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { communityId } = req.params;

    const community = await Community.findById(communityId);
    if (!community) {
      res.status(404).json({ error: 'Community not found' });
      return;
    }

    const existingMember = await CommunityMember.findOne({
      communityId,
      userId: req.userId,
    });

    if (existingMember) {
      res.status(400).json({ error: 'Already a member of this community' });
      return;
    }

    if (community.type === 'domain_restricted' && community.domain) {
      const user = await User.findById(req.userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const userDomain = user.email.split('@')[1];
      if (userDomain !== community.domain) {
        res.status(403).json({ error: 'Email domain does not match community domain' });
        return;
      }
    }

    const member = new CommunityMember({
      communityId,
      userId: req.userId,
      role: 'member',
    });

    await member.save();

    community.memberCount += 1;
    await community.save();

    res.json({ message: 'Joined community successfully' });
  })
);

router.delete(
  '/:communityId/leave',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { communityId } = req.params;

    const community = await Community.findById(communityId);
    if (!community) {
      res.status(404).json({ error: 'Community not found' });
      return;
    }

    const member = await CommunityMember.findOne({
      communityId,
      userId: req.userId,
    });

    if (!member) {
      res.status(400).json({ error: 'Not a member of this community' });
      return;
    }

    if (member.role === 'owner') {
      res.status(400).json({ error: 'Owners cannot leave their community' });
      return;
    }

    await CommunityMember.deleteOne({ _id: member._id });

    community.memberCount -= 1;
    await community.save();

    res.json({ message: 'Left community successfully' });
  })
);

router.get(
  '/:communityId/members',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { communityId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const members = await CommunityMember.find({ communityId })
      .populate('userId', 'displayName email')
      .sort({ joinedAt: -1 })
      .skip(Number(offset))
      .limit(Number(limit));

    res.json({ members });
  })
);

router.delete(
  '/:communityId/members/:userId',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { communityId, userId } = req.params;

    const community = await Community.findById(communityId);
    if (!community) {
      res.status(404).json({ error: 'Community not found' });
      return;
    }

    if (community.ownerId.toString() !== req.userId) {
      res.status(403).json({ error: 'Only community owner can remove members' });
      return;
    }

    const member = await CommunityMember.findOne({
      communityId,
      userId,
    });

    if (!member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    if (member.role === 'owner') {
      res.status(400).json({ error: 'Cannot remove community owner' });
      return;
    }

    await CommunityMember.deleteOne({ _id: member._id });

    community.memberCount -= 1;
    await community.save();

    res.json({ message: 'Member removed successfully' });
  })
);

router.get(
  '/:communityId/my-role',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { communityId } = req.params;

    const member = await CommunityMember.findOne({
      communityId,
      userId: req.userId,
    });

    if (!member) {
      res.json({ role: null });
      return;
    }

    res.json({ role: member.role });
  })
);

router.patch(
  '/:communityId/settings',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { communityId } = req.params;
    const { name, description } = req.body;

    const community = await Community.findById(communityId);
    if (!community) {
      res.status(404).json({ error: 'Community not found' });
      return;
    }

    if (community.ownerId.toString() !== req.userId) {
      res.status(403).json({ error: 'Only community owner can update settings' });
      return;
    }

    if (name !== undefined) {
      community.name = name;
    }

    if (description !== undefined) {
      community.description = description;
    }

    await community.save();

    res.json({ community });
  })
);

export default router;
