import "dotenv/config";
import { db } from "../src/db/index.js";
import { dealsTable } from "../src/schemas/index.js";
import { faker } from "@faker-js/faker";

const seed = async () => {
  console.log("Seeding deals...");

  const deals: (typeof dealsTable.$inferInsert)[] = [];

  for (let i = 0; i < 20; i++) {
    const price = faker.commerce.price({ min: 10, max: 500 });
    const originalPrice = (parseFloat(price) * (1 + faker.number.float({ min: 0.1, max: 0.5 }))).toFixed(2);
    
    deals.push({
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: price.toString(),
      originalPrice: originalPrice.toString(),
      currency: "USD",
      imageUrl: faker.image.url(),
      isExpired: faker.datatype.boolean({ probability: 0.1 }),
      isDisabled: faker.datatype.boolean({ probability: 0.05 }),
      createdAt: faker.date.recent({ days: 30 }),
    });
  }

  try {
    await db.insert(dealsTable).values(deals);
    console.log("✅ Deals seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding deals:", error);
    process.exit(1);
  }
};

seed();
