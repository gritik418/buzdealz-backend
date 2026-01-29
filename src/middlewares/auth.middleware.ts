import { type NextFunction, type Request, type Response } from "express";
import { AUTH_TOKEN } from "../constants/index.js";
import { verifyAuthToken } from "../utils/token.js";
import { db } from "../db/index.js";
import { usersTable } from "../schemas/index.js";
import { eq } from "drizzle-orm";

export interface AuthenticatedRequest<
  P = import("express-serve-static-core").ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = import("express-serve-static-core").Query,
  Locals extends Record<string, any> = Record<string, any>
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
  user?: {
    id: number;
    email: string;
    isSubscriber: boolean;
  };
}

export const isAuthenticated = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies[AUTH_TOKEN];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      });
    }

    const payload = verifyAuthToken(token);

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, payload.id));

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not found",
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      isSubscriber: user.isSubscriber,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid token",
    });
  }
};
