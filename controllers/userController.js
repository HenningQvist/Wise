// controllers/userController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email och lösenord krävs' });

  const user = await userModel.getUserByEmail(email);
  if (!user) return res.status(404).json({ error: 'Användare inte hittad' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: 'Felaktigt lösenord' });

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'None' : 'Lax',
    maxAge: 8 * 60 * 60 * 1000,
  });

  res.json({ message: 'Inloggning lyckades!', username: user.username, role: user.role });
};

module.exports = { loginUser };
