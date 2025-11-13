import { PrismaClient } from "@prisma/client";
import md5 from "md5";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || "r4h4s14_1nv3nt0ry_s3k0l4h_2024";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validasi input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username dan password harus diisi",
      });
    }

    // Cari user
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Username tidak ditemukan",
      });
    }

    // Cek password
    if (user.password !== md5(password)) {
      return res.status(401).json({
        success: false,
        message: "Password salah",
      });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      SECRET_KEY,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      success: true,
      logged: true,
      message: "Login berhasil",
      token: token,
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const authorize = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        auth: false,
        message: "Token tidak ditemukan",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        auth: false,
        message: "Format token salah",
      });
    }

    const verifiedUser = jwt.verify(token, SECRET_KEY);

    if (!verifiedUser) {
      return res.status(401).json({
        success: false,
        auth: false,
        message: "Token tidak valid",
      });
    }

    req.user = verifiedUser;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        auth: false,
        message: "Token tidak valid",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        auth: false,
        message: "Token sudah kadaluarsa",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

expor