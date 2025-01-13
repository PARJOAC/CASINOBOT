const { SlashCommandBuilder } = require("discord.js");
const { redEmbed, greenEmbed } = require("../../functions/interactionEmbed");
const { addSet, delSet, getSet } = require("../../functions/getSet");

module.exports = {
  // Define the slash command using SlashCommandBuilder
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Collect your daily reward of 10,000 coins"),
  category: "economy",
  commandId: "1296240894214934531",

  // Execute function for the slash command
  async execute(interaction, client, lang, playerData) {

    // Check if the user is already executing a command
    const executing = await getSet(interaction, lang, client);
    if (executing) return;
    // Add user to the set of executing users
    await addSet(interaction.user.id);

    // Define the daily reward amount
    const rewardAmount = 10000;

    const currentTime = new Date();
    const cooldownTime = 86400000; // 24 hours in milliseconds

    // Check if the command is on cooldown
    if (playerData.lastDaily && currentTime - playerData.lastDaily < cooldownTime) {
      const timeLeft = cooldownTime - (currentTime - playerData.lastDaily);
      const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
      const seconds = Math.floor((timeLeft / 1000) % 60);

      // Remove user from the set of executing users
      await delSet(interaction.user.id);

      // Send cooldown message
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

    // Add the daily reward to the player's balance
    playerData.balance += rewardAmount;
    // Update the last daily claim timestamp
    playerData.lastDaily = currentTime;
    // Save the updated player data
    await playerData.save();

    // Remove user from the set of executing users
    await delSet(interaction.user.id);

    // Send success message with the reward amount
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
