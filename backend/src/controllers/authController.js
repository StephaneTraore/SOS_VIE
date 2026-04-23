const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password, loginMethod, role: reqRole } = req.body;
    const role = ['citizen', 'responder'].includes(reqRole) ? reqRole : 'citizen';

    if (!firstName || !lastName || !password) {
      return res.status(400).json({ message: 'Prénom, nom et mot de passe requis' });
    }

    if (loginMethod === 'phone') {
      if (!phone) return res.status(400).json({ message: 'Numéro de téléphone requis' });
      const exists = await User.findOne({ phone });
      if (exists) return res.status(409).json({ message: 'Ce numéro est déjà utilisé' });
    } else {
      if (!email) return res.status(400).json({ message: 'Email requis' });
      const exists = await User.findOne({ email });
      if (exists) return res.status(409).json({ message: 'Cet email est déjà utilisé' });
    }

    const user = await User.create({ firstName, lastName, email, phone, password, role });
    const token = generateToken(user._id);

    res.status(201).json({ token, user: user.toPublic() });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Identifiant et mot de passe requis' });
    }

    const isPhone = /^[\d\s+]+$/.test(identifier) && !identifier.includes('@');
    const query = isPhone ? { phone: identifier } : { email: identifier.toLowerCase() };
    const user = await User.findOne(query);

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Compte désactivé' });
    }

    const token = generateToken(user._id);
    res.json({ token, user: user.toPublic() });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: req.user.toPublic() });
};

module.exports = { register, login, getMe };
