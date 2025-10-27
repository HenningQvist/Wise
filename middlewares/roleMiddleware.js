const { getUserById } = require('../models/adminModel'); // Hämta användarinfo från DB

const hasAdminRights = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Ej auktoriserad: Ingen användarinformation tillgänglig' });
    }

    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Användare inte hittad' });
    }

    if (!user.admin) {
      return res.status(403).json({ message: 'Åtkomst förbjuden: Ingen administratörsbehörighet' });
    }

    // Användaren är admin
    next();
  } catch (error) {
    console.error('❌ Fel i hasAdminRights middleware:', error);
    return res.status(500).json({ message: 'Något gick fel vid kontrollering av behörighet' });
  }
};

module.exports = hasAdminRights;
