const Alert = require('../models/Alert');
const Facility = require('../models/Facility');

const typeToService = {
  medical:  'hospital',
  fire:     'fire',
  flood:    'fire',
  accident: 'police',
  violence: 'police',
  other:    'admin',
};

// GET /api/alerts
const getAlerts = async (req, res, next) => {
  try {
    const { status, type, service, search, sortBy } = req.query;
    const query = {};

    const roleToService = {
      police: 'police', hospital: 'hospital', fire: 'fire',
      admin_police: 'police', admin_hospital: 'hospital', admin_fire: 'fire',
    };
    if (roleToService[req.user.role]) {
      query.service = roleToService[req.user.role];
      if (['admin_police', 'admin_hospital', 'admin_fire'].includes(req.user.role)) {
        // Service admin sees only their facility's alerts
        if (req.user.facility) query.facility = req.user.facility;
      } else {
        // Agents see only alerts assigned to them
        query.responder = req.user._id;
      }
    } else if (service && service !== 'all') {
      query.service = service;
    }

    if (status && status !== 'all') query.status = status;
    if (type && type !== 'all') query.type = type;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
      ];
    }

    const sort = sortBy === 'priority'
      ? { priority: 1, createdAt: -1 }
      : { createdAt: -1 };

    const alerts = await Alert.find(query)
      .sort(sort)
      .populate('citizen', 'firstName lastName phone email')
      .populate('responder', 'firstName lastName phone');

    res.json(alerts);
  } catch (err) {
    next(err);
  }
};

// GET /api/alerts/my — citizen sees only their own alerts
const getMyAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find({ citizen: req.user._id })
      .sort({ createdAt: -1 })
      .populate('citizen', 'firstName lastName phone email')
      .populate('responder', 'firstName lastName phone');
    res.json(alerts);
  } catch (err) {
    next(err);
  }
};

// GET /api/alerts/:id
const getAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('citizen', 'firstName lastName phone email')
      .populate('responder', 'firstName lastName phone');
    if (!alert) return res.status(404).json({ message: 'Alerte introuvable' });
    res.json(alert);
  } catch (err) {
    next(err);
  }
};

// POST /api/alerts
const createAlert = async (req, res, next) => {
  try {
    const { type, title, description, priority, address, city, lat, lng, facilityId } = req.body;

    if (!type || !description || !address) {
      return res.status(400).json({ message: 'Type, description et adresse requis' });
    }

    let facility = null;
    let facilityName = null;
    if (facilityId) {
      const fac = await Facility.findById(facilityId);
      if (fac) { facility = fac._id; facilityName = fac.name; }
    }

    const alert = await Alert.create({
      type,
      title: title || type,
      description,
      priority: priority || 'high',
      service: typeToService[type] || 'admin',
      location: { address, city: city || 'Conakry', lat: lat || null, lng: lng || null },
      citizen: req.user._id,
      facility,
      facilityName,
    });

    await alert.populate('citizen', 'firstName lastName phone email');
    res.status(201).json(alert);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/alerts/:id/status
const updateStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const validStatuses = ['pending', 'assigned', 'in_progress', 'resolved', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    const update = { status };
    if (notes !== undefined) update.notes = notes;
    if (status === 'resolved') update.resolvedAt = new Date();

    const alert = await Alert.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('citizen', 'firstName lastName phone email')
      .populate('responder', 'firstName lastName phone');

    if (!alert) return res.status(404).json({ message: 'Alerte introuvable' });
    res.json(alert);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/alerts/:id/assign
const assignAlert = async (req, res, next) => {
  try {
    // Service admins can assign to a specific agent; agents assign to themselves
    const responderId = req.body.responderId || req.user._id;
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { responder: responderId, status: 'assigned' },
      { new: true }
    )
      .populate('citizen', 'firstName lastName phone email')
      .populate('responder', 'firstName lastName phone');

    if (!alert) return res.status(404).json({ message: 'Alerte introuvable' });
    res.json(alert);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/alerts/:id — admin only
const deleteAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    if (!alert) return res.status(404).json({ message: 'Alerte introuvable' });
    res.json({ message: 'Alerte supprimée' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAlerts, getMyAlerts, getAlert, createAlert, updateStatus, assignAlert, deleteAlert };
