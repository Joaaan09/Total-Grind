const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    profilePicture: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ['athlete', 'coach'],
        default: 'athlete'
    },
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    athletes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    coachRequests: [{
        coachId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        coachName: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hashear contraseña antes de guardar
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Devolver usuario sin contraseña
UserSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

module.exports = mongoose.model('User', UserSchema);
