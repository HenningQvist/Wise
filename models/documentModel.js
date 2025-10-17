const path = require("path");
const pool = require("../config/database");

const saveDocument = async ({ participant_id, filename, filepath }) => {
  try {
    console.log("Sparar dokument med participant_id:", participant_id);

    // Omvandla till relativ webbsökväg
    const webPath = `/uploads/documents/${path.basename(filepath)}`;

    const result = await pool.query(
      'INSERT INTO documents (participant_id, filename, filepath) VALUES ($1, $2, $3) RETURNING *',
      [participant_id, filename, webPath]
    );

    return result.rows[0];
  } catch (error) {
    console.error("❌ Error saving document:", error);
    throw error;
  }
};

const getDocumentsByParticipant = async (participantId) => {
  const result = await pool.query(
    `SELECT * FROM documents WHERE participant_id = $1`,
    [participantId]
  );
  return result.rows;
};

module.exports = {
  saveDocument,
  getDocumentsByParticipant,
};
