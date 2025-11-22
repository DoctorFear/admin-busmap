// server/routes/authRoutes.js
import express from "express";
import db from "../db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// ================== LOGIN ==================
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ msg: "Thiếu username hoặc mật khẩu" });

  const sql = "SELECT userID, role, passwordHash FROM Users WHERE username = ?";

  db.query(sql, [username], (err, results) => {
    if (err) return res.status(500).json({ msg: "Lỗi truy vấn database" });

    if (!results || results.length === 0)
      return res.status(401).json({ msg: "Username không tồn tại" });

    const user = results[0];

    // So sánh trực tiếp (tạm bỏ hash)
    if (password !== user.passwordHash) {
      return res.status(401).json({ msg: "Sai mật khẩu" });
    }

    const token = jwt.sign(
      { userID: user.userID, role: user.role },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "2h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 2 * 60 * 60 * 1000,
      path:"/",
    });

    return res.json({
      userID: user.userID,
      role: user.role,
      message: "Đăng nhập thành công"
    });
  });
});

// ================== LOGOUT ==================
router.post("/logout", (req, res) => {
  // Xóa cookie token đúng path
  res.clearCookie("token", {
    httpOnly: true,
    secure: fasle,
    sameSite: "lax",
    path: "/",
  });

  return res.status(200).json({ message: "Đăng xuất thành công" });
});


// ================== REGISTER ==================
router.post("/register", (req, res) => {
  console.log(">>> BODY RECEIVED FROM FRONTEND:", req.body);

  // map đúng field từ frontend
  const fullName = req.body.fullName || req.body.name;
  const passwordHash = req.body.passwordHash || req.body.password;
  const email = req.body.email || null;
  const phone = req.body.phone || null;
  const username = req.body.username;
  const role = req.body.role;
  const languagePref = req.body.languagePref || "vi";

  if (!fullName || !username || !passwordHash || !role) {
    return res.status(400).json({ msg: "Thiếu dữ liệu bắt buộc" });
  }

  const checkSql = "SELECT userID FROM Users WHERE username = ?";
  db.query(checkSql, [username], (err, results) => {
    if (err) return res.status(500).json({ msg: "Lỗi database" });

    if (results.length > 0) {
      return res.status(409).json({ msg: "Username đã tồn tại" });
    }

    const insertSql = `
      INSERT INTO Users 
        (fullName, username, passwordHash, email, phone, role, languagePref)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertSql,
      [fullName, username, passwordHash, email, phone, role, languagePref],
      (err2, result) => {
        if (err2) return res.status(500).json({ msg: "Lỗi khi tạo tài khoản" });

        return res.json({ msg: "Đăng ký thành công" });
      }
    );
    
  });
});


export default router;
