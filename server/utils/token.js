const jwt = require('jsonwebtoken');

const generateClientToken = (lead) => {
  return jwt.sign(
    {
      phone: lead.phone,
      leadId: lead._id,
      name: lead.name,
      city: lead.city,
      business: lead.business,
      role: lead.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

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
  generateClientToken,
};
