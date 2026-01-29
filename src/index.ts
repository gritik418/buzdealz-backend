import "dotenv/config";
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import dealRoutes from "./routes/deal.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { startPriceTracker } from "./priceTracker.worker.js";

const app = express();
const port = process.env.PORT || 8000;

startPriceTracker();


app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:3000",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}))

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/notifications", notificationRoutes);


app.listen(port, () => {
  console.log(`App served at port: ${port}`);
});
