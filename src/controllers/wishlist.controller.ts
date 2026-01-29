import type { Response } from "express";
import { db } from "../db/index.js";
import { wishlistTable, dealsTable } from "../schemas/index.js";
import { eq, and, desc } from "drizzle-orm";
import { AddToWishlistSchema } from "../validators/wishlist.validator.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

export const getWishlist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Join wishlist with deals
    const items = await db
      .select({
        wishlist: wishlistTable,
        deal: dealsTable,
      })
      .from(wishlistTable)
      .innerJoin(dealsTable, eq(wishlistTable.dealId, dealsTable.id))
      .where(eq(wishlistTable.userId, userId))
      .orderBy(desc(wishlistTable.createdAt));

    const formattedItems = items.map(({ wishlist, deal }) => {
        let status = "AVAILABLE";
        if (deal.isExpired) status = "EXPIRED";
        if (deal.isDisabled) status = "DISABLED";

        // Requirement: Show best available price (if exists)
        // In our schema, 'price' is the current (discounted) price
        return {
            ...wishlist,
            deal: {
                ...deal,
                status,
                bestPrice: deal.price
            }
        };
    });

    return res.status(200).json({
      success: true,
      data: formattedItems,
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const addToWishlist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const isSubscriber = req.user!.isSubscriber;

    const validation = AddToWishlistSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: validation.error.flatten(),
      });
    }

    const { dealId, alertEnabled } = validation.data;

    // Requirement: Non-subscribers cannot enable alerts
    if (alertEnabled && !isSubscriber) {
      return res.status(403).json({
        success: false,
        message: "Only subscribers can enable deal alerts.",
      });
    }

    // Check if deal exists
    const [deal] = await db
      .select()
      .from(dealsTable)
      .where(eq(dealsTable.id, dealId));

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: "Deal not found",
      });
    }

    if (deal.isExpired || deal.isDisabled) {
        return res.status(400).json({
            success: false,
            message: "Cannot add expired or disabled deals to wishlist",
        });
    }

    // Idempotency: Check if already in wishlist
    const existing = await db
      .select()
      .from(wishlistTable)
      .where(
        and(
          eq(wishlistTable.userId, userId),
          eq(wishlistTable.dealId, dealId)
        )
      );

    if (existing.length > 0) {
      // Update alert setting if changed
      if (existing[0].alertEnabled !== alertEnabled) {
          await db.update(wishlistTable)
            .set({ alertEnabled })
            .where(eq(wishlistTable.id, existing[0].id));
          
          return res.status(200).json({
            success: true,
            message: "Wishlist alert setting updated",
          });
      }

      return res.status(200).json({
        success: true,
        message: "Item already in wishlist",
      });
    }

    await db.insert(wishlistTable).values({
      userId,
      dealId,
      alertEnabled: alertEnabled ?? false,
    });

    console.log(`[Analytics] User ${userId} added deal ${dealId} to wishlist.`);

    return res.status(201).json({
      success: true,
      message: "Added to wishlist",
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const removeFromWishlist = async (
    req: AuthenticatedRequest<{ dealId: string }>,
    res: Response
  ) => {
    try {
      const userId = req.user!.id;
      const dealId = parseInt(req.params.dealId);
  
      if (isNaN(dealId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid deal ID",
        });
      }
  
      const result = await db
        .delete(wishlistTable)
        .where(
          and(
            eq(wishlistTable.userId, userId),
            eq(wishlistTable.dealId, dealId)
          )
        )
        .returning();
  
      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Item not found in wishlist",
        });
      }
  
      console.log(`[Analytics] User ${userId} removed deal ${dealId} from wishlist.`);
  
      return res.status(200).json({
        success: true,
        message: "Removed from wishlist",
      });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  };
