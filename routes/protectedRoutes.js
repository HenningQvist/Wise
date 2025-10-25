// routes/protectedRoutes.js
const express = require('express');
const passport = require('passport');
const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/protected', (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Ej auktoriserad' });
  res.json({ message: 'Skyddad resurs', user: req.user });
});

module.exports = router;
