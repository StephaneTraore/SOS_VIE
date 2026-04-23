const Facility = require('../models/Facility');

// GET /api/facilities?type=hospital&lat=9.53&lng=-13.67
const getFacilities = async (req, res, next) => {
  try {
    const { type } = req.query;
    const query = { isActive: true };
    if (type && type !== 'all') query.type = type;
    const facilities = await Facility.find(query);
    res.json(facilities);
  } catch (err) {
    next(err);
  }
};

// POST /api/facilities — admin only
const createFacility = async (req, res, next) => {
  try {
    const facility = await Facility.create(req.body);
    res.status(201).json(facility);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/facilities/:id — admin only
const updateFacility = async (req, res, next) => {
  try {
    const facility = await Facility.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!facility) return res.status(404).json({ message: 'Établissement introuvable' });
    res.json(facility);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/facilities/:id — admin only
const deleteFacility = async (req, res, next) => {
  try {
    const facility = await Facility.findByIdAndDelete(req.params.id);
    if (!facility) return res.status(404).json({ message: 'Établissement introuvable' });
    res.json({ message: 'Établissement supprimé' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getFacilities, createFacility, updateFacility, deleteFacility };
