import { type Response } from "express";
import { db } from "../db/index.js";
import { notificationsTable } from "../schemas/index.js";
import { eq, desc } from "drizzle-orm";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const notifications = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, userId))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(20);

    return res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching notifications" });
  }
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(eq(notificationsTable.userId, userId));

    return res.status(200).json({ success: true, message: "Notifications marked as read" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error updating notifications" });
  }
};
