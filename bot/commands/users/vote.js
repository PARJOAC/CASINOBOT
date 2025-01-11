const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const axios = require("axios");
const { getDataUser } = require("../../functions/getDataUser");
const { logEmbedVotes } = require("../../functions/logEmbeds");
const { redEmbed, blueEmbed, greenEmbed } = require("../../functions/interactionEmbed");
const { addSet, delSet, getSet } = require("../../functions/getSet");

const executingUsers = new Set();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("vote")
    .setDescription("Vote for the bot on top.gg to support its growth and get rewards!"),
  category: "users",
  commandId: "1307993499874099243",
  async execute(interaction, client, lang, playerData) {
    const executing = await getSet(interaction, lang, client);
    if (executing) return;
    await addSet(interaction.user.id);

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

      return redEmbed(interaction, client, {
        type: "editReply",
        title: lang.cooldownActiveTitle,
        description: lang.cooldownVoteTimeContent
          .replace("{hours}", hours)
          .replace("{minutes}", minutes)
          .replace("{seconds}", seconds),
        footer: client.user.username,
        ephemeral: false
      });
    }

    const initialMessage = await blueEmbed(interaction, client, {
      type: "editReply",
      title: lang.initialVoteTitle,
      description: lang.initialVoteDescription.replace("{url}", topggUrl),
      footer: client.user.username,
      ephemeral: false,
      components: [actionRow],
      fetchReply: true
    });

    let cancelled = false;
    let attemp = 1; // Declarada fuera y inicializada aquí

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
      interaction.editReply({ components: [] });
      executingUsers.delete(userID);
      await delSet(interaction.user.id);
    });

    async function checkVoteStatus(attempt) {
      if (cancelled) return;

      if (attempt > 4) {
        executingUsers.delete(userID);
        if (!cancelled)
          return redEmbed(initialMessage, client, {
            type: "editReply",
            title: lang.timeException,
            description: lang.timeExceptionDescription,
            footer: client.user.username,
            ephemeral: false,
            components: []
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
        const rewards = await grantRandomReward(interaction, userID, lang);
        playerData.lastVote = currentTime;
        await playerData.save();

        logEmbedVotes(rewards.reward, interaction, client);

        executingUsers.delete(userID);
        await delSet(interaction.user.id);

        if (!cancelled)
          return greenEmbed(interaction, client, {
            type: "editReply",
            title: lang.thanksForVoting,
            description: lang.alreadyVotedDescription,
            fields: [
              { name: lang.yourReward, value: rewards.message },
            ],
            footer: client.user.username,
            ephemeral: false
          });
      } else {
        setTimeout(() => checkVoteStatus(attemp++), 30000);
      }
    } catch (error) {
      executingUsers.delete(userID);
      await delSet(interaction.user.id);
      if (!cancelled)
        return redEmbed(interaction, client, {
          type: "followUp",
          title: lang.errorTitle,
          description: lang.errorVoteStatus,
          footer: client.user.username,
          ephemeral: true
        });
    }
    checkVoteStatus(attemp);
  },
};

async function grantRandomReward(interaction, userID, lang) {
  let playerData = await getDataUser(userID, interaction.guild.id);
  const rewardType = Math.floor(Math.random() * 3);
  let message = "";
  let reward;

  switch (rewardType) {
    case 0:
      const moneyReward = Math.floor(Math.random() * 30000) + 10000;
      playerData.balance += moneyReward;
      await playerData.save();
      reward = `${moneyReward.toLocaleString()} <:blackToken:1304186797064065065>`;
      message = lang.receivedCoins.replace("{money}", moneyReward.toLocaleString());
      break;
    case 1:
      playerData.votes = (playerData.votes || 1) + 0.01;
      await playerData.save();
      reward = `x0.1 -> x${playerData.votes.toLocaleString()}`;
      message = lang.receivedMultiplier.replace("{total}", `${playerData.votes}`);
      break;
    case 2:
      const experienceReward = Math.floor(Math.random() * 1500) + 500;
      playerData.experience += experienceReward;
      await playerData.save();
      reward = `${experienceReward.toLocaleString()} XP`;
      message = lang.receivedExperience.replace("{total}", experienceReward.toLocaleString());
      break;
  }

  return { message, reward };
}
