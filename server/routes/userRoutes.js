const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/authMiddleware');

// Configurar almacenamiento de Multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/profiles';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // userId-timestamp.extension
    cb(null, req.user._id + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB
});

// Subir avatar de usuario
router.post('/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);

    // Eliminar avatar anterior si existe y es local
    if (user.profilePicture && user.profilePicture.startsWith('/uploads')) {
      const oldPath = path.join(__dirname, '..', user.profilePicture);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Establecer nueva ruta relativa a la raíz del servidor
    const newPath = '/uploads/profiles/' + req.file.filename;
    user.profilePicture = newPath;
    user.markModified('profilePicture');
    await user.save();

    res.json({
      success: true,
      profilePicture: user.profilePicture
    });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Eliminar avatar del usuario
router.delete('/avatar', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.profilePicture && user.profilePicture.startsWith('/uploads')) {
      const oldPath = path.join(__dirname, '..', user.profilePicture);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    user.profilePicture = undefined;
    user.markModified('profilePicture');
    await user.save();

    res.json({ success: true });
  } catch (err) {
    console.error('Avatar delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Actualizar perfil de usuario (nombre)
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'No data to update' });
    }

    const user = await User.findById(req.user._id);
    user.name = name;
    await user.save();

    res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cambiar contraseña
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener invitaciones del usuario
router.get('/invites', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.coachRequests || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Aceptar invitación
router.post('/invites/:coachId/accept', authMiddleware, async (req, res) => {
  try {
    const { coachId } = req.params;
    const user = await User.findById(req.user._id);
    const coach = await User.findById(coachId);

    if (!coach) return res.status(404).json({ error: 'Coach not found' });

    const requestIndex = user.coachRequests.findIndex(r => r.coachId.toString() === coachId);
    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    user.coachId = coachId;
    user.coachRequests = [];
    await user.save();

    if (!coach.athletes.includes(user._id)) {
      coach.athletes.push(user._id);
      await coach.save();
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rechazar invitación
router.post('/invites/:coachId/reject', authMiddleware, async (req, res) => {
  try {
    const { coachId } = req.params;
    const user = await User.findById(req.user._id);
    user.coachRequests = user.coachRequests.filter(r => r.coachId.toString() !== coachId);
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar entrenador (para atletas)
router.delete('/coach', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.coachId) {
      return res.status(400).json({ error: 'No tienes entrenador asignado' });
    }

    const coachId = user.coachId;
    user.coachId = null;
    await user.save();

    const coach = await User.findById(coachId);
    if (coach && coach.athletes) {
      coach.athletes = coach.athletes.filter(id => id.toString() !== user._id.toString());
      await coach.save();
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
