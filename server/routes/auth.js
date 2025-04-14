const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const { generateAccessToken, generateRefreshToken } = require('../utils/token');
const verify = require('../utils/verify');

let refreshTokens = ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE3NDQ2Mjg3MjR9.8p3GMVMRvpTxHmrihy6olzdPwFi9rTPXtOxSVEDHSSE']; // In production, store in DB/Redis

// Dummy users (replace with DB lookup in real apps)
const users = [
  { id: "1", username: "admin", password: "admin123", isAdmin: true },
  { id: "2", username: "agent", password: "agent123", isAdmin: false },
];

// Login route
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username && u.password === password);

  if (user) {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.push(refreshToken);

    res.json({
      username: user.username,
      isAdmin: user.isAdmin,
      accessToken,
      refreshToken,
    });
  } else {
    res.status(401).json("Invalid credentials");
  }
});

// Token refresh route
router.post("/refresh", (req, res) => {
  const refreshToken = req.body.token;
  if (!refreshToken) return res.status(401).json("Not authenticated");
  if (!refreshTokens.includes(refreshToken)) return res.status(403).json("Invalid refresh token");

  jwt.verify(refreshToken, process.env.REFRESH_SECRET || "myRefreshSecretKey", (err, user) => {
    if (err) return res.status(403).json("Token error");

    refreshTokens.splice(refreshTokens.indexOf(refreshToken), 1); // remove old
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    refreshTokens.push(newRefreshToken);

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });
});

// Logout
router.post("/logout", (req, res) => {
  const refreshToken = req.body.token;

  if (!refreshToken) {
    return res.sendStatus(400); // Bad request
  }

  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.status(200).json("Logged out successfully");
});

router.get("/checkTokens", (req, res) => {
  res.status(200).json(refreshTokens);
});

module.exports = router;
