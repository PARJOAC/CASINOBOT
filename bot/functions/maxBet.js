const { redEmbed } = require("./interactionEmbed");

async function maxBet(playerData, betAmount, lang, interaction, client) {
  const embedMessage = async (description) => redEmbed(interaction, client, {
    type: "editReply",
    title: lang.errorTitle,
    description: description,
    footer: client.user.username,
    ephemeral: false
  });

  const levelLimits = [
    { level: 5, maxBet: 10000 },
    { level: 15, maxBet: 20000 },
    { level: 35, maxBet: 30000 },
    { level: 74, maxBet: 50000 },
    { level: 75, maxBet: 100000 }
  ];

  let maxBetAllowed = 100000; // Límite predeterminado para niveles mayores a 75

  for (const { level, maxBet } of levelLimits) {
    if (playerData.level <= level) {
      maxBetAllowed = maxBet;
      break;
    }
  }

  // Verificar si la apuesta excede el límite permitido
  if (betAmount > maxBetAllowed) {
    await embedMessage(
      lang.errorMaxBetContent
        .replace("{level}", playerData.level)
        .replace("{number}", maxBetAllowed)
    );
    return true;
  }

  // Actualizar el valor máximo apostado si la apuesta es válida
  if (playerData.maxBet < betAmount) {
    playerData.maxBet = betAmount;
  }

  return false;
};

module.exports = { maxBet };