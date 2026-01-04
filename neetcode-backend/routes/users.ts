import { Router, Response } from "express";
import { User, Submission } from "../models/index";
import { AuthenticatedRequest } from "../types/index";
import { authMiddleware } from "../middleware/auth";
import { leaderboardService } from "../services/leaderboardService";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

router.get(
  "/me",
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await User.findById(req.userId).select("-firebaseUid");

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user });
  })
);

router.get(
  "/:userId",
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params;

    const user = await User.findById(userId).select(
      "displayName email role createdAt"
    );

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user });
  })
);

router.patch(
  "/me",
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { displayName } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (displayName !== undefined) {
      user.displayName = displayName;
    }

    await user.save();

    res.json({
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    });
  })
);

router.get(
  "/:userId/stats",
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params;

    const totalSubmissions = await Submission.countDocuments({ userId });
    const dsaSubmissions = await Submission.countDocuments({
      userId,
      problemId: { $exists: true },
    });
    const practiceSubmissions = await Submission.countDocuments({
      userId,
      problemId: { $exists: true },
    });
    const mcqAttempts = await Submission.countDocuments({
      userId,
      mcqId: { $exists: true },
    });

    const problemsSolved = await Submission.distinct("problemId", {
      userId,
      status: "accepted",
      problemId: { $exists: true },
    });

    const score = await leaderboardService.getUserScore(userId);
    const rank = await leaderboardService.getUserRank(userId);

    const solvedCount = await leaderboardService.getUserSolvedCount(userId);

    res.json({
      stats: {
        totalSubmissions,
        dsaSubmissions,
        practiceSubmissions,
        mcqAttempts,
        problemsSolved: problemsSolved.length,
        score,
        rank,
      },
    });
  })
);

router.get(
  "/:userId/communities",
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params;

    const { CommunityMember, Community } = await import("../models/index");

    const memberships = await CommunityMember.find({ userId })
      .populate("communityId")
      .sort({ joinedAt: -1 });

    const communities = memberships.map((m) => ({
      id: (m.communityId as any)._id,
      name: (m.communityId as any).name,
      description: (m.communityId as any).description,
      type: (m.communityId as any).type,
      role: m.role,
      joinedAt: m.joinedAt,
    }));

    res.json({ communities });
  })
);

export default router;
