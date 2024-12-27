const Player = require("../../mongoDB/Player");
const Guild = require("../../mongoDB/Guild");
const playerGuild = require("../../mongoDB/GuildPlayer");
const { getGuildLanguage } = require("./getGuildLanguage");

async function getDataUser(user, guildId) {
    let guildData = await Guild.findOne({ guildId: guildId });
    if (guildData) await getGuildLanguage(guildId);
    if (guildData && guildData.economyType) {
        const PlayerGuild = await playerGuild(guildId);
        let dataUser = await PlayerGuild.findOne({ userId: user });

        if (!dataUser) {
            dataUser = new PlayerGuild({
                userId: user,
                balance: 20000,
                level: 1,
                experience: 0,
                maxBet: 0,
                swag: {
                    balloons: 0,
                    mobile: 0,
                    jamon: 0,
                    paella: 0,
                    guitarra: 0,
                    torero: 0,
                    flamenco: 0,
                    siesta: 0,
                    cava: 0,
                    castanuelas: 0,
                    sombrero: 0,
                    sagradaFamilia: 0,
                    soccerBall: 0,
                    wine: 0,
                    sol: 0,
                    spanishFlag: 0,
                    mate: 0,
                },
                lastWork: 0,
                lastDaily: 0,
                lastWeekly: 0,
                lastBlackJack: 0,
                lastCoinFlip: 0,
                lastCrash: 0,
                lastMinesweeper: 0,
                lastRace: 0,
                lastRoulette: 0,
                lastRps: 0,
                lastRussianRoulette: 0,
                lastSlot: 0,
                lastVote: 0,
                lastCrime: 0,
                votes: 1,
            });
            await dataUser.save();
        }

        return dataUser;
    }

    let dataUser = await Player.findOne({ userId: user });

    if (!dataUser) {
        dataUser = new Player({
            userId: user,
            balance: 20000,
            level: 1,
            experience: 0,
            maxBet: 0,
            swag: {
                balloons: 0,
                mobile: 0,
                jamon: 0,
                paella: 0,
                guitarra: 0,
                torero: 0,
                flamenco: 0,
                siesta: 0,
                cava: 0,
                castanuelas: 0,
                sombrero: 0,
                sagradaFamilia: 0,
                soccerBall: 0,
                wine: 0,
                sol: 0,
                spanishFlag: 0,
                mate: 0,
            },
            lastWork: 0,
            lastDaily: 0,
            lastWeekly: 0,
            lastBlackJack: 0,
            lastCoinFlip: 0,
            lastCrash: 0,
            lastMinesweeper: 0,
            lastRace: 0,
            lastRoulette: 0,
            lastRps: 0,
            lastRussianRoulette: 0,
            lastSlot: 0,
            lastVote: 0,
            lastCrime: 0,
            votes: 1,
        });
        await dataUser.save();
    }

    return dataUser;
}

module.exports = {
    getDataUser
};
