const path = require("path");
const documentModel = require('../models/documentModel');

// ✅ Ladda upp dokument
const uploadDocuments = async (req, res) => {
  try {
    console.log("Mottagna filer:", req.files);
    console.log("Mottaget participantId:", req.body.participantId);

    const files = req.files;
    const participantId = req.body.participantId;

    if (!participantId) {
      console.error("❌ ParticipantId saknas i förfrågan.");
      return res.status(400).json({ error: 'ParticipantId saknas' });
    }

    const savedFiles = await Promise.all(
      files.map(file => {
        const webPath = `/uploads/documents/${path.basename(file.path)}`;
        console.log(`Sparar fil: ${file.originalname}, participantId: ${participantId}, webPath: ${webPath}`);
        return documentModel.saveDocument({
          participant_id: participantId,
          filename: file.originalname,
          filepath: webPath
        });
      })
    );

    console.log("Sparade filer:", savedFiles);
    res.status(200).json({ message: 'Filer uppladdade', savedFiles });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ error: 'Fel vid filuppladdning' });
  }
};

// ✅ Hämta dokument för en specifik participant
const getDocuments = async (req, res) => {
  const { participantId } = req.params;

  try {
    const documents = await documentModel.getDocumentsByParticipant(participantId);
    res.status(200).json(documents);
  } catch (error) {
    console.error("❌ Get docs error:", error);
    res.status(500).json({ message: 'Fel vid hämtning av dokument' });
  }
};

// ✅ Exportera funktionerna
module.exports = {
  uploadDocuments,
  getDocuments
};
