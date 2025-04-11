const express = require('express');
const { verifyToken } = require('../utils/auth');

const router = express.Router();

// API for protecting catalogue
router.get('/', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1]; // Bearer <token>
  const decoded = verifyToken(token);

  if (!decoded) return res.status(401).json({ message: 'Invalid or expired token' });

  const catalogueData = [
    { name: 'Product A', price: 100 },
    { name: 'Product B', price: 200 },
    // Add your catalogue here
  ];

  res.json({ catalogue: catalogueData });
});

module.exports = router;
