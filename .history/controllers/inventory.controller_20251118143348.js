import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/inventory - Tambah barang baru
export const addInventory = async (req, res) => {
  try {
    const { name, category, quantity, condition, location } = req.body;

    const newInventory = await prisma.inventory.create({
      data: {
        name,
        category,
        quantity: parseInt(quantity),
        condition,
        location,
      },
    });

    res.status(201).json({
      success: true,
      message: "Barang berhasil ditambahkan",
      data: newInventory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PUT /api/inventory/:id - Update barang
export const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, quantity, condition, location } = req.body;

    // Cek apakah barang ada
    const inventory = await prisma.inventory.findUnique({
      where: { id: parseInt(id) },
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Barang tidak ditemukan",
      });
    }

    // Update barang
    const updatedInventory = await prisma.inventory.update({
      where: { id: parseInt(id) },
      data: {
        name: name || inventory.name,
        category: category || inventory.category,
        quantity: quantity ? parseInt(quantity) : inventory.quantity,
        condition: condition || inventory.condition,
        location: location || inventory.location,
      },
    });

    res.status(200).json({
      success: true,
      message: "Barang berhasil diupdate",
      data: updatedInventory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/inventory/:id - Ambil data barang berdasarkan ID
export const getInventoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const inventory = await prisma.inventory.findUnique({
      where: { id: parseInt(id) },
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Barang tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Data barang berhasil diambil",
      data: inventory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/inventory - Ambil semua barang (bonus endpoint)
export const getAllInventory = async (req, res) => {
  try {
    const inventory = await prisma.inventory.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      message: "Data semua barang berhasil diambil",
      total: inventory.length,
      data: inventory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
