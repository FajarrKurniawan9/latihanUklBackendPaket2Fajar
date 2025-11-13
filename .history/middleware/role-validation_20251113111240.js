export const isAdmin = async (req, res, next) => {
  if (req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      auth: false,
      message: "Akses ditolak. Hanya admin yang dapat mengakses",
    });
  }
};

export const isUser = async (req, res, next) => {
  if (req.user.role === "user" || req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      auth: false,
      message: "Akses ditolak. Role tidak valid",
    });
  }
};