const networkModel = require("../models/networkModel");

// Hämta nätverk baserat på participantId
const getNetwork = async (req, res) => {
  const participantId = req.params.id;
  console.log(`Försöker hämta nätverk för participantId: ${participantId}`);

  try {
    const nodes = await networkModel.getNetworkByParticipant(participantId);
    console.log(`Noder hämtade: ${JSON.stringify(nodes)}`);

    // Returnera alltid en array, även om inga noder finns
    res.json(Array.isArray(nodes) ? nodes : []);
  } catch (err) {
    console.error("Fel vid hämtning av nätverk:", err);
    res.status(500).json({ error: "Något gick fel vid hämtning." });
  }
};

// Spara nätverk för en deltagare
const saveNetwork = async (req, res) => {
  try {
    const { participantId, nodes } = req.body;

    if (!participantId || !Array.isArray(nodes)) {
      return res.status(400).json({ message: "Ogiltig data" });
    }

    // Se till att x/y alltid finns
    const safeNodes = nodes.map((n) => ({
      ...n,
      x: n.x ?? n.position?.x ?? 0,
      y: n.y ?? n.position?.y ?? 0,
    }));

    await networkModel.saveNetwork(participantId, safeNodes);
    res.status(200).json({ message: "Nätverk sparat" });
  } catch (err) {
    console.error("Fel vid sparande av nätverk:", err);
    res.status(500).json({ message: "Serverfel" });
  }
};

module.exports = {
  getNetwork,
  saveNetwork,
};
