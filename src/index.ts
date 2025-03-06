import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import adminRouter from "./routes/adminRoutes";
import salesRouter from "./routes/salesRoutes";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Ensure database connection before starting the server
async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully.");

    // Apply routes
    app.use("/admin", adminRouter);
    app.use("/sales", salesRouter);

    // Start the server
    app.listen(); // cPanel auto-assigns the port via Passenger
    console.log("🚀 Server started successfully!");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

startServer();
