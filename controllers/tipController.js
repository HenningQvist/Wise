const jwt = require('jsonwebtoken');
const TipModel = require('../models/tipModel');

// 🔹 Skapa ett nytt tips
const createTip = async (req, res) => {
  try {
    const token = req.cookies['token'];
    if (!token) return res.status(401).json({ message: 'Ingen token tillhandahållen' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    console.log('🔹 Token verifierad:', decoded);

    const { text, url, expireDate } = req.body;
    if (!text || !expireDate) {
      return res.status(400).json({ message: 'Text och utgångsdatum krävs' });
    }

    const newTip = await TipModel.addTip(text, url || null, expireDate);
    console.log(`✅ Nytt tips skapades: ${text}`);
    res.status(201).json(newTip);
  } catch (error) {
    console.error('❌ Fel vid skapande av tips:', error);
    res.status(500).json({ message: 'Serverfel vid skapande av tips', error: error.message });
  }
};

// 🔹 Hämta alla aktiva tips
const getTips = async (req, res) => {
  try {
    const tips = await TipModel.getTips();
    res.status(200).json(tips);
  } catch (error) {
    console.error('❌ Fel vid hämtning av tips:', error);
    res.status(500).json({ message: 'Serverfel vid hämtning av tips', error: error.message });
  }
};

// 🔹 Ta bort ett tips
const deleteTip = async (req, res) => {
  try {
    const token = req.cookies['token'];
    if (!token) return res.status(401).json({ message: 'Ingen token tillhandahållen' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    console.log('🔹 Token verifierad:', decoded);

    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Tip-ID saknas' });

    await TipModel.deleteTip(id);
    console.log(`✅ Tips med ID ${id} borttaget`);
    res.status(200).json({ message: 'Tip borttaget' });
  } catch (error) {
    console.error('❌ Fel vid borttagning av tips:', error);
    res.status(500).json({ message: 'Serverfel vid borttagning av tips', error: error.message });
  }
};

module.exports = {
  createTip,
  getTips,
  deleteTip,
};
