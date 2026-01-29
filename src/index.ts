import "dotenv/config";
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import dealRoutes from "./routes/deal.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/wishlist", wishlistRoutes);

app.listen(port, () => {
  console.log(`App served at port: ${port}`);
});
