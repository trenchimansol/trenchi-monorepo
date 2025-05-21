const authenticateToken = (req, res, next) => {
  // For now, we'll skip authentication since we're using wallet addresses
  next();
};

module.exports = { authenticateToken };
