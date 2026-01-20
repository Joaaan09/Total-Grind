const { MongoClient } = require('mongodb');

// Configuration
const URI = 'mongodb://app_user:app_password@mongodb:27017/totalgrind';

console.log('--- NATIVE DRIVER TEST ---');
console.log('Target:', URI.replace('app_password', '****'));

async function run() {
    // Mongoose builds on top of this driver. 
    // If this works, Mongoose options are wrong.
    // If this fails, Docker networking or Auth setup is wrong.

    const client = new MongoClient(URI, {
        serverSelectionTimeoutMS: 5000,
        appName: 'DiagnosticScript',
        // Force IPv4 to avoid localhost ::1 issues
        family: 4
    });

    try {
        console.log('Connecting...');
        await client.connect();
        console.log('✅ SUCCESS: Native MongoDB Driver connected!');

        const db = client.db();
        const res = await db.command({ ping: 1 });
        console.log('Ping Result:', res);

        await client.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ FAILED');
        console.error('Error Name:', err.name);
        console.error('Message:', err.message);
        console.error('Code:', err.code);
        if (err.errorResponse) {
            console.error('Server Response:', JSON.stringify(err.errorResponse, null, 2));
        }
        process.exit(1);
    }
}

run();
