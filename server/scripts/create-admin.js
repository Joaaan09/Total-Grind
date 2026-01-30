/**
 * Script para crear usuario administrador
 * Ejecutar: node scripts/create-admin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Configuración del admin - CAMBIAR ESTAS CREDENCIALES
const ADMIN_EMAIL = 'admin@totalgrind.com';
const ADMIN_PASSWORD = 'AdminSecure2026!';  // Cambiar en producción
const ADMIN_NAME = 'Administrador';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/totalgrind';

// Schema simplificado para el script
const UserSchema = new mongoose.Schema({
    email: String,
    password: String,
    name: String,
    role: String,
    profilePicture: String,
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

async function createAdmin() {
    try {
        console.log('Conectando a MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Conectado a MongoDB');

        // Verificar si ya existe
        const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
        if (existingAdmin) {
            console.log('⚠️  El usuario admin ya existe');
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                await existingAdmin.save();
                console.log('✅ Rol actualizado a admin');
            }
            process.exit(0);
        }

        // Crear hash de contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

        // Crear usuario admin
        const admin = new User({
            email: ADMIN_EMAIL,
            password: hashedPassword,
            name: ADMIN_NAME,
            role: 'admin',
            profilePicture: null
        });

        await admin.save();
        console.log('✅ Usuario administrador creado exitosamente');
        console.log(`   Email: ${ADMIN_EMAIL}`);
        console.log(`   Password: ${ADMIN_PASSWORD}`);
        console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

createAdmin();
