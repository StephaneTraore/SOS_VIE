const Broadcast = require('../models/Broadcast');

const AUTHOR_ROLES = ['admin', 'admin_police', 'admin_hospital', 'admin_fire'];

const serviceFromRole = role => {
  switch (role) {
    case 'admin_police':   return 'police';
    case 'admin_hospital': return 'hospital';
    case 'admin_fire':     return 'fire';
    case 'admin':          return 'admin';
    default: return null;
  }
};

// GET /api/broadcasts — list active broadcasts (authenticated)
const listBroadcasts = async (req, res, next) => {
  try {
    const now = new Date();
    const broadcasts = await Broadcast.find({
      isActive: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(broadcasts);
  } catch (err) { next(err); }
};

// GET /api/broadcasts/mine — only broadcasts the current admin has authored
const listMyBroadcasts = async (req, res, next) => {
  try {
    if (!AUTHOR_ROLES.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès interdit' });
    }
    const broadcasts = await Broadcast.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(broadcasts);
  } catch (err) { next(err); }
};

// POST /api/broadcasts — admins & service admins only
const createBroadcast = async (req, res, next) => {
  try {
    const { title, message, category, expiresAt } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: 'Titre et message requis' });
    }
    const broadcast = await Broadcast.create({
      title,
      message,
      category: ['info', 'warning', 'danger'].includes(category) ? category : 'info',
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      author: req.user._id,
      authorName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email,
      authorRole: req.user.role,
      authorService: serviceFromRole(req.user.role),
    });
    res.status(201).json(broadcast);
  } catch (err) { next(err); }
};

// DELETE /api/broadcasts/:id — author or super admin
const deleteBroadcast = async (req, res, next) => {
  try {
    const b = await Broadcast.findById(req.params.id);
    if (!b) return res.status(404).json({ message: 'Annonce introuvable' });
    const isOwner = b.author.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role === 'admin';
    if (!isOwner && !isSuperAdmin) {
      return res.status(403).json({ message: 'Vous ne pouvez supprimer que vos propres annonces' });
    }
    await b.deleteOne();
    res.json({ message: 'Annonce supprimée' });
  } catch (err) { next(err); }
};

module.exports = { listBroadcasts, listMyBroadcasts, createBroadcast, deleteBroadcast };
