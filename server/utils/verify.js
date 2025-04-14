const jwt = require('jsonwebtoken');

const verify = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"
    console.log('Token:', token); // Log the token for debugging

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.log("Using JWT secret for verification:", process.env.JWT_SECRET || 'super-secret-key');
        console.error('Token verification failed:', err);
        return res.status(403).json("Token is invalid");
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json("Not authenticated");
  }
};


module.exports = verify;
