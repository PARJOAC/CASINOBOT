const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { logEmbedLose, logEmbedWin, logEmbedTie } = require("../../functions/logEmbeds");
const { blueEmbed, yellowEmbed, redEmbed, greenEmbed } = require("../../functions/interactionEmbed");
const { delSet } = require("../../functions/getSet");
const { initGame } = require("../../functions/initGame");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rps")
    .setDescription("Play Rock Paper Scissors with a bet!")
    .addStringOption((option) =>
      option
        .setName("bet")
        .setDescription("Amount of money to bet (type 'a' to bet all)")
        .setRequired(true)
    ),
  category: "games",
  commandId: "1297946426872958989",
  async execute(interaction, client, lang, playerData) {
    let betAmount = interaction.options.getString("bet");

    let initGames = await initGame(betAmount, interaction, client, lang, playerData);
    if (initGames.state) return;
    betAmount = initGames.betAmount;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("rock")
        .setLabel(lang.rockButton)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("paper")
        .setLabel(lang.paperButton)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("scissors")
        .setLabel(lang.scissorsButton)
        .setStyle(ButtonStyle.Primary)
    );

    const fecha = new Date();
    playerData.lastRps = fecha;

    const message = await blueEmbed(interaction, client, {
      type: "editReply",
      fields: [
        { name: lang.betField, value: `${betAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false }
      ],
      footer: client.user.username,
      ephemeral: false,
      components: [row],
      fetchReply: true
    });

    const filter = (buttonInteraction) => {
      return buttonInteraction.user.id === interaction.user.id;
    };

    const collector = message.createMessageComponentCollector({
      filter,
      time: 30000,
    });

    collector.on("collect", async (buttonInteraction) => {
      const userChoice = buttonInteraction.customId;
      const botChoice = ["rock", "paper", "scissors"][
        Math.floor(Math.random() * 3)
      ];
      collector.stop();


      if (userChoice === botChoice) {
        logEmbedTie(betAmount, playerData, interaction, client);

        return yellowEmbed(buttonInteraction, client, {
          type: "update",
          title: lang.tieTitle,
          fields: [
            { name: lang.userChoiceField, value: userChoice, inline: false },
            { name: lang.botChoiceField, value: botChoice, inline: false },
            { name: lang.betField, value: `${betAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
            { name: lang.multiplierField, value: `x${playerData.votes || 1}`, inline: false },
            { name: lang.balanceField, value: `${playerData.balance.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false }
          ],
          footer: client.user.username,
          ephemeral: false,
          components: []
        });

      } else if (
        (userChoice === "rock" && botChoice === "scissors") ||
        (userChoice === "paper" && botChoice === "rock") ||
        (userChoice === "scissors" && botChoice === "paper")
      ) {
        let winAmount = Math.trunc(betAmount * (playerData.votes || 1));
        const newData = await logEmbedWin(betAmount, playerData, winAmount, interaction, client, lang);

        return greenEmbed(buttonInteraction, client, {
          type: "update",
          title: lang.winTitle,
          fields: [
            { name: lang.userChoiceField, value: userChoice, inline: false },
            { name: lang.botChoiceField, value: botChoice, inline: false },
            { name: lang.betField, value: `${betAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
            { name: lang.winField, value: `${winAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
            { name: lang.multiplierField, value: `x${newData.newPlayerData.votes || 1}`, inline: false },
            { name: lang.balanceField, value: `${newData.newPlayerData.balance.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false }
          ],
          footer: client.user.username,
          ephemeral: false,
          components: []
        });

      } else {
        const newData = await logEmbedLose(betAmount, playerData, interaction, client);

        return redEmbed(buttonInteraction, client, {
          type: "update",
          title: lang.youLose,
          fields: [
            { name: lang.userChoiceField, value: userChoice, inline: false },
            { name: lang.botChoiceField, value: botChoice, inline: false },
            { name: lang.betField, value: `${betAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
            { name: lang.loseField, value: `${betAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
            { name: lang.balanceField, value: `${newData.newPlayerData.balance.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false }
          ],
          footer: client.user.username,
          ephemeral: false,
          components: []
        });
      };
    });

    collector.on("end", async (collected, reason) => {
      delSet(interaction.user.id);
      if (reason == "time") {
        interaction.editReply({ components: [] });
        return redEmbed(interaction, client, {
          type: "followUp",
          title: lang.timeException,
          description: lang.timeExceptionDescription,
          footer: client.user.username,
          ephemeral: true
        });
      };
    });

  },
};
