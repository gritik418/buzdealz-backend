import type { Request, Response } from "express";
import { db } from "../db/index.js";
import { dealsTable } from "../schemas/index.js";
import { desc } from "drizzle-orm";

export const getDeals = async (req: Request, res: Response) => {
  try {
    const deals = await db.select().from(dealsTable).orderBy(desc(dealsTable.createdAt));
    return res.status(200).json({ success: true, data: deals });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching deals" });
  }
};

