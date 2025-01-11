const { SlashCommandBuilder } = require("discord.js");
const { redEmbed, greenEmbed } = require("../../functions/interactionEmbed");
const { addSet, delSet, getSet } = require("../../functions/getSet");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("crime")
    .setDescription("You can commit a crime to earn money, but you can get caught!"),
  category: "economy",
  commandId: "1320836368682844213",
  async execute(interaction, client, lang, playerData) {

    const executing = await getSet(interaction, lang, client);
    if (executing) return;
    await addSet(interaction.user.id);

    const currentTime = new Date();
    const cooldownTime = 300000;

    if (playerData.lastCrime && currentTime - playerData.lastCrime < cooldownTime) {
      const timeLeft = cooldownTime - (currentTime - playerData.lastCrime);
      const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
      const seconds = Math.floor((timeLeft / 1000) % 60);

      await delSet(interaction.user.id);

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

    const rewardAmount = Math.floor(Math.random() * (10000 - 1500 + 1) + 1500);

    const prob = Math.random().toFixed(1);

    playerData.lastCrime = currentTime;
    await playerData.save();

    await delSet(interaction.user.id);
    if (prob <= 0.5) {
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
