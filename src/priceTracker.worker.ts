import { db } from "./db/index.js";
import { wishlistTable, dealsTable, notificationsTable } from "./schemas/index.js";
import { eq } from "drizzle-orm";

export const startPriceTracker = () => {
  console.log("🚀 Price Tracker Worker Started...");
  
  // Run every 30 seconds
  setInterval(async () => {
    try {
      // Find wishlist items where alert is enabled
      const itemsToTrack = await db
        .select({
          wishlistId: wishlistTable.id,
          userId: wishlistTable.userId,
          dealId: wishlistTable.dealId,
          savedPrice: wishlistTable.savedPrice,
          currentPrice: dealsTable.price,
          dealTitle: dealsTable.title,
        })
        .from(wishlistTable)
        .innerJoin(dealsTable, eq(wishlistTable.dealId, dealsTable.id))
        .where(eq(wishlistTable.alertEnabled, true));

      for (const item of itemsToTrack) {
        const currentPrice = parseFloat(item.currentPrice as string);
        const savedPrice = item.savedPrice ? parseFloat(item.savedPrice as string) : null;

        // Requirement: Notify if current price is lower than the price when it was saved.
        if (savedPrice !== null && currentPrice < savedPrice) {
          console.log(`[Alert] Price drop detected for "${item.dealTitle}": saved at $${savedPrice} -> now $${currentPrice}`);
          
          // Create Notification
          await db.insert(notificationsTable).values({
            userId: item.userId,
            title: "Price Drop Alert!",
            message: `The price of "${item.dealTitle}" has dropped to $${currentPrice}! (You saved it at $${savedPrice})`,
          });

          // Update savedPrice to currentPrice so we don't notify again until it drops even lower
          await db.update(wishlistTable)
            .set({ savedPrice: item.currentPrice })
            .where(eq(wishlistTable.id, item.wishlistId));
        }
      }
    } catch (error) {
      console.error("❌ Price Tracker Worker Error:", error);
    }
  }, 30000); 
};
