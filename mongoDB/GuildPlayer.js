const mongoose = require("mongoose");
const { createInfoSchema } = require("./info");

async function playerGuild(guildId) {
    const modelName = `PlayerGuild_${guildId}`;

    if (mongoose.models[modelName]) {
        return mongoose.models[modelName];
    }

    const PlayerGuildSchema = createInfoSchema();

    const PlayerGuild = mongoose.model(modelName, PlayerGuildSchema);
    return PlayerGuild;
}

module.exports = playerGuild;
