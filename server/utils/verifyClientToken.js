// utils/verifyClientToken.js
const jwt = require('jsonwebtoken');

// Middleware to verify client token
const verifyClientToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token

    jwt.verify(token, process.env.JWT_SECRET, (err, client) => {
      if (err) {
        console.log("Using JWT secret for verification:", process.env.JWT_SECRET || 'super-secret-key');
        console.error('Token verification failed:', err);
        return res.status(403).json("Token is invalid");
      }
      // Attach client details to the request object for later use
      req.client = {
        phone: client.phone,
        leadId: client.leadId,
        name: client.name,
        city: client.city,
        business: client.business,
        role: client.role,
        status: client.status,
      };
      next();
    });
  } else {
    res.status(401).json("Not authenticated");
  }
  //}
  // if (!authHeader || !authHeader.startsWith('Bearer ')) {
  //   return res.status(401).json({ message: 'Access token missing or malformed.' });
  // }

  // const token = authHeader.split(' ')[1];

  // try {
  //   // Verify the token with the same secret as used for signing
  //   const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
  //   if (!decoded.leadId || !ObjectId.isValid(decoded.leadId)) {
  //     return res.status(400).json({ message: 'Invalid leadId in token' });
  //   }
    
  //   // Proceed to the next middleware or route handler
  //   next();
  // } catch (err) {
  //   console.error('Invalid or expired client token:', err);
  //   return res.status(403).json({ message: 'Invalid or expired token.' });
  // }
};

module.exports = verifyClientToken;
