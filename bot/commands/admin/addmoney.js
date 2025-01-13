// Import required modules from discord.js and custom functions
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { getDataUser } = require("../../functions/getDataUser");
const { redEmbed, greenEmbed } = require("../../functions/interactionEmbed");
const { getSetUser } = require("../../functions/getSet");
const { userCanUseCommand } = require("../../functions/checkAdminCommand");

module.exports = {
  // Define the slash command using SlashCommandBuilder
  data: new SlashCommandBuilder()
    .setName("addmoney")
    .setDescription("Add money to a user")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("User to whom you want to add money")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("amount")
        .setDescription("Amount of money to add")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("reason")
        .setDescription("Reason for adding money")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: "admin",
  admin: false,
  commandId: "1296240894214934528",

  // Execute function for the slash command
  async execute(interaction, client, lang) {
    // Check if the user can use this command
    const check = await userCanUseCommand(interaction, lang, client);
    if (check.status) return;

    // Get the target user and amount from command options
    const user = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    // Check if the user is currently playing
    const isPlaying = await getSetUser(user.id);

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
        description: lang.negativeMoney,
        footer: client.user.username,
        ephemeral: false
      });

    // Get the player's data and update their balance
    let playerData = await getDataUser(user.id, interaction.guild.id);
    playerData.balance += amount;
    await playerData.save();

    // Send a success message to the command user
    await greenEmbed(interaction, client, {
      type: "editReply",
      title: lang.succesfulTitle,
      description: lang.succesfulAddMoneyContent
        .replace("{amount}", amount.toLocaleString())
        .replace("{user}", user.username),
      footer: client.user.username,
      ephemeral: false
    });

    try {
      // Get the reason for adding money (if provided)
      const reason = interaction.options.getString("reason") || lang.noReason;

      // Create an embed to send to the target user
      const embed = new EmbedBuilder()
        .setColor(parseInt(process.env.GREEN_COLOR, 16))
        .setTitle(lang.userMessageAddMoneyTitle.replace("{user}", interaction.user.username))
        .setDescription(lang.userMessageAddMoneyContent.replace("{amount}", amount.toLocaleString()))
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
