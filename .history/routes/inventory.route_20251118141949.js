import express from "express";
import { authorize } from "../controllers/auth.controller.js";
import { isAdmin } from "../middlewares/role-validation.js";
import { validateInventory } from "../middlewares/inventory-validation.js";
import {
  addInventory,
  updateInventory,
  getInventoryById,
  getAllInventory,
} from "../controllers/inventory.controller.js";

const router = express.Router();
x
// POST - Tambah barang (Admin only)
router.post("/", authorize, isAdmin, validateInventory, addInventory);

// PUT - Update barang (Admin only)
router.put("/:id", authorize, isAdmin, updateInventory);

// GET - Ambil barang by ID (Admin & User)
router.get("/:id", authorize, getInventoryById);

// GET - Ambil semua barang (Admin & User) - Bonus endpoint
router.get("/", authorize, getAllInventory);

export default router;
