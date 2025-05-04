import { Express, Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import MemoryStore from "memorystore";
import jwt from "jsonwebtoken";

// Types for authenticated users
interface StorageUser {
  id: number;
  email: string;
  name: string | null;
  username: string;
  password: string;
  createdAt: Date | null;
  role?: string;
  subscriptionTier?: string;
  subscriptionActive?: boolean;
  onboardingCompleted?: boolean;
  onboardingStep?: number | string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  verified?: boolean;
  verificationToken?: string | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  provider?: string;
  providerId?: string | null;
  profileImage?: string | null;
  accountStatus?: string;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string | null;
  twoFactorBackupCodes?: string[] | null;
  twoFactorVerified?: boolean;
  subscriptionStartDate?: Date | null;
  subscriptionEndDate?: Date | null;
  lastLogin?: Date | null;
  profileCompleted?: boolean;
}

interface DatabaseUser {
  id: number;
  email: string;
  name: string | null;
  username: string;
  password: string;
  createdAt: Date | null;
  role?: string;
  subscriptionTier?: string;
  subscriptionActive?: boolean;
  onboardingCompleted?: boolean;
  onboardingStep?: number | string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

interface DatabaseUserCreate {
  email: string;
  username: string;
  password: string;
  name?: string | null;
  role?: string;
  subscriptionTier?: string;
  subscriptionActive?: boolean;
  onboardingCompleted?: boolean;
  onboardingStep?: number | string;
}

interface DatabaseUserUpdate {
  email?: string;
  name?: string | null;
  password?: string;
  role?: string;
  subscriptionTier?: string;
  subscriptionActive?: boolean;
  onboardingCompleted?: boolean;
  onboardingStep?: number | string;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  username: string;
  password?: string;
  createdAt: Date | null;
  role?: string;
  subscriptionTier?: string;
  subscriptionActive?: boolean;
  onboardingCompleted?: boolean;
  onboardingStep?: number | string;
}

interface UserWithoutPassword extends Omit<User, "password"> {}

interface UserWithPassword extends User {
  password: string;
}

declare global {
  namespace Express {
    interface User extends UserWithoutPassword {}
  }
}

// Create memory store for sessions
const MemStore = MemoryStore(session);

// For secure password hashing
const scryptAsync = promisify(scrypt);

// Hash a password using scrypt
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Compare a supplied password with a stored hashed password
async function comparePasswords(
  supplied: string,
  stored: string
): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Create JWT token
function createToken(user: User): string {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    subscriptionTier: user.subscriptionTier,
    subscriptionActive: user.subscriptionActive,
    onboardingCompleted: user.onboardingCompleted,
    onboardingStep: user.onboardingStep,
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET || "nk7n456vXBYz9qrT3uLWsG8EmDcP5hKfAgd2QRxZJF",
    {
      expiresIn: "7d",
    }
  );
}

// Verify JWT token
function verifyToken(token: string): UserWithoutPassword | null {
  try {
    return jwt.verify(
      token,
      process.env.JWT_SECRET || "nk7n456vXBYz9qrT3uLWsG8EmDcP5hKfAgd2QRxZJF"
    ) as UserWithoutPassword;
  } catch (err: unknown) {
    return null;
  }
}

// JWT authentication middleware
export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  const user = verifyToken(token);
  if (!user) {
    return res.sendStatus(403);
  }

  req.user = user;
  next();
}

// Setup authentication for the Express app
export function setupAuth(app: Express) {
  // Configure session
  const sessionOptions: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "stackr-session-secret",
    resave: false,
    saveUninitialized: false,
    store: new MemStore({
      checkPeriod: 86400000, // Prune expired entries every 24h
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  };

  app.use(session(sessionOptions));
  app.use(passport.initialize());
  app.use(passport.session());

  // Setup LocalStrategy for username/password login
  passport.use(
    new LocalStrategy(
      async (username: string, password: string, done: Function) => {
        try {
          // Use the new method that accepts either username or email
          const storageUser = (await storage.getUserByUsernameOrEmail(
            username
          )) as StorageUser | undefined;

          if (!storageUser || !storageUser.password || !storageUser.username) {
            return done(null, false, {
              message: "Incorrect username or email",
            });
          }

          const isValid = await comparePasswords(
            password,
            storageUser.password
          );
          if (!isValid) {
            return done(null, false, { message: "Incorrect password" });
          }

          // Convert storage user to API user format
          const user: User = {
            id: storageUser.id.toString(),
            email: storageUser.email,
            name: storageUser.name,
            username: storageUser.username,
            createdAt: storageUser.createdAt,
            role: storageUser.role,
            subscriptionTier: storageUser.subscriptionTier,
            subscriptionActive: storageUser.subscriptionActive,
            onboardingCompleted: storageUser.onboardingCompleted,
            onboardingStep: storageUser.onboardingStep,
          };

          const { password: _, ...userWithoutPassword } = user;
          return done(null, userWithoutPassword);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // Setup Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        callbackURL: "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists
          let user = await storage.getUserByEmail(
            profile.emails?.[0]?.value || ""
          );

          if (!user) {
            // Create new user if doesn't exist
            const newUser = {
              email: profile.emails?.[0]?.value || "",
              name: profile.displayName,
              username: profile.emails?.[0]?.value?.split("@")[0] || "",
              provider: "google",
              providerId: profile.id,
              profileImage: profile.photos?.[0]?.value,
              verified: true,
              createdAt: new Date(),
            };

            user = await storage.createUser(newUser);
          }

          // Convert storage user to API user format
          const apiUser = {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            username: user.username,
            createdAt: user.createdAt,
            role: user.role,
            subscriptionTier: user.subscriptionTier,
            subscriptionActive: user.subscriptionActive,
            onboardingCompleted: user.onboardingCompleted,
            onboardingStep: user.onboardingStep,
            profileImage: user.profileImage,
          };

          return done(null, apiUser);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );

  // Serialize user for session
  passport.serializeUser((user: User, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const storageUser = (await storage.getUser(parseInt(id, 10))) as
        | StorageUser
        | undefined;
      if (!storageUser || !storageUser.username) {
        return done(null, false);
      }

      // Convert storage user to API user format
      const user: User = {
        id: storageUser.id.toString(),
        email: storageUser.email,
        name: storageUser.name,
        username: storageUser.username,
        createdAt: storageUser.createdAt,
        role: storageUser.role,
        subscriptionTier: storageUser.subscriptionTier,
        subscriptionActive: storageUser.subscriptionActive,
        onboardingCompleted: storageUser.onboardingCompleted,
        onboardingStep: storageUser.onboardingStep,
      };

      const { password: _, ...userWithoutPassword } = user;
      return done(null, userWithoutPassword);
    } catch (err: unknown) {
      return done(err);
    }
  });

  // Register route
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(
        req.body.username
      );
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Check if email already exists (if email is provided)
      if (req.body.email) {
        const existingEmail = await storage.getUserByEmail(req.body.email);
        if (existingEmail) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }

      // Create new user with hashed password
      const userData: DatabaseUserCreate = {
        ...req.body,
        password: await hashPassword(req.body.password),
        role: "user",
        subscriptionTier: "free",
        subscriptionActive: false,
        onboardingCompleted: false,
        onboardingStep: "welcome",
      };

      const storageUser = (await storage.createUser(userData)) as StorageUser;

      // Convert storage user to API user format
      const user: User = {
        id: storageUser.id.toString(),
        email: storageUser.email,
        name: storageUser.name,
        username: storageUser.username,
        createdAt: storageUser.createdAt,
        role: storageUser.role,
        subscriptionTier: storageUser.subscriptionTier,
        subscriptionActive: storageUser.subscriptionActive,
        onboardingCompleted: storageUser.onboardingCompleted,
        onboardingStep: storageUser.onboardingStep,
      };

      const { password: _, ...userWithoutPassword } = user;

      // Log in the new user automatically
      req.login(userWithoutPassword, (err) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Login error after registration" });
        }

        // Generate JWT token for API access
        const token = createToken(user);

        res.status(201).json({
          ...userWithoutPassword,
          token,
        });
      });
    } catch (err) {
      console.error("Registration error:", err);
      res.status(500).json({ message: "Server error during registration" });
    }
  });

  // Login route
  app.post("/api/login", (req: Request, res: Response, next: NextFunction) => {
    type AuthError = Error | null;
    type AuthInfo = { message: string } | undefined;

    passport.authenticate(
      "local",
      (err: AuthError, user: UserWithoutPassword | false, info: AuthInfo) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res
            .status(401)
            .json({ message: info?.message || "Authentication failed" });
        }

        req.login(user, (err) => {
          if (err) {
            return next(err);
          }

          // Generate JWT token for API access
          const token = createToken(user as User);

          res.json({
            ...user,
            token,
          });
        });
      }
    )(req, res, next);
  });

  // Get current user route
  app.get("/api/user", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      // Check JWT token if session-based auth fails
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = verifyToken(token);
      if (!user) {
        return res.status(401).json({ message: "Invalid token" });
      }

      return res.json(user);
    }

    res.json(req.user);
  });

  // Google OAuth routes
  app.get(
    "/api/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
      prompt: "select_account",
    })
  );

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req: Request, res: Response) => {
      // Generate JWT token for API access
      const token = createToken(req.user as User);

      // Redirect to frontend with token
      res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
    }
  );

  // Logout route
  app.post("/api/logout", (req: Request, res: Response) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  // Change password route
  app.post(
    "/api/change-password",
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword || !req.user) {
          return res
            .status(400)
            .json({ message: "Both current and new password are required" });
        }

        const dbUser = (await storage.getUser(parseInt(req.user.id, 10))) as
          | DatabaseUser
          | undefined;
        if (!dbUser) {
          return res.status(404).json({ message: "User not found" });
        }

        const isValid = await comparePasswords(
          currentPassword,
          dbUser.password
        );
        if (!isValid) {
          return res
            .status(401)
            .json({ message: "Current password is incorrect" });
        }

        // Update password
        const update: DatabaseUserUpdate = {
          password: await hashPassword(newPassword),
        };

        await storage.updateUser(dbUser.id, update);

        res.json({ message: "Password updated successfully" });
      } catch (err) {
        console.error("Password change error:", err);
        res
          .status(500)
          .json({ message: "Server error during password change" });
      }
    }
  );
}
