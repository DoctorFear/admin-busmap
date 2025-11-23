// authRoutes.js
import express from "express";
import db from "../db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// ---------------- LOGIN ----------------
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ msg: "Thiếu username hoặc mật khẩu" });

  const sql = "SELECT userID, fullName, role, passwordHash FROM Users WHERE username = ?";
  db.query(sql, [username], (err, results) => {
    if (err) return res.status(500).json({ msg: "Lỗi database" });
    if (!results || results.length === 0)
      return res.status(401).json({ msg: "Username không tồn tại" });

    const user = results[0];

    if (password !== user.passwordHash)
      return res.status(401).json({ msg: "Sai mật khẩu" });

    req.session.userID = user.userID;
    req.session.role = user.role;
    req.session.fullName = user.fullName;

    const token = jwt.sign(
      { userID: user.userID, role: user.role },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "2h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.json({
      msg: "Đăng nhập thành công",
      userID: user.userID,
      fullName: user.fullName,
      role: user.role,
    });
  });
});

// ---------------- LOGOUT ----------------
router.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ msg: "Không thể đăng xuất" });

    res.clearCookie("connect.sid");
    res.clearCookie("token");

    return res.json({ msg: "Đăng xuất thành công" });
  });
});

// ---------------- CHECK SESSION ----------------
router.get("/session", (req, res) => {
  if (req.session && req.session.userID) {
    return res.json({
      loggedIn: true,
      userID: req.session.userID,
      fullName: req.session.fullName,
      role: req.session.role,
    });
  } else {
    return res.json({ loggedIn: false, msg: "Chưa đăng nhập hoặc session hết hạn" });
  }
});

// ---------------- REGISTER ----------------
router.post("/register", async (req, res) => {
  const { fullName, username, password, phone, role, studentName, license, address } = req.body;

  if (!fullName || !username || !password || !role)
    return res.status(400).json({ msg: "Thiếu dữ liệu bắt buộc" });

  // Mật khẩu >= 6 ký tự
  if (password.length < 6)
    return res.status(400).json({ msg: "Mật khẩu phải ít nhất 6 ký tự" });

  // Số điện thoại
  const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
  if (!phoneRegex.test(phone))
    return res.status(400).json({ msg: "Số điện thoại không hợp lệ" });

  // Biển số xe driver
  if (role === "driver") {
    const licenseRegex = /^([0-9]{2}[A-Z]{1,2}-?[0-9]{3}\.?[0-9]{2})$/;
    if (!licenseRegex.test(license))
      return res.status(400).json({ msg: "Biển số xe không hợp lệ" });
  }

  const checkSql = "SELECT userID FROM Users WHERE username = ?";
  db.query(checkSql, [username], (err, results) => {
    if (err) return res.status(500).json({ msg: "Lỗi database" });
    if (results.length > 0)
      return res.status(409).json({ msg: "Username đã tồn tại" });

    const insertSql = `
      INSERT INTO Users (fullName, username, passwordHash, phone, role)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.query(insertSql, [fullName, username, password, phone, role], (err2, result) => {
      if (err2) return res.status(500).json({ msg: "Lỗi tạo tài khoản" });

      const userID = result.insertId;

      // Parent
      if (role === "parent") {
        const parentSql = "INSERT INTO Parent (parentID, address) VALUES (?, ?)";
        db.query(parentSql, [userID, address], err3 => {
          if (err3) return res.status(500).json({ msg: "Lỗi tạo parent" });

          if (!studentName)
            return res.json({ msg: "Đăng ký parent thành công, chưa có học sinh" });

          const studentSql = "INSERT INTO Student (fullName, parentUserID) VALUES (?, ?)";
          db.query(studentSql, [studentName, userID], err4 => {
            if (err4) return res.status(500).json({ msg: "Lỗi tạo học sinh" });
            return res.json({ msg: "Đăng ký parent + student thành công" });
          });
        });

      } else if (role === "driver") {
        const driverSql = `
          INSERT INTO Driver (userID, fullName, phoneNumber, driverLicense)
          VALUES (?, ?, ?, ?)
        `;
        db.query(driverSql, [userID, fullName, phone, license], err5 => {
          if (err5) return res.status(500).json({ msg: "Lỗi tạo driver" });
          return res.json({ msg: "Đăng ký driver thành công" });
        });

      } else {
        return res.json({ msg: "Đăng ký thành công" });
      }
    });
  });
});

export default router;
