const mongoose = require('mongoose');

// Usar la variable de entorno directamente, igual que la app
const MONGO_URI = process.env.MONGO_URI;

console.log('--- TEST AUTH START ---');
// Ocultar contraseña en logs para seguridad
console.log('URI IS DEFINED:', !!MONGO_URI);
if (MONGO_URI) {
    console.log('URI PATTERN:', MONGO_URI.replace(/:([^:@]{1,})@/, ':****@'));
}

async function run() {
    if (!MONGO_URI) {
        console.error('ERROR: MONGO_URI is not defined');
        process.exit(1);
    }

    try {
        // Conexión simple sin opciones extra (Mongoose 6+ usa defaults sanos)
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected successfully to MongoDB!');

        // Verificar estado
        const admin = new mongoose.mongo.Admin(mongoose.connection.db);
        const buildInfo = await admin.buildInfo();
        console.log('MongoDB Version:', buildInfo.version);

        console.log('--- TEST PASSED ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ CONNECTION FAILED');
        console.error('Error Name:', err.name);
        console.error('Error Code:', err.code);
        console.error('Error CodeName:', err.codeName);
        console.error('Full Error:', err);
        process.exit(1);
    }
}

run();
