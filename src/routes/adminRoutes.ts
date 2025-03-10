import { Router } from "express";
import { Request, Response } from "express-serve-static-core";
// Import the MySQL connection pool
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db";
import { ResultSetHeader } from "mysql2";
import cuid from "cuid";

const adminRouter = Router();

// Route for adding a new Floor
adminRouter.post("/floors", async (req: Request, res: Response) => {
  const { name, floorNumber } = req.body;
  const id = cuid(); // Generate a unique CUID

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO floor (id, name, floorNumber) VALUES (?, ?, ?)",
      [id, name, floorNumber]
    );
    res.status(201).json({ id, name, floorNumber });
  } catch (error) {
    res.status(500).json({ error: "Error creating floor" });
  }
});

// Route for adding a new Shop
adminRouter.post("/shops", async (req: Request, res: Response) => {
  const { shopNumber, size, floorId } = req.body;
  const id = cuid(); // Generate a unique CUID
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO shop (id, shopNumber, size, floorId) VALUES (?, ?, ?, ?)",
      [id, shopNumber, size, floorId]
    );
    res.status(201).json({ id: result.insertId, shopNumber, size, floorId });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error creating shop" });
  }
});

// Route for deleting a Floor
adminRouter.delete("/floors/:id", async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    await pool.execute("DELETE FROM shop WHERE floorId = ?", [id]);
    await pool.execute("DELETE FROM floor WHERE id = ?", [id]);
    res.status(200).json({ message: "Floor deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting floor" });
  }
});

// Route for deleting a Shop
adminRouter.delete("/shops/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await pool.execute("DELETE FROM shop WHERE id = ?", [id]);
    res.status(200).json({ message: "Shop deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting shop" });
  }
});

// Route for editing Shop Floor
adminRouter.put("/shops/:id/floor", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { floorId } = req.body;

  try {
    await pool.execute("UPDATE shop SET floorId = ? WHERE id = ?", [
      floorId,
      id,
    ]);
    res.status(200).json({ message: "Shop floor updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error updating shop floor" });
  }
});

// Route for editing Shop Availability (Available or Sold)
adminRouter.put("/shops/:id/status", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  console.log(status);
  console.log(id);
  try {
    await pool.execute("UPDATE shop SET status = ? WHERE id = ?", [status, id]);
    res.status(200).json({ message: "Shop status updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error updating shop status" });
  }
});

// Route for editing Shop Size
adminRouter.put("/shops/:id/size", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { size } = req.body;

  try {
    await pool.execute("UPDATE shop SET size = ? WHERE id = ?", [size, id]);
    res.status(200).json({ message: "Shop size updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error updating shop size" });
  }
});

// Route for editing Shop Number
adminRouter.put("/shops/:id/number", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { shopNumber } = req.body;

  try {
    await pool.execute("UPDATE shop SET shopNumber = ? WHERE id = ?", [
      shopNumber,
      id,
    ]);
    res.status(200).json({ message: "Shop number updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error updating shop number" });
  }
});

// Create User (Admin only)
adminRouter.post("/users", async (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const id = cuid();
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO user (id, email, password, role) VALUES (?, ?, ?, ?)",
      [id, email, hashedPassword, role]
    );
    res.status(201).json({ id: result.insertId, email, role });
  } catch (error) {
    res.status(500).json({ error: "Error creating user" });
  }
});

// Get All Users (Admin only)
adminRouter.get("/users", async (req: Request, res: Response) => {
  try {
    const [users] = await pool.execute("SELECT * FROM user");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

// Update User Role (Admin only)
adminRouter.put("/users/:id/role", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    await pool.execute("UPDATE user SET role = ? WHERE id = ?", [role, id]);
    res.status(200).json({ message: "User role updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error updating user role" });
  }
});

// Delete User (Admin only)
adminRouter.delete("/users/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await pool.execute("DELETE FROM user WHERE id = ?", [id]);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting user" });
  }
});

// Admin Login
adminRouter.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const [users] = await pool.execute<any[]>(
      "SELECT * FROM user WHERE email = ?",
      [email]
    );

    if (!users) {
      res.status(404).json({ error: "User not found" });
    }

    const user = users[0];

    if (user.role !== "ADMIN") {
      res.status(403).json({ error: "Not authorized" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1h" }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get total number of shops
adminRouter.get("/shops/count", async (req: Request, res: Response) => {
  try {
    const [result] = await pool.execute<any>(
      "SELECT COUNT(*) as totalShops FROM shop"
    );
    res.json({ totalShops: result[0].totalShops });
  } catch (error) {
    res.status(500).json({ error: "Error fetching shop count" });
  }
});

// Get total number of floors
adminRouter.get("/floors/count", async (req: Request, res: Response) => {
  try {
    const [result] = await pool.execute<any>(
      "SELECT COUNT(*) as totalFloors FROM floor"
    );
    res.json({ totalFloors: result[0].totalFloors });
  } catch (error) {
    res.status(500).json({ error: "Error fetching floor count" });
  }
});

// Get total number of users
adminRouter.get("/users/count", async (req: Request, res: Response) => {
  try {
    const [result] = await pool.execute<any>(
      "SELECT COUNT(*) as totalUsers FROM user"
    );
    res.json({ totalUsers: result[0].totalUsers });
  } catch (error) {
    res.status(500).json({ error: "Error fetching user count" });
  }
});

// Get number of available shops
adminRouter.get(
  "/shops/available/count",
  async (req: Request, res: Response) => {
    try {
      const [result] = await pool.execute<any>(
        "SELECT COUNT(*) as availableShops FROM shop WHERE status = 'AVAILABLE'"
      );
      res.json({ availableShops: result[0].availableShops });
    } catch (error) {
      res.status(500).json({ error: "Error fetching available shop count" });
    }
  }
);

// Get number of sold shops
adminRouter.get("/shops/sold/count", async (req: Request, res: Response) => {
  try {
    const [result] = await pool.execute<any>(
      "SELECT COUNT(*) as soldShops FROM shop WHERE status = 'SOLD'"
    );
    res.json({ soldShops: result[0].soldShops });
  } catch (error) {
    res.status(500).json({ error: "Error fetching sold shop count" });
  }
});

// Update Shop Details
adminRouter.put("/shops/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { shopNumber, floorId, size } = req.body;

  try {
    await pool.execute(
      "UPDATE shop SET shopNumber = ?, size = ?, floorId = ? WHERE id = ?",
      [shopNumber, size, floorId, id]
    );
    res.status(200).json({ message: "Shop details updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error updating shop details" });
  }
});

// Get all sold shops
adminRouter.get("/shops/sold", async (req: Request, res: Response) => {
  try {
    const [soldShops] = await pool.execute<ResultSetHeader>(
      "SELECT * FROM shop WHERE status = 'SOLD'"
    );
    res.status(200).json(soldShops);
  } catch (error) {
    res.status(500).json({ error: "Error fetching sold shops" });
  }
});

export default adminRouter;
