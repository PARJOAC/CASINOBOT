const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { logEmbedLose, logEmbedWin } = require("../../functions/logEmbeds");
const { blueEmbed, redEmbed, greenEmbed } = require("../../functions/interactionEmbed");
const { delSet } = require("../../functions/getSet");
const { initGame } = require("../../functions/initGame");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("minesweeper")
    .setDescription("Try to avoid the bombs to increase your winnings!")
    .addStringOption((option) =>
      option
        .setName("bet")
        .setDescription("Amount of money to bet (type 'a' to bet all)")
        .setRequired(true)
    ),
  category: "game",
  commandId: "1303800118948003872",
  async execute(interaction, client, lang, playerData) {
    let betAmount = interaction.options.getString("bet");

    let initGames = await initGame(betAmount, interaction, client, lang, playerData);
    if (initGames.state) return;
    betAmount = initGames.betAmount;

    const fecha = new Date();
    playerData.lastMinesweeper = fecha;

    let totalMultiplier = 1;
    let gameOver = false;
    const buttons = Array(20).fill("safe");
    const bombIndices = new Set();
    let bombsPlaced = 0;

    while (bombsPlaced < 10) {
      const randomIndex = Math.floor(Math.random() * 20);
      if (!bombIndices.has(randomIndex)) {
        buttons[randomIndex] = "bomb";
        bombIndices.add(randomIndex);
        bombsPlaced++;
      }
    }

    const createButtons = (clickedIndices = []) => {
      const rows = [];
      for (let i = 0; i < 4; i++) {
        const row = new ActionRowBuilder();
        for (let j = 0; j < 5; j++) {
          const index = i * 5 + j;
          const button = new ButtonBuilder()
            .setCustomId(index.toString())
            .setEmoji("<:empty:1303119857222553661>")
            .setStyle(ButtonStyle.Secondary);

          if (clickedIndices.includes(index)) {
            button
              .setEmoji("<:golfFlag:1303036979231068170>")
              .setDisabled(true);
          }

          row.addComponents(button);
        }
        rows.push(row);
      }

      const retireRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("retire")
          .setLabel(lang.retireButton)
          .setStyle(ButtonStyle.Danger)
      );
      rows.push(retireRow);
      return rows;
    };

    const message = await blueEmbed(interaction, client, {
      type: "editReply",
      title: lang.minesweeperGameTitle,
      description: lang.minesweeperGameDescription,
      fields: [
        { name: lang.betField, value: `${betAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
        { name: lang.multiplierField, value: `x${totalMultiplier} + x${playerData.votes || 1}`, inline: false },
      ],
      footer: client.user.username,
      ephemeral: false,
      components: createButtons(),
      fetchReply: true
    });

    const filter = (i) => i.user.id === interaction.user.id && !gameOver;
    const collector = message.createMessageComponentCollector({
      filter,
      time: 120000,
    });
    const clickedIndices = [];
    let remainingSafeCount = buttons.filter((btn) => btn === "safe").length;
    let winAmount;

    collector.on("collect", async (i) => {
      if (i.customId === "retire") {
        await i.deferUpdate();
        if (totalMultiplier == 1.0) {
          return redEmbed(interaction, client, {
            type: "followUp",
            title: lang.errorTitle,
            description: lang.cashoutFail,
            footer: client.user.username,
            ephemeral: true
          });
        };

        gameOver = true;
        collector.stop();

        winAmount = Math.trunc(betAmount * totalMultiplier * (playerData.votes || 1));
        const newData = await logEmbedWin(betAmount, playerData, winAmount, interaction, client, lang);

        return greenEmbed(i, client, {
          type: "editReply",
          title: lang.cashOutsuccesful,
          fields: [
            { name: lang.betField, value: `${betAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
            { name: lang.winField, value: `${winAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
            { name: lang.multiplierField, value: `x${totalMultiplier.toFixed(2)} + x${newData.newPlayerData.votes || 1}`, inline: false },
            { name: lang.balanceField, value: `${newData.newPlayerData.balance.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
          ],
          footer: client.user.username,
          ephemeral: false,
          components: []
        });

      } else {
        await i.deferUpdate();
        const index = parseInt(i.customId);

        if (buttons[index] === "bomb") {
          collector.stop();
          gameOver = true;

          const newData = await logEmbedLose(betAmount, playerData, interaction, client);

          return redEmbed(i, client, {
            type: "editReply",
            title: lang.youLose,
            fields: [
              { name: lang.betField, value: `${betAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
              { name: lang.loseField, value: `${betAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
              { name: lang.multiplierField, value: `x${totalMultiplier.toFixed(2)} + x${newData.newPlayerData.votes || 1}`, inline: false },
              { name: lang.balanceField, value: `${newData.newPlayerData.balance.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
            ],
            footer: client.user.username,
            ephemeral: false,
            components: []
          });
        } else {
          totalMultiplier += parseFloat((Math.random() * 0.10 + 0.02).toFixed(2));
          remainingSafeCount--;

          if (remainingSafeCount == 0) {
            gameOver = true;
            collector.stop();

            winAmount = Math.trunc(betAmount * totalMultiplier * (playerData.votes || 1));
            const newData = await logEmbedWin(betAmount, playerData, winAmount, interaction, client, lang);

            return greenEmbed(i, client, {
              type: "editReply",
              title: lang.winTitle,
              description: lang.minesweeperGameWinDescription,
              fields: [
                { name: lang.betField, value: `${betAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
                { name: lang.winField, value: `${winAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
                { name: lang.multiplierField, value: `x${totalMultiplier.toFixed(2)} + x${newData.newPlayerData.votes || 1}`, inline: false },
                { name: lang.balanceField, value: `${newData.newPlayerData.balance.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false }
              ],
              ephemeral: false,
              footer: client.user.username
            });

          } else {
            clickedIndices.push(index);
            winAmount = Math.trunc(betAmount * totalMultiplier * (playerData.votes || 1));
            const newData = await logEmbedWin(betAmount, playerData, winAmount, interaction, client, lang);

            await greenEmbed(i, client, {
              type: "editReply",
              title: lang.safeTitle,
              description: lang.minesweeperGameSafeDescription,
              fields: [
                { name: lang.betField, value: `${betAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
                { name: lang.winField, value: `${winAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
                { name: lang.multiplierField, value: `x${totalMultiplier.toFixed(2)} + x${newData.newPlayerData.votes || 1}`, inline: false },
                { name: lang.balanceField, value: `${newData.newPlayerData.balance.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false }
              ],
              footer: client.user.username,
              ephemeral: false,
              components: createButtons(clickedIndices)
            });
          };
        };
      };
    });

    collector.on("end", async (collected, reason) => {
      delSet(interaction.user.id);
      if (reason === "time") {
        interaction.editReply({ components: [] });
        return redEmbed(interaction, client, {
          type: "followUp",
          title: lang.timeException,
          description: lang.timeExceptionDescription,
          footer: client.user.username,
          ephemeral: false
        });
      };
    });

  },
};
