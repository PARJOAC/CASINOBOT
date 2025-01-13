const { SlashCommandBuilder } = require("discord.js");
const { redEmbed, greenEmbed } = require("../../functions/interactionEmbed");
const { addSet, delSet, getSet } = require("../../functions/getSet");

module.exports = {
  // Define the slash command using SlashCommandBuilder
  data: new SlashCommandBuilder()
    .setName("weekly")
    .setDescription("Collect your weekly reward of 50,000 coins"),
  category: "economy",
  commandId: "1318240685924810815",

  // Execute function for the slash command
  async execute(interaction, client, lang, playerData) {

    // Check if the user is already executing a command
    const executing = await getSet(interaction, lang, client);
    if (executing) return;
    // Add user to the set of executing users
    await addSet(interaction.user.id);

    // Define the weekly reward amount
    const rewardAmount = 50000;

    const currentTime = new Date();
    const cooldownTime = 604800000; // 7 days in milliseconds

    // Check if the command is on cooldown
    if (playerData.lastWeekly && currentTime - playerData.lastWeekly < cooldownTime) {
      const timeLeft = cooldownTime - (currentTime - playerData.lastWeekly);
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
      const seconds = Math.floor((timeLeft / 1000) % 60);

      // Remove user from the set of executing users
      await delSet(interaction.user.id);

      // Send cooldown message
      return redEmbed(interaction, client, {
        type: "editReply",
        title: lang.cooldownActiveTitle,
        description: lang.cooldownTimeContentWeekly
          .replace("{days}", days)
          .replace("{hours}", hours)
          .replace("{minutes}", minutes)
          .replace("{seconds}", seconds),
        footer: client.user.username,
        ephemeral: false
      });
    };

    // Add the weekly reward to the player's balance
    playerData.balance += rewardAmount;
    // Update the last weekly claim timestamp
    playerData.lastWeekly = currentTime;
    // Save the updated player data
    await playerData.save();

    // Remove user from the set of executing users
    await delSet(interaction.user.id);

    // Send success message with the reward amount
    return greenEmbed(interaction, client, {
      type: "editReply",
      title: lang.weeklyRewardTitle,
      description: lang.economyRewardContent
        .replace("{amount}", rewardAmount.toLocaleString()),
      footer: client.user.username,
      ephemeral: false
    });

  },
};
