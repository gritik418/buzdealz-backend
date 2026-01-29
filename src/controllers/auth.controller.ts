import type { Request, Response } from "express";
import RegisterSchema from "../validators/register.schema.js";
import LoginSchema from "../validators/login.schema.js";
import z from "zod";
import { usersTable } from "../schemas/index.js";
import { eq } from "drizzle-orm";
import { hashValue, verifyHash } from "../utils/hash.js";
import { db } from "../db/index.js";
import { generateAuthToken } from "../utils/token.js";
import { AUTH_TOKEN } from "../constants/index.js";
import { cookieOptions } from "../constants/cookie.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

export const userRegister = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const result = RegisterSchema.safeParse(data);

    if (!result.success) {
      const errors: Record<string, string> = {};
      const tree = z.treeifyError(result.error);

      if (tree.properties) {
        for (const key of Object.keys(tree.properties) as Array<
          keyof typeof tree.properties
        >) {
          errors[key] = tree.properties[key]?.errors?.[0] ?? "Invalid value";
        }
      }

      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors,
      });
    }

    const { name, email, password } = result.data;

    const existingEmail = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (existingEmail.length > 0)
      return res.status(400).json({
        success: false,
        message: "Email already exists.",
      });

    const hashedPassword = await hashValue(password, 10);

    const [user] = await db
      .insert(usersTable)
      .values({
        name,
        email,
        password: hashedPassword,
        isSubscriber: false,
      })
      .returning();

    const token = generateAuthToken({
      email: user.email,
      id: user.id,
    });

    return res.status(201).cookie(AUTH_TOKEN, token, cookieOptions).json({
      success: true,
      message: "Your account has been created!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const userLogin = async (req: Request, res: Response) => {
  try {
    const validation = LoginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: validation.error.flatten(),
      });
    }

    const { email, password } = validation.data;

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await verifyHash(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateAuthToken({
      email: user.email,
      id: user.id,
    });

    return res.status(200).cookie(AUTH_TOKEN, token, cookieOptions).json({
      success: true,
      message: "Login successful",
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        isSubscriber: user.isSubscriber,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const userLogout = async (req: Request, res: Response) => {
  return res
    .status(200)
    .clearCookie(AUTH_TOKEN, cookieOptions)
    .json({
      success: true,
      message: "Logged out successfully",
    });
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const [user] = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
        isSubscriber: usersTable.isSubscriber,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
