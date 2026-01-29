import {
  boolean,
  integer,
  pgTable,
  timestamp,
  unique,
  decimal,
} from "drizzle-orm/pg-core";

import { usersTable } from "./user.schema.js";
import { dealsTable } from "./deal.schema.js";

export const wishlistTable = pgTable(
  "wishlist",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("userId")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    dealId: integer("dealId")
      .references(() => dealsTable.id, { onDelete: "cascade" })
      .notNull(),
    alertEnabled: boolean("alertEnabled").default(false).notNull(),
    savedPrice: decimal("savedPrice", { precision: 10, scale: 2 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),

  },


  (table) => ({
    uniqueUserDeal: unique().on(table.userId, table.dealId),
  })
);

export type WishlistItem = typeof wishlistTable.$inferSelect;
