const { addSet, delSet, getSet } = require("./getSet");
const { maxBet } = require("./maxBet");
const { redEmbed } = require("./interactionEmbed");

async function initGame(betAmount, interaction, client, lang, playerData) {
  const executing = await getSet(interaction, lang, client);
  if (executing) return { state: true };
  await addSet(interaction.user.id);

  const embedMessage = async (description) => redEmbed(interaction, client, {
    type: "editReply",
    title: lang.errorTitle,
    description: description,
    footer: client.user.username,
    ephemeral: false
  });


  betAmount == "a" ? betAmount = playerData.balance : betAmount;
  if (!Number.isInteger(Number(betAmount))) {
    await delSet(interaction.user.id);
    await embedMessage(lang.amountErrorIntNumberContent);
    return { state: true };
  };

  if (betAmount < 0) {
    await delSet(interaction.user.id);
    await embedMessage(lang.amountErrorNegativeNumberContent);
    return { state: true };
  };

  if (betAmount < 100) {
    await delSet(interaction.user.id);
    await embedMessage(lang.minimumBet);
    return { state: true };
  };

  if (betAmount > playerData.balance) {
    await delSet(interaction.user.id);
    await embedMessage(lang.errorEnoughMoneyContent);
    return { state: true };
  };

  if (betAmount == playerData.balance) return { state: false, betAmount: Number(betAmount) };

  const result = await maxBet(playerData, betAmount, lang, interaction, client);
  if (result) {
    await delSet(interaction.user.id);
    return { state: true };
  };
  return { state: false, betAmount: Number(betAmount) };
}

module.exports = { initGame };
