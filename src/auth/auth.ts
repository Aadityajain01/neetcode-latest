import { Router, Request, Response } from "express";
import { User } from "../models/index";
import { AuthenticatedRequest } from "../types/index";
import { logger } from "../logger/index";
import { verifyFirebaseToken } from "../middleware/auth";
import { registerSchema, loginSchema } from "../utils/validators";
import { validateRequest } from "../utils/validators";
import { leaderboardService } from "../services/leaderboardService";
import { asyncHandler } from "../middleware/errorHandler";
import { checkRole } from "../middleware/checkRole";
const router = Router();

router.post(
  "/register",
  validateRequest(registerSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { firebaseUid, email, displayName } = req.body;

    const existingUser = await User.findOne({ firebaseUid });
    if (existingUser) {
      res.status(400).json({ error: "User already registered" });
      return;
    }

    const emailUser = await User.findOne({ email });
    if (emailUser) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    const user = new User({
      firebaseUid,
      email,
      displayName,
      role: "user",
    });

    await user.save();
    await leaderboardService.initializeUser(user._id.toString());

    logger.info("User registered", { userId: user._id });

    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    });

  })
);
router.post(
  "/admin/promote",
  verifyFirebaseToken,
  checkRole("admin"),
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { role: "admin" },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "User promoted to admin",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  })
);

router.get(
  "/login",
  validateRequest(loginSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { idToken } = req.body;

    const decodedToken = await verifyFirebaseToken(idToken);
    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email ;

    let user = await User.findOne({ firebaseUid });
  console.log("Calling API:" + '/auth/login');

    try {
      if (!user) {
      user = new User({
        firebaseUid,
        email,
        displayName: decodedToken.name || email,
        role: "user",
      });

      await user.save();
      await leaderboardService.initializeUser(user._id.toString());

      logger.info("User auto-registered on login", { userId: user._id });
    }
    } catch (error) {
     
      res.status(404).json({ error:error});
      return;
    
    }
   try{
    
    if (user.role === "admin") {
      logger.info("Admin user logged in", { userId: user._id });
      res.json({
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
        },
        idToken,
      });
      return;
    }
   }catch(error){
    res.status(404).json({ error:error});
      return;
   }

    logger.info("User logged in", { userId: user._id });
    res.json({
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
      idToken,
    });


  })
  
);

router.post(
  "/logout",
  asyncHandler(async (req: Request, res: Response) => {
    // Firebase tokens are stateless, so logout is mainly client-side
    // We can optionally invalidate tokens in a blacklist
    res.json({ message: "Logged out successfully" });
  })
);

router.get(
  "/me",
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  })
);

router.post(
  "/refresh-token",
  validateRequest(loginSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { idToken } = req.body;

    await verifyFirebaseToken(idToken);

    res.json({
      idToken,
      message: "Token refreshed",
    });
  })
);

router.post(
  "/verify-token",
  validateRequest(loginSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { idToken } = req.body;

    const decodedToken = await verifyFirebaseToken(idToken);

    res.json({
      valid: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
    });
  })
);

export default router;
