// server/routes/authRoutes.js

// 1. Import 
import db from "../db.js"
import express from "express";      // Nếu Node chưa cấu hình, có thể dùng: const express = require('express')
import { createServer } from "http";
import { Server } from "socket.io";
import initTrackingSocket from "../sockets/trackingSocket.js";
// Login
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// Route:
import busRoutes from '../routes/busRoutes.js'
import scheduleRoutes from "../routes/scheduleRoutes.js"
import studentsRoutes from "../routes/studentsRoutes.js"
import cors from "cors";
import authRoutes from "../routes/authRoutes.js";
import cookieParser from "cookie-parser";

const router = express.Router();

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log("[Login] - User in login page", email, password)
  if (!email || !password)
    return res.status(400).json({ msg: "Thiếu email hoặc mật khẩu" });

  const sql = "SELECT userID, role, passwordHash FROM Users WHERE email = ? LIMIT 1";
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ msg: "Lỗi truy vấn database" });
    }

    if (!results || results.length === 0)
      return res.status(401).json({ msg: "Email không tồn tại" });

    const user = results[0];
    // ⚠️ Dùng bcrypt nếu password trong DB đã hash, ở đây tạm so sánh trực tiếp
    if (password !== user.passwordHash)
      return res.status(401).json({ msg: "Sai mật khẩu" });

    // 🔑 Tạo JWT token
    const token = jwt.sign(
      { userID: user.userID, role: user.role },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "2h" }
    );

    // Gửi token qua cookie HTTP-only (bảo mật hơn localStorage)
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // đổi thành true nếu dùng HTTPS
      sameSite: "lax",
      maxAge: 2 * 60 * 60 * 1000, // 2h
    });

    return res.json({ userID: user.userID, role: user.role });
  });
});

// 🚪 LOGOUT

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // để true nếu chạy HTTPS
  });
  return res.status(200).json({ message: "Đăng xuất thành công" });
});

export default router;

