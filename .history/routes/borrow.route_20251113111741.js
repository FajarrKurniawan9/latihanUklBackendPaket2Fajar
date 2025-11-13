import express from "express";
import { authorize } from "../controllers/auth.controller.js";
import { isUser } from "../middlewares/role-validation.js";
import {
  validateBorrow,
  validateReturn,
  validatePeriod,
} from "../middlewares/inventory-validation.js";
import {
  borrowItem,
  returnItem,
  usageReport,
  borrowAnalysis,
} from "../controllers/borrow.controller.js";

const router = express.Router();

// POST - Peminjaman barang (User & Admin)
router.post("/borrow", authorize, isUser, validateBorrow, borrowItem);

// POST - Pengembalian barang (User & Admin)
router.post("/return", authorize, isUser, validateReturn, returnItem);

// POST - Laporan penggunaan barang (Admin & User)
router.post("/usage-report", authorize, isUser, validatePeriod, usageReport);

// POST - Analisis barang sering dipinjam & telat (Admin & User)
router.post(
  "/borrow-analysis",
  authorize,
  isUser,
  validatePeriod,
  borrowAnalysis
);

export default router;