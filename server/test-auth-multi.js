const mongoose = require('mongoose');

const PASSWORD = 'password123';
const HOST = 'mongodb';
const AUTH_DB = 'admin';
const TARGET_DB = 'totalgrind';

// Strategies to test
const strategies = [
    {
        name: 'Check 1: URI with authSource, No Options',
        uri: `mongodb://admin:${PASSWORD}@${HOST}:27017/${TARGET_DB}?authSource=${AUTH_DB}`,
        options: { serverSelectionTimeoutMS: 3000 }
    },
    {
        name: 'Check 2: Clean URI, Options with authSource',
        uri: `mongodb://admin:${PASSWORD}@${HOST}:27017/${TARGET_DB}`,
        options: { authSource: AUTH_DB, serverSelectionTimeoutMS: 3000 }
    },
    {
        name: 'Check 3: Connect to Admin DB directly',
        uri: `mongodb://admin:${PASSWORD}@${HOST}:27017/${AUTH_DB}`,
        options: { serverSelectionTimeoutMS: 3000 }
    }
];

async function testStrategy(strategy) {
    console.log(`\n--- ${strategy.name} ---`);
    console.log(`URI: ${strategy.uri.replace(PASSWORD, '****')}`);
    console.log(`Options:`, strategy.options);

    try {
        await mongoose.connect(strategy.uri, strategy.options);
        console.log('✅ SUCCESS');
        await mongoose.disconnect();
        return true;
    } catch (err) {
        console.log('❌ FAILED');
        console.log('Error:', err.message);
        return false;
    }
}

async function run() {
    console.log('Starting Multi-Strategy Connectivity Test...');

    let success = false;
    for (const s of strategies) {
        if (await testStrategy(s)) {
            success = true;
            console.log('\n!!! FOUND WORKING STRATEGY !!!');
            console.log('Use this configuration in your code.');
            break;
        }
    }

    if (!success) {
        console.log('\n❌ ALL STRATEGIES FAILED. Network or Server issue likely.');
    }
    process.exit(success ? 0 : 1);
}

run();
