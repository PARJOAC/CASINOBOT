const { SlashCommandBuilder } = require("discord.js");
const { redEmbed, greenEmbed } = require("../../functions/interactionEmbed");
const { addSet, delSet, getSet } = require("../../functions/getSet");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Collect your daily reward of 10,000 coins"),
  category: "economy",
  commandId: "1296240894214934531",
  async execute(interaction, client, lang, playerData) {

    const executing = await getSet(interaction, lang, client);
    if (executing) return;
    await addSet(interaction.user.id);

    const rewardAmount = 10000;

    const currentTime = new Date();
    const cooldownTime = 86400000;

    if (playerData.lastDaily && currentTime - playerData.lastDaily < cooldownTime) {
      const timeLeft = cooldownTime - (currentTime - playerData.lastDaily);
      const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
      const seconds = Math.floor((timeLeft / 1000) % 60);

      await delSet(interaction.user.id);

      return redEmbed(interaction, client, {
        type: "editReply",
        title: lang.cooldownActiveTitle,
        description: lang.cooldownTimeContentDaily
          .replace("{hours}", hours)
          .replace("{minutes}", minutes)
          .replace("{seconds}", seconds),
        footer: client.user.username,
        ephemeral: false
      });
    };

    playerData.balance += rewardAmount;
    playerData.lastDaily = currentTime;
    await playerData.save();

    await delSet(interaction.user.id);

    return greenEmbed(interaction, client, {
      type: "editReply",
      title: lang.dailyRewardTitle,
      description: lang.economyRewardContent.replace(
        "{amount}",
        rewardAmount.toLocaleString()
      ),
      footer: client.user.username,
      ephemeral: false
    });

  },
};
