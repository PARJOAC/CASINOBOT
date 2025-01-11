async function wonGame(playerData, won, interaction, lang, client) {
    await wonItem(playerData, interaction, lang, client);
    await winExperience(playerData, won);
    playerData.balance += won;
    console.log(playerData);
    await playerData.save();
}

module.exports = { wonGame };