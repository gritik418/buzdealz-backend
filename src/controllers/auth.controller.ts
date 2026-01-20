import type { Request, Response } from "express";
import RegisterSchema from "../validators/register.schema.js";
import z from "zod";
import { usersTable } from "../schemas/index.js";
import { eq } from "drizzle-orm";
import { hashValue } from "../utils/hash.js";
import { db } from "../db/index.js";
import { generateAuthToken } from "../utils/token.js";
import { AUTH_TOKEN } from "../constants/index.js";
import { cookieOptions } from "../constants/cookie.js";

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
