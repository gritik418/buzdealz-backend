import {
  boolean,
  integer,
  pgTable,
  timestamp,
  varchar,
  decimal,
} from "drizzle-orm/pg-core";

export const dealsTable = pgTable("deals", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 1000 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("originalPrice", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("USD").notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }),
  isExpired: boolean("isExpired").default(false).notNull(),
  isDisabled: boolean("isDisabled").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Deal = typeof dealsTable.$inferSelect;
