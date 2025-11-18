import express from "express";
import dotenv from "dotenv";
import authRoute from "./routes/auth.route.js";
import inventoryRoute from "./routes/inventory.route.js";
import borrowRoute from "./routes/borrow.route.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 2398;

app.use(express.json());

// Routes
app.use("/auth", authRoute);
app.use("/inventory", inventoryRoute);
app.use("/inventory", borrowRoute);

app.listen(port, () => {
  console.log(`Server berjalan pada http://localhost:${port}`);
});
