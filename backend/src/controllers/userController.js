const User = require('../models/User');

// Roles each admin type is allowed to create
const CREATABLE_BY = {
  admin:         ['admin_police', 'admin_hospital', 'admin_fire', 'responder', 'citizen', 'police', 'hospital', 'fire'],
  admin_police:  ['police'],
  admin_hospital:['hospital'],
  admin_fire:    ['fire'],
};

const ROLE_TO_SERVICE = {
  police: 'police', hospital: 'hospital', fire: 'fire',
  admin_police: 'police', admin_hospital: 'hospital', admin_fire: 'fire',
};

// GET /api/users
const getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const query = {};

    // Service admins see only their facility's agents
    if (['admin_police', 'admin_hospital', 'admin_fire'].includes(req.user.role)) {
      query.service = ROLE_TO_SERVICE[req.user.role];
      if (req.user.facility) query.facility = req.user.facility;
    } else if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName:  { $regex: search, $options: 'i' } },
        { email:     { $regex: search, $options: 'i' } },
        { phone:     { $regex: search, $options: 'i' } },
      ];
    }
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// POST /api/users/create — admin creates account for another user
const createUserByAdmin = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password, role, facilityId } = req.body;
    const creatorRole = req.user.role;
    const allowed = CREATABLE_BY[creatorRole] || [];

    if (!allowed.includes(role)) {
      return res.status(403).json({ message: `Vous n'êtes pas autorisé à créer un compte de type « ${role} »` });
    }
    if (!firstName || !lastName || !password) {
      return res.status(400).json({ message: 'Prénom, nom et mot de passe requis' });
    }
    if (!email && !phone) {
      return res.status(400).json({ message: 'Email ou numéro de téléphone requis' });
    }
    if (email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(409).json({ message: 'Cet email est déjà utilisé' });
    }
    if (phone) {
      const exists = await User.findOne({ phone });
      if (exists) return res.status(409).json({ message: 'Ce numéro est déjà utilisé' });
    }

    // Super admin can specify facilityId directly; service admins pass theirs down
    let facility = req.user.facility || null;
    let facilityName = req.user.facilityName || null;
    if (req.user.role === 'admin' && facilityId) {
      const Facility = require('../models/Facility');
      const fac = await Facility.findById(facilityId);
      if (fac) { facility = fac._id; facilityName = fac.name; }
    }

    const user = await User.create({
      firstName, lastName, email, phone, password,
      role,
      service: ROLE_TO_SERVICE[role] || null,
      facility,
      facilityName,
    });
    res.status(201).json(user.toPublic());
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/:id
const updateUser = async (req, res, next) => {
  try {
    const allowed = ['firstName', 'lastName', 'email', 'phone', 'role', 'isActive', 'service'];
    const update = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const allowed = ['firstName', 'lastName', 'phone'];
    const update = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, getUser, updateUser, deleteUser, updateProfile, createUserByAdmin };
