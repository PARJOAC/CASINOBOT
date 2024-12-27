const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const axios = require("axios");
const Player = require("../../../mongoDB/Player");
const { logEmbedVotes } = require("../../functions/logEmbeds");
const { interactionEmbed } = require("../../functions/interactionEmbed");
const { addSet, delSet, getSet } = require("../../functions/getSet");
const executingUsers = new Set();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("vote")
    .setDescription(
      "Vote for the bot on top.gg to support its growth and get rewards!"
    ),
  category: "users",
  commandId: "1307993499874099243",
  async execute(interaction, client, lang, playerData) {
    const executing = await getSet(interaction, lang);
    if (executing) {
      return;
    } else {
      await addSet(interaction.user.id);
    }

    const botID = process.env.BOT_ID;
    const userID = interaction.user.id;
    const topggUrl = `https://top.gg/bot/${botID}/vote`;
    const topggAPIUrl = `https://top.gg/api/bots/${botID}/check?userId=${userID}`;

    if (executingUsers.has(userID)) {
      return interaction.editReply({
        content: lang.alreadyExecutingCommand,
        ephemeral: true,
      });
    }

    const actionRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("cancel")
        .setLabel(lang.cancelButton)
        .setStyle(ButtonStyle.Danger)
    );

    executingUsers.add(userID);

    const currentTime = new Date();
    const cooldownTime = 43200000;

    if (playerData.lastVote && currentTime - playerData.lastVote < cooldownTime) {
      const timeLeft = cooldownTime - (currentTime - playerData.lastVote);
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      executingUsers.delete(userID);
      await delSet(interaction.user.id);

      return interaction.editReply({
        embeds: [
          await interactionEmbed({
            title: lang.cooldownActiveTitle,
            description: lang.cooldownVoteTimeContent
              .replace("{hours}", hours)
              .replace("{minutes}", minutes)
              .replace("{seconds}", seconds),
            color: 0xff0000,
            footer: "CasinoBot",
            client,
          }),
        ],
        ephemeral: true,
      });
    }

    const initialMessage = await interaction.editReply({
      embeds: [
        await interactionEmbed({
          title: lang.initialVoteTitle,
          description: lang.initialVoteDescription.replace("{url}", topggUrl),
          color: 0x7289da,
          footer: "CasinoBot",
          client,
        }),
      ],
      components: [actionRow],
      ephemeral: false,
      fetchReply: true,
    });

    let cancelled = false;

    const filter = (i) => i.user.id === interaction.user.id;
    const collector = initialMessage.createMessageComponentCollector({
      filter,
      time: 120000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "cancel") {
        collector.stop();
        cancelled = true;

        executingUsers.delete(userID);
        await delSet(interaction.user.id);

        return i.update({ components: [] });
      }
    });

    collector.on("end", async () => {
      executingUsers.delete(userID);
      await delSet(interaction.user.id);
    });

    async function checkVoteStatus(attempt) {
      if (cancelled) return;

      if (attempt > 4) {
        executingUsers.delete(userID);
        if (!cancelled) {
          return initialMessage.edit({
            embeds: [
              await interactionEmbed({
                title: lang.timeException,
                description: lang.timeExceptionDescription,
                color: 0xff0000,
                footer: "CasinoBot",
                client,
              }),
            ],
            components: [],
          });
        }
      }

      try {
        const response = await axios.get(topggAPIUrl, {
          headers: {
            Authorization: process.env.TOPGG_API_TOKEN,
          },
        });

        if (response.data.voted === 1) {
          const rewards = await grantRandomReward(userID, lang);
          playerData.lastVote = currentTime;
          await playerData.save();

          logEmbedVotes(rewards.message, interaction, client);

          executingUsers.delete(userID);
          await delSet(interaction.user.id);

          if (!cancelled) {
            return initialMessage.edit({
              embeds: [
                await interactionEmbed({
                  title: lang.thanksForVoting,
                  description: lang.alreadyVotedDescription,
                  fields: [
                    { name: lang.yourReward, value: rewards.message },
                  ],
                  color: 0x00ff00,
                  footer: "CasinoBot",
                  client,
                }),
              ],
              components: [],
            });
          }
        } else {
          setTimeout(() => checkVoteStatus(attempt + 1), 30000);
        }
      } catch (error) {
        executingUsers.delete(userID);
        await delSet(interaction.user.id);
        if (!cancelled) {
          return interaction.followUp({
            content: lang.errorVoteStatus,
            components: [],
            ephemeral: true,
          });
        }
      }
    }

    checkVoteStatus(1);
  },
};

async function grantRandomReward(userID, lang) {
  const playerData = await Player.findOne({ userId: userID });
  const rewardType = Math.floor(Math.random() * 3);
  let message = "";

  switch (rewardType) {
    case 0:
      const moneyReward = Math.floor(Math.random() * 30000) + 10000;
      playerData.balance += moneyReward;
      await playerData.save();
      message = lang.receivedCoins.replace("{money}", moneyReward.toLocaleString());
      break;
    case 1:
      playerData.votes = (playerData.votes || 1) + 0.01;
      await playerData.save();
      message = lang.receivedMultiplier.replace("{total}", `${playerData.votes}`);
      break;
    case 2:
      const experienceReward = Math.floor(Math.random() * 1500) + 500;
      playerData.experience += experienceReward;
      await playerData.save();
      message = lang.receivedExperience.replace("{total}", experienceReward.toLocaleString());
      break;
  }

  return { message };
}
