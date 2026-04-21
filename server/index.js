require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// ===== IMPORTAR RUTAS =====
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const blockRoutes = require('./routes/blockRoutes');
const dayRoutes = require('./routes/dayRoutes');
const coachRoutes = require('./routes/coachRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { authMiddleware } = require('./middleware/authMiddleware');
const Progress = require('./models/Progress');

const app = express();

// Trust Proxy (necesario detrás de Nginx / Docker)
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/totalgrind';

// ===== SEGURIDAD =====

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' } // Permitir carga de imágenes
}));

// CORS - restringido en producción y staging
const allowedOrigins = (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging')
  ? [
    'https://total-grind.duckdns.org',
    'http://total-grind.duckdns.org',
    'https://totalgrind.joan-coll.com',
    'http://totalgrind.joan-coll.com'
  ]
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS not allowed'), false);
  },
  credentials: true
}));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20,
  message: { error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100,
  message: { error: 'Demasiadas peticiones. Intenta más tarde.' },
});

app.use(generalLimiter);
app.use(express.json({ limit: '50mb' }));

// ===== RUTAS =====

// Verificación de estado del servidor
app.get('/', (req, res) => res.send('TotalGrind API is running'));

// Autenticación (con rate limiting extra)
app.use('/api/auth', authLimiter, authRoutes);

// Servir archivos de avatar estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas de usuario (/api/user/*)
app.use('/api/user', userRoutes);

// Rutas de bloques (/api/blocks/*)
app.use('/api/blocks', blockRoutes);

// Rutas de días (/api/days/*)
app.use('/api/days', dayRoutes);

// Rutas de entrenador (/api/coach/* y /api/users/role)
app.use('/api/coach', coachRoutes);
app.use('/api/users', coachRoutes); // Para PUT /api/users/role

// Rutas de progreso (/api/progress)
app.get('/api/progress', authMiddleware, async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user._id.toString() });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rutas de administrador (/api/admin/*)
app.use('/api/admin', adminRoutes);

// ===== INICIALIZACIÓN =====

console.log('Connecting to MongoDB...');
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });