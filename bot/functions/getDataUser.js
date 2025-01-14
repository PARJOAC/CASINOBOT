const Player = require("../../mongoDB/Player");
const Guild = require("../../mongoDB/Guild");
const { playerGuild } = require("../../mongoDB/GuildPlayer");
const { getDefaultInfo } = require("./getInfoSchema");

async function getDataUser(user, guildId) {
    let guildData = await Guild.findOne({ guildId: guildId });

    if (guildData && guildData.economyType) {
        const PlayerGuild = await playerGuild(guildId);
        let dataUser = await PlayerGuild.findOne({ userId: user });

        if (!dataUser) {
            const defaultInfo = getDefaultInfo();
            defaultInfo.userId = user;
            dataUser = new PlayerGuild(defaultInfo);
            await dataUser.save();
        };

        return dataUser;
    } else {
        let dataUser = await Player.findOne({ userId: user });

        if (!dataUser) {
            const defaultInfo = getDefaultInfo();
            defaultInfo.userId = user;
            dataUser = new Player(defaultInfo);
            await dataUser.save();
        };

        return dataUser;
    }

};

module.exports = { getDataUser };
