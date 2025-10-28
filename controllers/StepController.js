const jwt = require('jsonwebtoken');
const { saveStep, getStep, getAllSteps } = require("../models/stepModel");

// 🔒 Spara steg för en deltagare
const saveStepController = async (req, res) => {
  try {
    // ✅ Läs token från Authorization-header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Ingen eller ogiltig Authorization-header' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    console.log('🔹 Token verifierad:', decoded);

    const { participantId } = req.params;
    if (!participantId) {
      return res.status(400).json({ error: "Deltagar-ID saknas." });
    }

    const { step, username } = req.body;
    if (typeof step !== "number" || step < 1 || step > 5) {
      return res.status(400).json({ error: "Ogiltigt steg, steget måste vara mellan 1 och 5" });
    }

    const user = decoded.username || username || 'Okänd användare';
    console.log(`👤 ${user} sparar steg ${step} för deltagare ${participantId}`);

    await saveStep(participantId, step, user);
    res.status(200).json({ message: "Steget har sparats framgångsrikt" });

  } catch (error) {
    console.error("❌ Fel vid sparande av steg:", error);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Ogiltig eller utgången token' });
    }

    res.status(500).json({ error: "Serverfel vid sparande av steg" });
  }
};

// 🔹 Hämta steg för en deltagare
const getStepController = async (req, res) => {
  try {
    const { participantId } = req.params;
    if (!participantId) {
      return res.status(400).json({ error: "Deltagar-ID saknas." });
    }

    const step = await getStep(participantId);
    res.status(200).json({ step: step ?? 0 });

  } catch (error) {
    console.error("❌ Fel vid hämtning av steg:", error);
    res.status(500).json({ error: "Serverfel vid hämtning av steg" });
  }
};

// 🔹 Hämta alla deltagares steg
const getAllStepsController = async (req, res) => {
  try {
    const steps = await getAllSteps();
    res.status(200).json({ steps });
  } catch (error) {
    console.error("❌ Fel vid hämtning av alla steg:", error);
    res.status(500).json({ error: "Serverfel vid hämtning av alla steg" });
  }
};

module.exports = { saveStepController, getStepController, getAllStepsController };
