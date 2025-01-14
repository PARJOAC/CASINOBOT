const PlayerBoost = require('../../mongoDB/Player');

// Comprobar si el jugador sigue siendo VIP
async function checkVipStatus(userId) {
    const player = await PlayerBoost.findOne({ userId: userId });

    if (player && player.isVipActive()) {
        console.log('El jugador sigue siendo VIP');
    } else {
        console.log('El jugador ya no es VIP o no lo ha sido');
    }
}

// Comprobar si un boost sigue activo
async function checkBoostStatus(userId, boostType) {
    const player = await PlayerBoost.findOne({ userId: userId });

    if (player && player.isBoostActive(boostType)) {
        console.log(`${boostType} sigue activo`);
    } else {
        console.log(`${boostType} ya no está activo`);
    }
}
