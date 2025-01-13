const { SlashCommandBuilder } = require("discord.js");
const { redEmbed, greenEmbed } = require("../../functions/interactionEmbed");
const { addSet, delSet, getSet } = require("../../functions/getSet");

module.exports = {
  // Define the slash command using SlashCommandBuilder
  data: new SlashCommandBuilder()
    .setName("crime")
    .setDescription("You can commit a crime to earn money, but you can get caught!"),
  category: "economy",
  commandId: "1320836368682844213",

  // Execute function for the slash command
  async execute(interaction, client, lang, playerData) {

    // Check if the user is already executing a command
    const executing = await getSet(interaction, lang, client);
    if (executing) return;
    // Add user to the set of executing users
    await addSet(interaction.user.id);

    const currentTime = new Date();
    const cooldownTime = 300000; // 5 minutes in milliseconds

    // Check if the command is on cooldown
    if (playerData.lastCrime && currentTime - playerData.lastCrime < cooldownTime) {
      const timeLeft = cooldownTime - (currentTime - playerData.lastCrime);
      const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
      const seconds = Math.floor((timeLeft / 1000) % 60);

      // Remove user from the set of executing users
      await delSet(interaction.user.id);

      // Send cooldown message
      return redEmbed(interaction, client, {
        type: "editReply",
        title: lang.cooldownActiveTitle,
        description: lang.cooldownTimeContentCrime
          .replace("{minutes}", minutes)
          .replace("{seconds}", seconds),
        footer: client.user.username,
        ephemeral: false
      });
    };

    // Check if player has enough balance to commit a crime
    if (playerData.balance < 2500) {
      await delSet(interaction.user.id);
      return redEmbed(interaction, client, {
        type: "editReply",
        title: lang.errorTitle,
        description: lang.errorNotEnoughMoneyCrime,
        footer: client.user.username,
        ephemeral: false
      });
    };

    // Calculate reward amount (between 1500 and 10000)
    const rewardAmount = Math.floor(Math.random() * (10000 - 1500 + 1) + 1500);

    // 50% chance of success
    const prob = Math.random().toFixed(1);

    // Update last crime timestamp
    playerData.lastCrime = currentTime;
    await playerData.save();

    // Remove user from the set of executing users
    await delSet(interaction.user.id);

    if (prob <= 0.5) {
      // Crime successful
      playerData.balance += rewardAmount;
      await playerData.save();

      return greenEmbed(interaction, client, {
        type: "editReply",
        title: lang.succesfulTitle,
        description: lang.winCrime
          .replace("{amount}", rewardAmount.toLocaleString()),
        footer: client.user.username,
        ephemeral: false
      });
    } else {
      // Crime failed
      playerData.balance -= 2500;
      await playerData.save();

      return redEmbed(interaction, client, {
        type: "editReply",
        title: lang.loseCrimeTitle,
        description: lang.loseCrime
          .replace("{amount}", 2500),
        footer: client.user.username,
        ephemeral: false
      });
    };

  },
};
