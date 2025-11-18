import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/inventory/borrow - Peminjaman barang
export const borrowItem = async (req, res) => {
  try {
    const { inventory_id, borrow_date, return_date, quantity, notes } =
      req.body;
    const userId = req.user.id;

    // Cek apakah barang ada
    const inventory = await prisma.inventory.findUnique({
      where: { id: parseInt(inventory_id) },
    });

    // Cek apakah user ada
    

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Barang tidak ditemukan",
      });
    }

    // Cek stok
    if (inventory.quantity < parseInt(quantity)) {
      return res.status(400).json({
        success: false,
        message: `Stok tidak mencukupi. Stok tersedia: ${inventory.quantity}`,
      });
    }

    // Cek apakah user sudah meminjam barang yang sama dan belum dikembalikan
    const existingBorrow = await prisma.borrow.findFirst({
      where: {
        userId: userId,
        inventoryId: parseInt(inventory_id),
        status: "dipinjam",
      },
    });

    if (existingBorrow) {
      return res.status(400).json({
        success: false,
        message:
          "Anda masih meminjam barang ini. Harap kembalikan terlebih dahulu",
      });
    }

    // Kurangi stok barang
    await prisma.inventory.update({
      where: { id: parseInt(inventory_id) },
      data: {
        quantity: inventory.quantity - parseInt(quantity),
      },
    });

    // Buat record peminjaman
    const borrow = await prisma.borrow.create({
      data: {
        userId: userId,
        inventoryId: parseInt(inventory_id),
        borrowDate: new Date(borrow_date),
        returnDate: new Date(return_date),
        quantity: parseInt(quantity),
        status: "dipinjam",
        notes: notes || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        inventory: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Peminjaman berhasil dicatat",
      data: borrow,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// POST /api/inventory/return - Pengembalian barang
export const returnItem = async (req, res) => {
  try {
    const { borrow_id } = req.body;

    // Cek apakah peminjaman ada
    const borrow = await prisma.borrow.findUnique({
      where: { id: parseInt(borrow_id) },
      include: {
        inventory: true,
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    if (!borrow) {
      return res.status(404).json({
        success: false,
        message: "Data peminjaman tidak ditemukan",
      });
    }

    // Cek apakah sudah dikembalikan
    if (borrow.status === "dikembalikan") {
      return res.status(400).json({
        success: false,
        message: "Barang sudah dikembalikan sebelumnya",
      });
    }

    // Update status peminjaman
    const updatedBorrow = await prisma.borrow.update({
      where: { id: parseInt(borrow_id) },
      data: {
        status: "dikembalikan",
        actualReturnDate: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        inventory: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    });

    // Kembalikan stok
    await prisma.inventory.update({
      where: { id: borrow.inventoryId },
      data: {
        quantity: borrow.inventory.quantity + borrow.quantity,
      },
    });

    // Hitung keterlambatan
    const returnDate = new Date(borrow.returnDate);
    const actualReturnDate = new Date();
    const diffTime = actualReturnDate - returnDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isLate = diffDays > 0;

    res.status(200).json({
      success: true,
      message: isLate
        ? `Pengembalian berhasil. Terlambat ${diffDays} hari`
        : "Pengembalian berhasil tepat waktu",
      data: {
        ...updatedBorrow,
        late_days: isLate ? diffDays : 0,
        is_late: isLate,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// POST /api/inventory/usage-report - Laporan penggunaan barang
export const usageReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.body;

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    // Ambil semua peminjaman dalam periode
    const borrows = await prisma.borrow.findMany({
      where: {
        borrowDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        inventory: true,
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    // Hitung statistik per barang
    const itemStats = {};

    borrows.forEach((borrow) => {
      const itemId = borrow.inventoryId;

      if (!itemStats[itemId]) {
        itemStats[itemId] = {
          inventory_id: itemId,
          inventory_name: borrow.inventory.name,
          category: borrow.inventory.category,
          total_borrowed: 0,
          total_days_borrowed: 0,
          borrow_count: 0,
        };
      }

      itemStats[itemId].total_borrowed += borrow.quantity;
      itemStats[itemId].borrow_count += 1;

      // Hitung total hari dipinjam
      const borrowDate = new Date(borrow.borrowDate);
      const returnDate = borrow.actualReturnDate
        ? new Date(borrow.actualReturnDate)
        : new Date();
      const daysUsed = Math.ceil(
        (returnDate - borrowDate) / (1000 * 60 * 60 * 24)
      );
      itemStats[itemId].total_days_borrowed += daysUsed;
    });

    // Convert ke array dan tambahkan rata-rata
    const report = Object.values(itemStats).map((item) => ({
      ...item,
      average_borrow_duration: (
        item.total_days_borrowed / item.borrow_count
      ).toFixed(2),
    }));

    res.status(200).json({
      success: true,
      message: "Laporan penggunaan barang berhasil dibuat",
      data: {
        period: {
          start_date: start_date,
          end_date: end_date,
        },
        total_transactions: borrows.length,
        report: report,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// POST /api/inventory/borrow-analysis - Analisis barang sering dipinjam & telat
export const borrowAnalysis = async (req, res) => {
  try {
    const { start_date, end_date } = req.body;

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    // Ambil semua peminjaman dalam periode
    const borrows = await prisma.borrow.findMany({
      where: {
        borrowDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        inventory: true,
      },
    });

    // Analisis barang paling sering dipinjam
    const borrowFrequency = {};
    const lateReturns = {};

    borrows.forEach((borrow) => {
      const itemId = borrow.inventoryId;
      const itemName = borrow.inventory.name;

      // Hitung frekuensi peminjaman
      if (!borrowFrequency[itemId]) {
        borrowFrequency[itemId] = {
          inventory_id: itemId,
          inventory_name: itemName,
          category: borrow.inventory.category,
          borrow_count: 0,
          total_quantity_borrowed: 0,
        };
      }
      borrowFrequency[itemId].borrow_count += 1;
      borrowFrequency[itemId].total_quantity_borrowed += borrow.quantity;

      // Hitung keterlambatan
      if (borrow.status === "dikembalikan") {
        const returnDate = new Date(borrow.returnDate);
        const actualReturnDate = new Date(borrow.actualReturnDate);
        const diffTime = actualReturnDate - returnDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
          if (!lateReturns[itemId]) {
            lateReturns[itemId] = {
              inventory_id: itemId,
              inventory_name: itemName,
              category: borrow.inventory.category,
              late_count: 0,
              total_late_days: 0,
            };
          }
          lateReturns[itemId].late_count += 1;
          lateReturns[itemId].total_late_days += diffDays;
        }
      }
    });

    // Sort barang paling sering dipinjam
    const mostBorrowed = Object.values(borrowFrequency)
      .sort((a, b) => b.borrow_count - a.borrow_count)
      .slice(0, 10);

    // Sort barang paling sering telat
    const mostLate = Object.values(lateReturns)
      .map((item) => ({
        ...item,
        average_late_days: (item.total_late_days / item.late_count).toFixed(2),
      }))
      .sort((a, b) => b.late_count - a.late_count)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      message: "Analisis peminjaman berhasil dibuat",
      data: {
        analysis_period: {
          start_date: start_date,
          end_date: end_date,
        },
        most_borrowed_items: mostBorrowed,
        most_late_return_items: mostLate,
        summary: {
          total_borrows: borrows.length,
          total_late_returns: Object.values(lateReturns).reduce(
            (sum, item) => sum + item.late_count,
            0
          ),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
