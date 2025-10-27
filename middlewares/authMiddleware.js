const jwt = require('jsonwebtoken');

// 🔒 Middleware för att skydda routes med JWT i Authorization-header
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Ingen token, åtkomst nekad' });
  }

  const token = authHeader.split(' ')[1]; // Bearer <token>

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Här ligger id, username, role, admin, participant_id
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Ogiltig eller utgången token' });
  }
};

module.exports = { authenticateUser };
