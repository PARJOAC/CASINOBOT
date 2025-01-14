const mongoose = require('mongoose');

// Definir el esquema del jugador
const PlayerBoostSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    isVip: { type: Boolean, default: false },
    vipExpiration: { type: Date, default: null },
});

PlayerBoostSchema.methods.isVipActive = function() {
    if (!this.isVip) return false;

    if (this.vipExpiration && this.vipExpiration < new Date()) {
        this.isVip = false;
        this.vipExpiration = null;
        this.save();
        return false;
    }

    return true;
};

PlayerBoostSchema.methods.isBoostActive = function(boostType) {
    const boostExpiration = this.boosts.get(boostType);
    if (!boostExpiration) return false;

    if (new Date() > new Date(boostExpiration)) {
        this.boosts.delete(boostType);
        this.save();
        return false;
    }

    return true;
};

const PlayerBoost = mongoose.model('PlayerBoost', PlayerBoostSchema);

module.exports = PlayerBoost;
