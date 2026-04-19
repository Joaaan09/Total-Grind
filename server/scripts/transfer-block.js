const mongoose = require('mongoose');
const User = require('../models/User');
const TrainingBlock = require('../models/TrainingBlock');

async function run() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.log("----------------------------------------------------------------------------------");
        console.log("Uso: docker exec -it totalgrind-backend node scripts/transfer-block.js <email_entrenador> <email_atleta> [titulo_del_bloque]");
        console.log("Ejemplo para listar bloques:");
        console.log("  docker exec -it totalgrind-backend node scripts/transfer-block.js coach@test.com athlete@test.com");
        console.log("Ejemplo para transferir:");
        console.log("  docker exec -it totalgrind-backend node scripts/transfer-block.js coach@test.com athlete@test.com \"Semana 1 Fuerza\"");
        console.log("----------------------------------------------------------------------------------");
        process.exit(1);
    }

    const coachEmail = args[0].toLowerCase();
    const athleteEmail = args[1].toLowerCase();
    const blockTitle = args.slice(2).join(' '); // Para soportar títulos con espacios si no usan comillas

    // Usa la URI del entorno o la por defecto en Docker
    const mongoUri = process.env.MONGO_URI || 'mongodb://staging_user:staging_password@mongodb_totalgrind:27017/mernapp?authSource=admin';

    try {
        await mongoose.connect(mongoUri);
        console.log('✅ Conectado a la base de datos.');

        const coach = await User.findOne({ email: coachEmail });
        if (!coach) {
            console.log(`❌ No se encontró al entrenador con email: ${coachEmail}`);
            process.exit(1);
        }

        const athlete = await User.findOne({ email: athleteEmail });
        if (!athlete) {
            console.log(`❌ No se encontró al atleta con email: ${athleteEmail}`);
            process.exit(1);
        }

        // Buscar los bloques que pertenecen al entrenador
        const coachBlocks = await TrainingBlock.find({ ownerId: coach._id.toString() });

        if (coachBlocks.length === 0) {
            console.log(`❌ El entrenador ${coach.name} no tiene bloques asignados a sí mismo.`);
            process.exit(1);
        }

        if (!blockTitle) {
            console.log(`\n📋 El entrenador ${coach.name} tiene ${coachBlocks.length} bloques. Por favor, especifica el título de uno para transferirlo:\n`);
            coachBlocks.forEach((b, i) => {
                console.log(`  ${i + 1}. "${b.title}" (Creado: ${b.startDate || 'N/A'})`);
            });
            console.log(`\nEjecuta el script de nuevo añadiendo el título del bloque al final.\n`);
            process.exit(0);
        }

        // Buscar el bloque que coincida parcial o totalmente con el título
        const matchingBlocks = coachBlocks.filter(b => b.title.toLowerCase().includes(blockTitle.toLowerCase()));

        if (matchingBlocks.length === 0) {
            console.log(`❌ No se encontró ningún bloque con el título "${blockTitle}".`);
            process.exit(1);
        }

        if (matchingBlocks.length > 1) {
            console.log(`⚠️ Se encontraron múltiples bloques que coinciden con "${blockTitle}":`);
            matchingBlocks.forEach(b => console.log(`  - "${b.title}"`));
            console.log(`Por favor, sé más específico con el título.`);
            process.exit(1);
        }

        const blockToTransfer = matchingBlocks[0];

        console.log(`\n🔄 Transfiriendo bloque "${blockToTransfer.title}"...`);

        // Actualizar el bloque
        blockToTransfer.ownerId = athlete._id.toString();
        blockToTransfer.source = 'assigned';
        blockToTransfer.assignedBy = coach.name; // o coach._id.toString() dependiendo de cómo lo maneje tu frontend

        await blockToTransfer.save();

        console.log(`✅ ¡Éxito! El bloque "${blockToTransfer.title}" ha sido transferido a ${athlete.name} (${athlete.email}).`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

run();
