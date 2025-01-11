const { SlashCommandBuilder } = require("discord.js");
const { logEmbedLose, logEmbedWin } = require("../../functions/logEmbeds");
const { redEmbed, greenEmbed, blueEmbed } = require("../../functions/interactionEmbed");
const { delSet } = require("../../functions/getSet");
const { initGame } = require("../../functions/initGame");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roulette")
    .setDescription("Play roulette by guessing the color and optionally a number")
    .addStringOption((option) =>
      option
        .setName("prediction")
        .setDescription("Choose between black, red or green")
        .setRequired(true)
        .addChoices(
          { name: "Black", value: "black" },
          { name: "Red", value: "red" },
          { name: "Green", value: "green" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("bet")
        .setDescription("Amount of money to bet (type 'a' to bet all)")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("number")
        .setDescription("Optional: choose a number between 0 and 36")
        .setRequired(false)
    ),
  category: "game",
  commandId: "1296240894214934535",
  async execute(interaction, client, lang, playerData) {
    let betAmount = interaction.options.getString("bet");

    let initGames = await initGame(betAmount, interaction, client, lang, playerData);
    if (initGames.state) return;
    betAmount = initGames.betAmount;

    const prediction = interaction.options.getString("prediction");
    const chosenNumber = interaction.options.getInteger("number");

    const redNumbers = [
      1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
    ];
    const blackNumbers = [
      2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
    ];

    if (chosenNumber !== null) {
      delSet(interaction.user.id);
      if (chosenNumber < 0 || chosenNumber > 36)
        return redEmbed(interaction, client, {
          type: "editReply",
          title: lang.errorTitle,
          description: lang.rouletteErrorInvalidNumber,
          footer: client.user.username,
          ephemeral: false
        });


      if (prediction === "red" && !redNumbers.includes(chosenNumber))
        return redEmbed(interaction, client, {
          type: "editReply",
          title: lang.errorTitle,
          description: lang.rouletteErrorRedNumber,
          footer: client.user.username,
          ephemeral: false
        });

      if (prediction === "black" && !blackNumbers.includes(chosenNumber))
        return redEmbed(interaction, client, {
          type: "editReply",
          title: lang.errorTitle,
          description: lang.rouletteErrorBlackNumber,
          footer: client.user.username,
          ephemeral: false
        });

      if (prediction === "green" && chosenNumber !== 0)
        return redEmbed(interaction, client, {
          type: "editReply",
          title: lang.errorTitle,
          description: lang.rouletteErrorGreenNumber,
          footer: client.user.username,
          ephemeral: false
        });
    };

    const fecha = new Date();
    playerData.lastRoulette = fecha;

    const result = Math.floor(Math.random() * 37);
    let resultColor;

    result === 0 ? resultColor = "green" : redNumbers.includes(result) ? resultColor = "red" : resultColor = "black";

    const isWinColor = prediction === resultColor;
    const isWinNumber = chosenNumber !== null && chosenNumber === result;

    let winAmount;

    await blueEmbed(interaction, client, {
      type: "editReply",
      title: lang.rouletteSpiningTitle,
      description: lang.rouletteSpiningContent,
      footer: client.user.username,
      ephemeral: false,
      fetchReply: true
    });

    setTimeout(async () => {
      if (isWinColor) {
        if (prediction === "green" && chosenNumber === 0) {
          winAmount = Math.trunc(betAmount * 36 * (playerData.votes || 1));
        } else {
          winAmount =
            prediction === "green"
              ? Math.trunc(betAmount * 36 * (playerData.votes || 1))
              : Math.trunc(betAmount * (playerData.votes || 1));
          if (isWinNumber) {
            winAmount *= 5 * Math.trunc(playerData.votes || 1);
          } else {
            winAmount = Math.trunc(betAmount * (playerData.votes || 1));
          }
        }

        const newData = await logEmbedWin(betAmount, playerData, winAmount, interaction, client, lang);

        return greenEmbed(interaction, client, {
          type: "editReply",
          title: lang.winTitle,
          fields: [
            {
              name: lang.rouletteBallLandedTitle, value: lang.rouletteBallLandedContent
                .replace("{result}", result)
                .replace("{resultColor}", resultColor === "red" ? lang.rouletteColorRed : resultColor === "green" ? lang.rouletteColorGreen : lang.rouletteColorBlack), inline: false
            },
            { name: lang.yourPrediction, value: `${chosenNumber != null ? chosenNumber : ""} ${prediction === "red" ? lang.rouletteColorRed : prediction === "green" ? lang.rouletteColorGreen : lang.rouletteColorBlack}`, inline: false },
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
          fields: [
            {
              name: lang.rouletteBallLandedTitle, value: lang.rouletteBallLandedContent
                .replace("{result}", result)
                .replace("{resultColor}", resultColor === "red" ? lang.rouletteColorRed : resultColor === "green" ? lang.rouletteColorGreen : lang.rouletteColorBlack), inline: false
            },
            { name: lang.yourPrediction, value: `${chosenNumber != null ? chosenNumber : ""} ${prediction === "red" ? lang.rouletteColorRed : prediction === "green" ? lang.rouletteColorGreen : lang.rouletteColorBlack}`, inline: false },
            { name: lang.betField, value: `${betAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
            { name: lang.loseField, value: `${betAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
            { name: lang.balanceField, value: `${newData.newPlayerData.balance.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false }
          ],
          footer: client.user.username,
          ephemeral: false
        });
      };
    }, 550);

  },
};