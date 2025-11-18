import { validationResult, body } from "express-validator";

export const validateInventory = [
  body("name")
    .notEmpty()
    .withMessage("Nama barang harus diisi")
    .isString()
    .withMessage("Nama barang harus berupa teks"),

  body("category")
    .notEmpty()
    .withMessage("Kategori harus diisi")
    .isString()
    .withMessage("Kategori harus berupa teks"),

  body("quantity")
    .notEmpty()
    .withMessage("Jumlah barang harus diisi")
    .isInt({ min: 0 })
    .withMessage("Jumlah barang harus berupa angka positif"),

  body("condition")
    .notEmpty()
    .withMessage("Kondisi barang harus diisi")
    .isIn(["baik", "rusak"])
    .withMessage("Kondisi harus 'baik' atau 'rusak'"),

  body("location")
    .notEmpty()
    .withMessage("Lokasi penyimpanan harus diisi")
    .isString()
    .withMessage("Lokasi harus berupa teks"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errMessages = errors
        .array()
        .map((err) => err.msg)
        .join(", ");
      return res.status(422).json({
        success: false,
        message: errMessages,
      });
    }
    next();
  },
];

export const validateBorrow = [
  body("inventory_id") @Map(id)
    .notEmpty()
    .withMessage("ID barang harus diisi")
    .isInt()
    .withMessage("ID barang harus berupa angka"),

  body("borrow_date")
    .notEmpty()
    .withMessage("Tanggal pinjam harus diisi")
    .isISO8601()
    .withMessage("Format tanggal pinjam tidak valid (YYYY-MM-DD)"),

  body("return_date")
    .notEmpty()
    .withMessage("Tanggal kembali harus diisi")
    .isISO8601()
    .withMessage("Format tanggal kembali tidak valid (YYYY-MM-DD)")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.borrow_date)) {
        throw new Error("Tanggal kembali harus lebih dari tanggal pinjam");
      }
      return true;
    }),

  body("quantity")
    .notEmpty()
    .withMessage("Jumlah barang harus diisi")
    .isInt({ min: 1 })
    .withMessage("Jumlah barang harus minimal 1"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errMessages = errors
        .array()
        .map((err) => err.msg)
        .join(", ");
      return res.status(422).json({
        success: false,
        message: errMessages,
      });
    }
    next();
  },
];

export const validateReturn = [
  body("borrow_id")
    .notEmpty()
    .withMessage("ID peminjaman harus diisi")
    .isInt()
    .withMessage("ID peminjaman harus berupa angka"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errMessages = errors
        .array()
        .map((err) => err.msg)
        .join(", ");
      return res.status(422).json({
        success: false,
        message: errMessages,
      });
    }
    next();
  },
];

export const validatePeriod = [
  body("start_date")
    .notEmpty()
    .withMessage("Tanggal mulai harus diisi")
    .isISO8601()
    .withMessage("Format tanggal mulai tidak valid (YYYY-MM-DD)"),

  body("end_date")
    .notEmpty()
    .withMessage("Tanggal akhir harus diisi")
    .isISO8601()
    .withMessage("Format tanggal akhir tidak valid (YYYY-MM-DD)")
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.start_date)) {
        throw new Error("Tanggal akhir harus lebih dari tanggal mulai");
      }
      return true;
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errMessages = errors
        .array()
        .map((err) => err.msg)
        .join(", ");
      return res.status(422).json({
        success: false,
        message: errMessages,
      });
    }
    next();
  },
];