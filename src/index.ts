import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import adminRouter from "./routes/adminRoutes";
import salesRouter from "./routes/salesRoutes";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Apply database migrations
async function applyMigrations() {
  try {
    console.log("Applying database migrations...");
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
    console.log("Migrations applied successfully.");
  } catch (error) {
    console.error("Error applying migrations:", error);
    process.exit(1); // Exit if migration fails
  }
}

// Ensure database connection before starting the server
async function startServer() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully.");

    await applyMigrations();

    // Admin Routes
    app.use("/admin", adminRouter);

    // Sales Routes
    app.use("/sales", salesRouter);

    // Start the server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

startServer();
