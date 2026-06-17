const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/quickservices';
        const conn = await mongoose.connect(uri);
        const usersCollection = conn.connection.db.collection('users');
        const indexes = await usersCollection.indexes();
        const legacyPhoneIndex = indexes.find(index => index.name === 'phone_1');
        if (legacyPhoneIndex) {
            await usersCollection.dropIndex('phone_1');
            console.log('✔ Dropped legacy unique index on users.phone');
        }
        console.log(`✅ MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
    } catch (error) {
        console.error(`❌ MongoDB Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDb;