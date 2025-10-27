const { getUserById } = require('../models/adminModel');  // Importera getUserById-funktionen

const hasAdminRights = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Ej auktoriserad: Ingen användarinformation tillgänglig' });
    }

    const userId = req.user.id; // Hämta användarens ID från den autentiserade användaren (från token)

    // Hämta användaren från databasen
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Användare inte hittad' });
    }

    // Kontrollera om användaren har admin: true
    if (user.admin) {
      return next(); // Om användaren är admin, tillåt åtkomst
    }

    return res.status(403).json({ message: 'Åtkomst förbjuden: Ingen administratörsbehörighet' });
  } catch (error) {
    console.error('Error i hasAdminRights middleware:', error);
    return res.status(500).json({ message: 'Något gick fel vid kontrollering av behörighet' });
  }
};

module.exports = hasAdminRights; // Exportera som en funktion istället för ett objekt
