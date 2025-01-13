// Import required modules from discord.js and custom functions
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { getDataUser } = require("../../functions/getDataUser");
const { redEmbed, greenEmbed } = require("../../functions/interactionEmbed");
const { getSetUser } = require("../../functions/getSet");
const { userCanUseCommand } = require("../../functions/checkAdminCommand");

module.exports = {
  // Define the slash command using SlashCommandBuilder
  data: new SlashCommandBuilder()
    .setName("removemoney")
    .setDescription("Remove money from a user's balance")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user from whom to remove money")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of money to remove")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for removing money")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: "admin",
  admin: false,
  commandId: "1296240894214934530",

  // Execute function for the slash command
  async execute(interaction, client, lang) {
    // Check if the user can use this command
    const check = await userCanUseCommand(interaction, lang, client);
    if (check.status) return;

    // Get the target user and amount from command options
    const targetUser = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    // Check if the user is currently playing
    const isPlaying = await getSetUser(targetUser.id);

    if (isPlaying)
      return redEmbed(interaction, client, {
        type: "editReply",
        title: lang.errorTitle,
        description: lang.userCurrentlyPlaying,
        footer: client.user.username,
        ephemeral: false
      });

    // Check if the amount is positive
    if (amount <= 0)
      return redEmbed(interaction, client, {
        type: "editReply",
        title: lang.errorTitle,
        description: lang.negativeAmount,
        footer: client.user.username,
        ephemeral: false
      });

    // Get the player's data
    let playerData = await getDataUser(targetUser.id, interaction.guild.id);

    // Check if the player exists in the database
    if (!playerData)
      return redEmbed(interaction, client, {
        type: "editReply",
        title: lang.errorTitle,
        description: lang.userNotFoundOnDataBase
          .replace("{user}", targetUser.id),
        footer: client.user.username,
        ephemeral: false
      });

    // Check if the player has enough balance
    if (playerData.balance < amount)
      return redEmbed(interaction, client, {
        type: "editReply",
        title: lang.errorTitle,
        description: lang.userNotHaveMoney,
        footer: client.user.username,
        ephemeral: false
      });

    // Remove the amount from the player's balance and save
    playerData.balance -= amount;
    await playerData.save();

    // Send a success message to the command user
    await greenEmbed(interaction, client, {
      type: "editReply",
      title: lang.succesfulTitle,
      description: lang.succesfulRemoveMoney
        .replace("{amount}", amount.toLocaleString())
        .replace("{user}", targetUser.username),
      footer: client.user.username,
      ephemeral: false
    });

    try {
      // Get the reason for removing money
      const reason = interaction.options.getString("reason") || lang.noReason;

      // Create an embed to send to the target user
      const embed = new EmbedBuilder()
        .setColor(parseInt(process.env.GREEN_COLOR))
        .setTitle(lang.userRemoveMoneyNotifyTitle)
        .setDescription(lang.userRemoveMoneyNotifyContent.replace("{user}", interaction.user.username).replace("{amount}", amount.toLocaleString()))
        .addFields(
          { name: lang.serverName, value: interaction.guild.name, inline: false },
          { name: lang.reason, value: reason, inline: false }
        )
        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

      // Send the embed to the target user
      await user.send({ embeds: [embed] });
    } catch {
      // If sending DM fails, notify the command user
      return redEmbed(interaction, client, {
        type: "followUp",
        title: lang.errorTitle,
        description: lang.dmDisabled,
        footer: client.user.username,
        ephemeral: true
      });
    };
  },
};
