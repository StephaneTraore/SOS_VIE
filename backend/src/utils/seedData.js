const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Facility = require('../models/Facility');
const connectDB = require('../config/db');

const facilitiesData = [
  { name: 'CHU Donka',             type: 'hospital', address: 'Donka, Conakry',    city: 'Conakry', phone: '+224 628 000 001', lat: 9.5604, lng: -13.6773 },
  { name: 'Hôpital Ignace Deen',   type: 'hospital', address: 'Kaloum, Conakry',   city: 'Conakry', phone: '+224 628 000 002', lat: 9.5370, lng: -13.6814 },
  { name: 'Clinique Ambroise Paré',type: 'hospital', address: 'Dixinn, Conakry',   city: 'Conakry', phone: '+224 628 000 003', lat: 9.5530, lng: -13.6500 },
  { name: 'Hôpital de Nongo',      type: 'hospital', address: 'Ratoma, Conakry',   city: 'Conakry', phone: '+224 628 000 004', lat: 9.6050, lng: -13.6400 },
  { name: 'Commissariat Kaloum',   type: 'police',   address: 'Kaloum, Conakry',   city: 'Conakry', phone: '+224 628 100 001', lat: 9.5340, lng: -13.6780 },
  { name: 'Commissariat Ratoma',   type: 'police',   address: 'Ratoma, Conakry',   city: 'Conakry', phone: '+224 628 100 002', lat: 9.6020, lng: -13.6300 },
  { name: 'Commissariat Dixinn',   type: 'police',   address: 'Dixinn, Conakry',   city: 'Conakry', phone: '+224 628 100 003', lat: 9.5500, lng: -13.6450 },
  { name: 'Commissariat Matam',    type: 'police',   address: 'Matam, Conakry',    city: 'Conakry', phone: '+224 628 100 004', lat: 9.5700, lng: -13.6200 },
  { name: 'Caserne Kaloum',        type: 'fire',     address: 'Kaloum, Conakry',   city: 'Conakry', phone: '+224 628 200 001', lat: 9.5360, lng: -13.6800 },
  { name: 'Caserne Ratoma',        type: 'fire',     address: 'Ratoma, Conakry',   city: 'Conakry', phone: '+224 628 200 002', lat: 9.6000, lng: -13.6280 },
  { name: 'Caserne Matoto',        type: 'fire',     address: 'Matoto, Conakry',   city: 'Conakry', phone: '+224 628 200 003', lat: 9.5800, lng: -13.5900 },
];

const seed = async () => {
  await connectDB();

  console.log('Nettoyage de la base...');
  await User.deleteMany({});
  await Facility.deleteMany({});

  console.log('Création des établissements...');
  const facilities = await Facility.insertMany(facilitiesData);

  // Build lookup map by name
  const fac = {};
  facilities.forEach(f => { fac[f.name] = f; });

  console.log('Création des utilisateurs...');
  const seedUsers = [
    // Super Admin — no facility restriction
    { firstName: 'Super',       lastName: 'Admin',    email: 'admin@sos.gn',          password: 'admin123',        role: 'admin' },

    // Service Admins — each linked to a specific facility
    { firstName: 'Commissaire', lastName: 'Kouyaté',  email: 'admin.police@sos.gn',   password: 'adminpolice123',  role: 'admin_police',   service: 'police',   facility: fac['Commissariat Kaloum']._id,   facilityName: 'Commissariat Kaloum' },
    { firstName: 'Dr. Mariama', lastName: 'Sylla',    email: 'admin.hopital@sos.gn',  password: 'adminhopital123', role: 'admin_hospital', service: 'hospital', facility: fac['CHU Donka']._id,              facilityName: 'CHU Donka' },
    { firstName: 'Commandant',  lastName: 'Bah',      email: 'admin.pompiers@sos.gn', password: 'adminfire123',    role: 'admin_fire',     service: 'fire',     facility: fac['Caserne Kaloum']._id,         facilityName: 'Caserne Kaloum' },

    // Agents — linked to same facility as their admin
    { firstName: 'Inspecteur',  lastName: 'Diallo',   email: 'police@sos.gn',         password: 'police123',       role: 'police',   service: 'police',   facility: fac['Commissariat Kaloum']._id,   facilityName: 'Commissariat Kaloum' },
    { firstName: 'Dr.',         lastName: 'Camara',   email: 'hopital@sos.gn',        password: 'hopital123',      role: 'hospital', service: 'hospital', facility: fac['CHU Donka']._id,              facilityName: 'CHU Donka' },
    { firstName: 'Capitaine',   lastName: 'Soumah',   email: 'pompiers@sos.gn',       password: 'pompiers123',     role: 'fire',     service: 'fire',     facility: fac['Caserne Kaloum']._id,         facilityName: 'Caserne Kaloum' },

    // Citizens & Responders
    { firstName: 'Mamadou',     lastName: 'Barry',    email: 'citoyen@sos.gn',        password: 'citoyen123',      role: 'citizen' },
    { firstName: 'Ibrahim',     lastName: 'Baldé',    email: 'secouriste@sos.gn',     password: 'secours123',      role: 'responder' },
  ];

  for (const u of seedUsers) {
    await User.create(u);
  }

  console.log('\n✅ Seed terminé avec succès !');
  console.log('\nComptes disponibles :');
  seedUsers.forEach(u => {
    const fName = u.facilityName ? ` [${u.facilityName}]` : '';
    console.log(`  ${u.role.padEnd(14)} — ${u.email.padEnd(28)} / ${u.password}${fName}`);
  });

  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
