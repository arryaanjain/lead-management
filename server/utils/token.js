const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
  console.log("Using JWT secret for signing:", process.env.JWT_SECRET);
  return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {
    expiresIn: '30m',
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, process.env.REFRESH_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
