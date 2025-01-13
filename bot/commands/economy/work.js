const { SlashCommandBuilder } = require("discord.js");
const { redEmbed, greenEmbed } = require("../../functions/interactionEmbed");
const { addSet, delSet, getSet } = require("../../functions/getSet");

module.exports = {
  // Define the slash command using SlashCommandBuilder
  data: new SlashCommandBuilder()
    .setName("work")
    .setDescription("Work and earn 1,000 coins!"),
  category: "economy",
  commandId: "1298755907991113758",

  // Execute function for the slash command
  async execute(interaction, client, lang, playerData) {

    // Check if the user is already executing a command
    const executing = await getSet(interaction, lang, client);
    if (executing) return;
    // Add user to the set of executing users
    await addSet(interaction.user.id);

    // Define the reward amount for working
    const rewardAmount = 1000;

    const currentTime = new Date();
    const cooldownTime = 600000; // 10 minutes in milliseconds

    // Check if the command is on cooldown
    if (playerData.lastWork && currentTime - playerData.lastWork < cooldownTime) {
      const timeLeft = cooldownTime - (currentTime - playerData.lastWork);
      const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
      const seconds = Math.floor((timeLeft / 1000) % 60);

      // Remove user from the set of executing users
      await delSet(interaction.user.id);

      // Send cooldown message
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

    // Add the work reward to the player's balance
    playerData.balance += rewardAmount;
    // Update the last work timestamp
    playerData.lastWork = currentTime;
    // Save the updated player data
    await playerData.save();

    // Remove user from the set of executing users
    await delSet(interaction.user.id);

    // Send success message with the reward amount
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
