const TipModel = require('../models/tipModel');

// Skapa ett nytt tips
exports.createTip = async (req, res) => {
  try {
    const { text, url, expireDate } = req.body;
    if (!text || !expireDate) {
      return res.status(400).json({ message: 'Text och utgångsdatum krävs' });
    }

    const newTip = await TipModel.addTip(text, url, expireDate);
    res.status(201).json(newTip);
  } catch (error) {
    res.status(500).json({ message: 'Serverfel', error });
  }
};

// Hämta alla aktiva tips
exports.getTips = async (req, res) => {
  try {
    const tips = await TipModel.getTips();
    res.status(200).json(tips);
  } catch (error) {
    res.status(500).json({ message: 'Serverfel', error });
  }
};

// Ta bort ett tips
exports.deleteTip = async (req, res) => {
  try {
    const { id } = req.params;
    await TipModel.deleteTip(id);
    res.status(200).json({ message: 'Tip borttaget' });
  } catch (error) {
    res.status(500).json({ message: 'Serverfel', error });
  }
};
