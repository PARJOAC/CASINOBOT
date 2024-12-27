const mongoose = require("mongoose");
const { infoSchema } = require("./info");

async function playerGuild(guildId) {
    const modelName = `PlayerGuild_${guildId}`;

    if (mongoose.models[modelName]) {
        return mongoose.models[modelName];
    }

    const PlayerGuildSchema = new mongoose.Schema({
        infoSchema
    });

    const PlayerGuild = mongoose.model(modelName, PlayerGuildSchema);
    return PlayerGuild;
}

module.exports = playerGuild;
