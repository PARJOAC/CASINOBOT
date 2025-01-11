const mongoose = require("mongoose");
const { getInfoSchema } = require("../bot/functions/getInfoSchema");

async function playerGuild(guildId) {
    const modelName = `PlayerGuild_${guildId}`;

    if (mongoose.models[modelName]) {
        return mongoose.models[modelName];
    }

    const PlayerGuildSchema = getInfoSchema();

    const PlayerGuild = mongoose.model(modelName, PlayerGuildSchema);
    return PlayerGuild;
}

module.exports = { playerGuild };
