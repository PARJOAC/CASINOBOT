const Player = require("../../mongoDB/Player");
const Guild = require("../../mongoDB/Guild");
const playerGuild = require("../../mongoDB/GuildPlayer");
const { getGuildLanguage } = require("./getGuildLanguage");
const { getInfo } = require("./getInfoSchema");

async function getDataUser(user, guildId) {
    let guildData = await Guild.findOne({ guildId: guildId });
    if (guildData) await getGuildLanguage(guildId);
    if (guildData && guildData.economyType) {
        const PlayerGuild = await playerGuild(guildId);
        let dataUser = await PlayerGuild.findOne({ userId: user });

        if (!dataUser) {
            dataUser = new PlayerGuild(getInfo());
            await dataUser.save();
        }

        return dataUser;
    }

    let dataUser = await Player.findOne({ userId: user });

    if (!dataUser) {
        dataUser = new Player(getInfo());
        await dataUser.save();
    }

    return dataUser;
}

module.exports = {
    getDataUser
};
