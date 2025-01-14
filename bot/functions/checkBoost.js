const PlayerBoost = require('../../mongoDB/Player');

// Comprobar si el jugador sigue siendo VIP
async function checkVipStatus(userId) {
    const player = await PlayerBoost.findOne({ userId: userId });

    if (player && player.isVipActive()) {
        return true
    } else {
        return false;
    }
}

// Comprobar si un boost sigue activo
async function checkBoostStatus(userId) {
    const player = await PlayerBoost.findOne({ userId: userId });

    if (player && player.isBoostActive(boostType)) {
        return true;
    } else {
        return false;
    }
}

module.exports = { checkVipStatus, checkBoostStatus };
