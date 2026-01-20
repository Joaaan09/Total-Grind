const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/totalgrind';

console.log('--- TEST DB START ---');
console.log('URI:', MONGO_URI);

const TestSchema = new mongoose.Schema({ name: String });
const TestModel = mongoose.model('Test', TestSchema);

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected successfully');

        console.log('Attempting insert...');
        const doc = await TestModel.create({ name: 'test-entry' });
        console.log('Insert success:', doc);

        console.log('Attempting find...');
        const found = await TestModel.findOne({ _id: doc._id });
        console.log('Find success:', found);

        console.log('Attempting delete...');
        await TestModel.deleteOne({ _id: doc._id });
        console.log('Delete success');

        console.log('--- TEST PASSED ---');
        process.exit(0);
    } catch (err) {
        console.error('--- TEST FAILED ---');
        console.error(err);
        process.exit(1);
    }
}

run();
