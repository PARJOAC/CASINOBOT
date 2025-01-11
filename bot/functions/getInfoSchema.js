const mongoose = require("mongoose");

function getDefaultValues() {
    return {
        userId: { type: String, required: true, unique: true },
        balance: { type: Number, default: 20000 },
        level: { type: Number, default: 1 },
        experience: { type: Number, default: 0 },
        maxBet: { type: Number, default: 0 },
        swag: {
            balloons: { type: Number, default: 0 },
            mobile: { type: Number, default: 0 },
            bike: { type: Number, default: 0 },
        },
        lastWork: { type: Number, default: 0 },
        lastDaily: { type: Number, default: 0 },
        lastWeekly: { type: Number, default: 0 },
        lastBlackJack: { type: Number, default: 0 },
        lastCoinFlip: { type: Number, default: 0 },
        lastCrash: { type: Number, default: 0 },
        lastMinesweeper: { type: Number, default: 0 },
        lastRace: { type: Number, default: 0 },
        lastRoulette: { type: Number, default: 0 },
        lastRps: { type: Number, default: 0 },
        lastRussianRoulette: { type: Number, default: 0 },
        lastSlot: { type: Number, default: 0 },
        lastVote: { type: Number, default: 0 },
        lastCrime: { type: Number, default: 0 },
        votes: { type: Number, default: 1 },
    };
};

function getInfoSchema() {
    return new mongoose.Schema(getDefaultValues());
};

function getDefaultInfo() {
    const schemaDefinition = getDefaultValues();
    const defaultInfo = {};

    for (const [key, value] of Object.entries(schemaDefinition)) {
        if (typeof value === "object" && value.default !== undefined) {
            defaultInfo[key] = value.default;
        } else if (typeof value === "object" && !value.default) {
            defaultInfo[key] = {};
            for (const [subKey, subValue] of Object.entries(value)) {
                defaultInfo[key][subKey] = subValue.default;
            };
        };
    };

    return defaultInfo;
}

module.exports = { getInfoSchema, getDefaultInfo };
