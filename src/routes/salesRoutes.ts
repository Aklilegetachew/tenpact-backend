import { Router, Request, Response } from "express";
import pool from "../db"; // Import the MySQL connection pool
import { ResultSetHeader } from "mysql2";

const salesRouter = Router();

// Route for getting all available shop
salesRouter.get("/shops", async (req: Request, res: Response) => {
  try {
    const [availableShops] = await pool.execute(
      `SELECT shop.id, shop.shopNumber, shop.size, shop.status, shop.createdAt, shop.updatedAt, 
              floor.id AS floorId, floor.name AS floorName, floor.floorNumber 
       FROM shop 
       INNER JOIN floor ON shop.floorId = floor.id 
       WHERE shop.status = 'AVAILABLE'`
    );
    res.status(200).json(availableShops);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching available shops" });
  }
});

// Get shops grouped by floor number
salesRouter.get(
  "/shops/grouped-by-floor",
  async (req: Request, res: Response) => {
    try {
      const [shops] = await pool.execute<any>(
        `SELECT shop.id, shop.shopNumber, shop.size, shop.status, shop.createdAt, shop.updatedAt, 
              floor.id AS floorId, floor.name AS floorName, floor.floorNumber 
       FROM shop 
       INNER JOIN floor ON shop.floorId = floor.id`
      );

      // Group the shops by their floor number
      const groupedShops = shops.reduce((acc: any, shop: any) => {
        const floorNumber = shop.floorNumber;
        if (!acc[floorNumber]) {
          acc[floorNumber] = [];
        }
        acc[floorNumber].push(shop);
        return acc;
      }, {});

      res.status(200).json(groupedShops);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch shops grouped by floor." });
    }
  }
);

// Show all floors
salesRouter.get("/floors", async (req: Request, res: Response) => {
  try {
    const [floors] = await pool.execute(
      `SELECT id, name, floorNumber 
       FROM floor`
    );
    res.status(200).json(floors);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch floors." });
  }
});

// Show all shops
salesRouter.get("/shops", async (req: Request, res: Response) => {
  try {
    const [shops] = await pool.execute(
      `SELECT shop.id, shop.shopNumber, shop.size, shop.status, shop.createdAt, shop.updatedAt, 
              floor.id AS floorId, floor.name AS floorName, floor.floorNumber 
       FROM shop 
       INNER JOIN floor ON shop.floorId = floor.id`
    );
    res.status(200).json(shops);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch shops." });
  }
});

// Show available shops
salesRouter.get("/shops/available", async (req: Request, res: Response) => {
  try {
    const [availableShops] = await pool.execute(
      `SELECT shop.id, shop.shopNumber, shop.size, shop.status, shop.createdAt, shop.updatedAt, 
              floor.id AS floorId, floor.name AS floorName, floor.floorNumber 
       FROM shop 
       INNER JOIN floor ON shop.floorId = floor.id 
       WHERE shop.status = 'AVAILABLE'`
    );
    res.status(200).json(availableShops);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch available shops." });
  }
});

// Show available shops grouped by floor number
salesRouter.get(
  "/shops/available/grouped-by-floor",
  async (req: Request, res: Response) => {
    try {
      const [availableShops] = await pool.execute<any>(
        `SELECT shop.id, shop.shopNumber, shop.size, shop.status, shop.createdAt, shop.updatedAt, 
              floor.id AS floorId, floor.name AS floorName, floor.floorNumber 
       FROM shop 
       INNER JOIN floor ON shop.floorId = floor.id 
       WHERE shop.status = 'AVAILABLE'`
      );

      // Group available shops by floor number
      const groupedShops = availableShops.reduce((acc: any, shop: any) => {
        const floorNumber = shop.floorNumber;
        if (!acc[floorNumber]) {
          acc[floorNumber] = [];
        }
        acc[floorNumber].push(shop);
        return acc;
      }, {});

      res.status(200).json(groupedShops);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch available shops grouped by floor." });
    }
  }
);

// Show sold shops grouped by floor number
salesRouter.get(
  "/shops/sold/grouped-by-floor",
  async (req: Request, res: Response) => {
    try {
      const [soldShops] = await pool.execute<any>(
        `SELECT shop.id, shop.shopNumber, shop.size, shop.status, shop.createdAt, shop.updatedAt, 
              floor.id AS floorId, floor.name AS floorName, floor.floorNumber 
       FROM shop 
       INNER JOIN floor ON shop.floorId = floor.id 
       WHERE shop.status = 'SOLD'`
      );

      // Group sold shops by floor number
      const groupedSoldShops = soldShops.reduce((acc: any, shop: any) => {
        const floorNumber = shop.floorNumber;
        if (!acc[floorNumber]) {
          acc[floorNumber] = [];
        }
        acc[floorNumber].push(shop);
        return acc;
      }, {});

      res.status(200).json(groupedSoldShops);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch sold shop grouped by floor." });
    }
  }
);

export default salesRouter;
