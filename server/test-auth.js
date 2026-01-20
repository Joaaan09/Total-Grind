const mongoose = require('mongoose');

// 1. Inspect Env Var deeply
const envURI = process.env.MONGO_URI || '';
console.log('--- DEEP INSPECTION ---');
console.log('Env Var URI-Length:', envURI.length);
// Print first 50 chars as hex to see if there are weird invisible chars
const hex = envURI.split('').slice(0, 50).map(c => c.charCodeAt(0).toString(16)).join(' ');
console.log('Hex Trace:', hex);

// 2. Try HARDCODED credentials directly to rule out ENV issues
const HARDCODED_URI = 'mongodb://admin:password123@mongodb:27017/totalgrind?authSource=admin';
console.log('\n--- TESTING HARDCODED CREDENTIALS ---');
console.log('Target URI:', HARDCODED_URI);

async function run() {
    try {
        console.log('Attempting connection with HARDCODED string...');
        await mongoose.connect(HARDCODED_URI, {
            authSource: 'admin',
            serverSelectionTimeoutMS: 5000,
            family: 4 // Force IPv4
        });
        console.log('✅ Connected successfully with HARDCODED credentials!');
        console.log('CONCLUSION: usage of process.env is corrupted/incorrect.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection Failed even with HARDCODED credentials');
        console.error('Message:', err.message);
        console.error('Code:', err.code);
        console.error('CONCLUSION: Network or Database Server issue.');
        process.exit(1);
    }
}

run();
