// utils/verifyClientToken.js
const jwt = require('jsonwebtoken');

// Middleware to verify client token
const verifyClientToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access token missing or malformed.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token with the same secret as used for signing
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach client details to the request object for later use
    req.client = {
      leadId: decoded.id,
      phone: decoded.phone,
      name: decoded.name,
      city: decoded.city,
      business: decoded.business,
      role: decoded.role,
      status: decoded.status,
    };

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    console.error('Invalid or expired client token:', err);
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = verifyClientToken;
