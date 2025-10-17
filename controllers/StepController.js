const { saveStep, getStep, getAllSteps } = require("../models/stepModel"); // Importera modellerna

// Funktion för att spara steg
const saveStepController = async (req, res) => {
  try {
    const { participantId } = req.params;
    if (!participantId) {
      return res.status(400).json({ error: "Deltagar-ID saknas." });
    }

    const { step, username } = req.body; // Hämta step + username

    if (!username) {
      return res.status(400).json({ error: "Användarnamn saknas." });
    }

    if (typeof step !== "number" || step < 1 || step > 5) {
      return res.status(400).json({ error: "Ogiltigt steg, steget måste vara mellan 1 och 5" });
    }

    console.log(`👤 Användare: ${username} sparar steg ${step} för deltagare ${participantId}`);

    await saveStep(participantId, step, username); // Skicka med username
    res.status(200).json({ message: "Steget har sparats framgångsrikt" });
  } catch (error) {
    console.error("❌ Fel vid sparande av steg:", error);
    res.status(500).json({ error: "Serverfel vid sparande av steg" });
  }
};

// Funktion för att hämta deltagarens steg
const getStepController = async (req, res) => {
  try {
    const { participantId } = req.params;
    if (!participantId) {
      return res.status(400).json({ error: "Deltagar-ID saknas." });
    }

    const step = await getStep(participantId);
    if (step === null || step === undefined) {
      return res.status(200).json({ step: 0 });
    }

    res.status(200).json({ step });
  } catch (error) {
    console.error("❌ Fel vid hämtning av steg:", error);
    res.status(500).json({ error: "Serverfel vid hämtning av steg" });
  }
};

// Funktion för att hämta alla deltagares steg
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
