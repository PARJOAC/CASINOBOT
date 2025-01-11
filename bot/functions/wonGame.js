const { wonItem } = require("./wonItem");
const { winExperience } = require("./winExperience");

async function wonGame(playerData, won, interaction, lang, client) {
    await wonItem(playerData, interaction, lang, client);
    await winExperience(playerData, won);
    
    playerData.balance += won;
    await playerData.save();
}

module.exports = { wonGame };