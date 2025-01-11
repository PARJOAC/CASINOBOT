const { SlashCommandBuilder } = require("discord.js");
const { logEmbedLose, logEmbedWin } = require("../../functions/logEmbeds");
const { greenEmbed, redEmbed } = require("../../functions/interactionEmbed");
const { initGame } = require("../../functions/initGame");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("slots")
    .setDescription("Play the slots machine with a bet!")
    .addStringOption((option) =>
      option
        .setName("bet")
        .setDescription("Amount of money to bet (type 'a' to bet all)")
        .setRequired(true)
    ),
  category: "games",
  commandId: "1306599562642849853",
  async execute(interaction, client, lang, playerData) {
    let betAmount = interaction.options.getString("bet");

    let initGames = await initGame(betAmount, interaction, client, lang, playerData);
    if (initGames.state) return;
    betAmount = initGames.betAmount;

    const fecha = new Date();
    playerData.lastSlot = fecha;

    const symbols = [
      "🍐",
      "🍌",
      "🥝",
      "🍎",
      "🍓",
      "🍒",
      "🍋",
      "🍊",
      "🍉",
      "🔔",
      "⭐",
      "💎",
    ];

    const spinResults = [
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
    ];

    const winnings = calculateWinnings(spinResults, betAmount);
    if (winnings > 0) {
      let winAmount = Math.trunc(winnings * (playerData.votes || 1));
      const newData = await logEmbedWin(betAmount, playerData, winAmount, interaction, client, lang);

      return greenEmbed(interaction, client, {
        type: "editReply",
        title: lang.winTitle,
        description: spinResults.join(" | "),
        fields: [
          { name: lang.betField, value: `${betAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
          { name: lang.winField, value: `${winAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
          { name: lang.multiplierField, value: `x${newData.newPlayerData.votes || 1}`, inline: false },
          { name: lang.balanceField, value: `${newData.newPlayerData.balance.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false }
        ],
        footer: client.user.username,
        ephemeral: false
      });
    } else {
      const newData = await logEmbedLose(betAmount, playerData, interaction, client);

      return redEmbed(interaction, client, {
        type: "editReply",
        title: lang.youLose,
        description: spinResults.join(" | "),
        fields: [
          { name: lang.betField, value: `${betAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
          { name: lang.loseField, value: `${betAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
          { name: lang.balanceField, value: `${newData.newPlayerData.balance.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
        ],
        footer: client.user.username,
        ephemeral: false
      });
    };

  },
};

function calculateWinnings(results, betAmount) {
  const symbolCount = {};
  results.forEach((symbol) => {
    symbolCount[symbol] = (symbolCount[symbol] || 0) + 1;
  });

  if (symbolCount["💎"] === 3) {
    return Math.trunc(betAmount * 4);
  } else if (symbolCount["💎"] === 2) {
    return Math.trunc(betAmount * 3);
  } else if (symbolCount["💎"] === 1) {
    return Math.trunc(betAmount * 2);
  }

  if (symbolCount[results[0]] === 3) {
    return Math.trunc(betAmount * 1.5);
  } else if (symbolCount[results[0]] === 2) {
    return Math.trunc(betAmount * 1);
  }

  return 0;
}
