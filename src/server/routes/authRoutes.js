import express from "express";
import db from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = express.Router();

// ================== REGISTER ==================
router.post("/register", async (req, res) => {
  console.log(">>> BODY RECEIVED:", req.body);

  try {
    const { fullName, username, password, phone, role, studentName, license } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (!fullName || !username || !password || !role) {
      return res.status(400).json({ msg: "Thiếu dữ liệu bắt buộc" });
    }

    // Kiểm tra username trùng
    const checkSql = "SELECT userID FROM Users WHERE username = ?";
    db.query(checkSql, [username], async (err, results) => {
      if (err) return res.status(500).json({ msg: "Lỗi database" });
      if (results.length > 0) return res.status(409).json({ msg: "Username đã tồn tại" });

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Insert vào Users
      const insertSql = `INSERT INTO Users (fullName, username, passwordHash, phone, role) VALUES (?, ?, ?, ?, ?)`;
      db.query(insertSql, [fullName, username, passwordHash, phone, role], (err2, result) => {
        if (err2) return res.status(500).json({ msg: "Lỗi khi tạo tài khoản" });

        const userID = result.insertId;

        // Logic theo role
        if (role === "parent") {
          // Tạo record Parent
          const parentSql = `INSERT INTO Parent (parentID) VALUES (?)`;
          db.query(parentSql, [userID], (err3) => {
            if (err3) return res.status(500).json({ msg: "Lỗi tạo parent" });

            // Tạo student nếu có studentName
            if (studentName) {
              const studentSql = `INSERT INTO Student (fullName, parentUserID) VALUES (?, ?)`;
              db.query(studentSql, [studentName, userID], (err4) => {
                if (err4) return res.status(500).json({ msg: "Lỗi tạo học sinh" });
                return res.json({ msg: "Đăng ký thành công parent + student" });
              });
            } else {
              return res.json({ msg: "Đăng ký thành công parent" });
            }
          });
        } else if (role === "driver") {
          if (!license) return res.status(400).json({ msg: "Vui lòng nhập giấy phép lái xe" });

          const driverSql = `INSERT INTO Driver (userID, fullName, phoneNumber, driverLicense) VALUES (?, ?, ?, ?)`;
          db.query(driverSql, [userID, fullName, phone, license], (err5) => {
            if (err5) return res.status(500).json({ msg: "Lỗi tạo driver" });
            return res.json({ msg: "Đăng ký thành công driver" });
          });
        } else {
          // admin hoặc role khác
          return res.json({ msg: "Đăng ký thành công" });
        }
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Lỗi server" });
  }
});

// ================== LOGIN ==================
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ msg: "Thiếu username hoặc mật khẩu" });

  const sql = "SELECT userID, role, passwordHash FROM Users WHERE username = ?";
  db.query(sql, [username], async (err, results) => {
    if (err) return res.status(500).json({ msg: "Lỗi database" });
    if (!results || results.length === 0) return res.status(401).json({ msg: "Username không tồn tại" });

    const user = results[0];
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ msg: "Sai mật khẩu" });

    const token = jwt.sign({ userID: user.userID, role: user.role }, process.env.JWT_SECRET || "mysecretkey", { expiresIn: "2h" });

    res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "lax", maxAge: 2*60*60*1000, path: "/" });
    return res.json({ userID: user.userID, role: user.role, message: "Đăng nhập thành công" });
  });
});

// ================== LOGOUT ==================
router.post("/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, secure: false, sameSite: "lax", path: "/" });
  return res.status(200).json({ message: "Đăng xuất thành công" });
});

export default router;
