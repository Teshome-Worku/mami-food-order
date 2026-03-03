const express = require("express");
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config/jwt");

const router = express.Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "mamifood@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "123456";

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { role: "admin", email: ADMIN_EMAIL },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  return res.json({ token });
});

module.exports = router;
