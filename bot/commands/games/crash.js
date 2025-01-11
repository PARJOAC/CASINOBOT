const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { logEmbedLose, logEmbedWin } = require("../../functions/logEmbeds");
const { blueEmbed, greenEmbed, redEmbed } = require("../../functions/interactionEmbed");
const { initGame } = require("../../functions/initGame");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("crash")
    .setDescription("Play Crash with a bet!")
    .addStringOption((option) =>
      option
        .setName("bet")
        .setDescription("Amount of money to bet (type 'a' to bet all)")
        .setRequired(true)
    ),
  category: "game",
  commandId: "1296240894214934533",
  async execute(interaction, client, lang, playerData) {
    let betAmount = interaction.options.getString("bet");

    let initGames = await initGame(betAmount, interaction, client, lang, playerData);
    if (initGames.state) return;
    betAmount = initGames.betAmount;

    const fecha = new Date();
    playerData.lastCrash = fecha;

    let multiplier = 0.0;
    const crashTime = Math.random() * 10000 + 500;
    let crashed = false;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("cashout")
        .setLabel(lang.cashOutButton)
        .setStyle(ButtonStyle.Success)
    );

    const initialMessage = await blueEmbed(interaction, client, {
      type: "editReply",
      title: lang.crashTitleOnPlaying,
      fields: [
        { name: lang.betField, value: `${betAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
        { name: lang.multiplierField, value: `x${multiplier.toFixed(1)}`, inline: false },
      ],
      footer: client.user.username,
      ephemeral: false,
      components: [row],
      fetchReply: true
    });

    let winAmount;

    const updateMultiplier = setInterval(async () => {
      if (!crashed) {
        multiplier += 0.1;
        winAmount = Math.trunc(betAmount * multiplier * (playerData.votes || 1));

        await greenEmbed(interaction, client, {
          type: "editReply",
          title: lang.winTitle,
          fields: [
            { name: lang.betField, value: `${betAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
            { name: lang.winField, value: `${winAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
            { name: lang.multiplierField, value: `x${multiplier.toFixed(1)} + x${playerData.votes || 1}`, inline: false },
          ],
          footer: client.user.username,
          ephemeral: false,
          components: [row]
        });
      };
    }, Math.random() * 1000 + 1000);

    const crashTimeout = setTimeout(async () => {
      crashed = true;
      clearInterval(updateMultiplier);

      const newData = await logEmbedLose(betAmount, playerData, interaction, client);
      return redEmbed(interaction, client, {
        type: "editReply",
        title: lang.youLose,
        fields: [
          { name: lang.betField, value: `${betAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
          { name: lang.loseField, value: `${betAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
          { name: lang.multiplierField, value: `x${multiplier.toFixed(1)} + x${newData.newPlayerData.votes || 1}`, inline: false },
          { name: lang.balanceField, value: `${newData.newPlayerData.balance.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
        ],
        footer: client.user.username,
        ephemeral: false,
        components: []
      });
    }, crashTime);

    const filter = (buttonInteraction) =>
      buttonInteraction.customId === "cashout" &&
      buttonInteraction.user.id === interaction.user.id;
    const collector = initialMessage.createMessageComponentCollector({
      filter,
      time: crashTime,
    });

    collector.on("collect", async (buttonInteraction) => {
      if (multiplier == 0.0) {
        await buttonInteraction.deferUpdate();

        return redEmbed(interaction, client, {
          type: "followUp",
          title: lang.errorTitle,
          description: lang.cashoutFail,
          footer: client.user.username,
          ephemeral: true
        });
      };

      crashed = true;
      clearInterval(updateMultiplier);
      clearTimeout(crashTimeout);

      winAmount = Math.trunc(betAmount * multiplier.toFixed(1) * (playerData.votes || 1));
      const newData = await logEmbedWin(betAmount, playerData, winAmount, interaction, client, lang);

      return greenEmbed(buttonInteraction, client, {
        type: "update",
        title: lang.cashOutsuccesful,
        fields: [
          { name: lang.betField, value: `${betAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
          { name: lang.winField, value: `${winAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
          { name: lang.multiplierField, value: `x${multiplier.toFixed(1)} + x${newData.newPlayerData.votes || 1}`, inline: false },
          { name: lang.balanceField, value: `${newData.newPlayerData.balance.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false }
        ],
        footer: client.user.username,
        ephemeral: false,
        components: []
      });
    });

  },
};
