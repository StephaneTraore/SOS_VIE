const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes     = require('./routes/authRoutes');
const alertRoutes    = require('./routes/alertRoutes');
const userRoutes     = require('./routes/userRoutes');
const facilityRoutes = require('./routes/facilityRoutes');
const errorHandler   = require('./middleware/errorHandler');

const app = express();

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'https://sos-vie-frontend.onrender.com',
];

// Manual CORS — must be first, before helmet
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'SOS Secours API opérationnelle' }));

app.use('/api/auth',       authRoutes);
app.use('/api/alerts',     alertRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/facilities', facilityRoutes);

app.use(errorHandler);

module.exports = app;
