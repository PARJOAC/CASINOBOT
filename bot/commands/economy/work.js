const { SlashCommandBuilder } = require("discord.js");
const { redEmbed, greenEmbed } = require("../../functions/interactionEmbed");
const { addSet, delSet, getSet } = require("../../functions/getSet");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("work")
    .setDescription("Work and earn 1,000 coins!"),
  category: "economy",
  commandId: "1298755907991113758",
  async execute(interaction, client, lang, playerData) {

    const executing = await getSet(interaction, lang, client);
    if (executing) return;
    await addSet(interaction.user.id);

    const rewardAmount = 1000;

    const currentTime = new Date();
    const cooldownTime = 600000;

    if (playerData.lastWork && currentTime - playerData.lastWork < cooldownTime) {
      const timeLeft = cooldownTime - (currentTime - playerData.lastWork);
      const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
      const seconds = Math.floor((timeLeft / 1000) % 60);

      await delSet(interaction.user.id);

      return redEmbed(interaction, client, {
        type: "editReply",
        title: lang.cooldownActiveTitle,
        description: lang.cooldownTimeContentWork
          .replace("{minutes}", minutes)
          .replace("{seconds}", seconds),
        footer: client.user.username,
        ephemeral: false
      });
    };

    playerData.balance += rewardAmount;
    playerData.lastWork = currentTime;
    await playerData.save();

    await delSet(interaction.user.id);

    return greenEmbed(interaction, client, {
      type: "editReply",
      title: lang.workRewardTitle,
      description: lang.economyRewardContent
        .replace("{amount}", rewardAmount.toLocaleString()),
      footer: client.user.username,
      ephemeral: false
    });

  },
};
