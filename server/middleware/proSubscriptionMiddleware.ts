import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

/**
 * Middleware to ensure the user has an active Pro subscription
 */
export const requireProSubscription = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const user = await storage.getUser(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isPro = user.subscriptionTier === "pro" || user.subscriptionTier === "lifetime";
  const isActive = user.subscriptionActive;

  if (!isPro || !isActive) {
    return res.status(403).json({ 
      message: "This feature requires an active Pro subscription",
      upgrade: true
    });
  }

  next();
};