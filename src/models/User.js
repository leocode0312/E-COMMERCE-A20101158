const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, minlegth: 2 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true }

}, { timestamps: true });

// Hash para la contraseña antes de guardar
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const rounds = parseInt(process.env.SALT_ROUNDS || '10', 10);
    const salt = await bcrypt.genSalt(rounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.comparePassword = function(candidate) {
    return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', UserSchema);
