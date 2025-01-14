// Import required modules from discord.js and custom functions
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { getDataUser } = require("../../functions/getDataUser");
const { redEmbed, greenEmbed } = require("../../functions/interactionEmbed");
const { userCanUseCommand } = require("../../functions/checkAdminCommand");

module.exports = {
  // Define the slash command using SlashCommandBuilder
  data: new SlashCommandBuilder()
    .setName("modifyprofile")
    .setDescription("Modify a player's profile")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("User to whom you want to modify profile")
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName("balance")
        .setDescription("New balance of the player")
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName("level")
        .setDescription("New level of the player")
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName("balloons")
        .setDescription("New number of balloons")
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName("mobiles")
        .setDescription("New number of mobiles")
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName("bikes")
        .setDescription("New number of bikes")
        .setRequired(false))
    .addNumberOption(option =>
      option.setName("multiplier")
        .setDescription("New number of multiplier (ex: 1,08)")
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  commandId: "1326153610614018078",
  category: "admin",
  admin: false,

  // Execute function for the slash command
  async execute(interaction, client, lang) {
    // Check if the user can use this command
    const check = await userCanUseCommand(interaction, lang, client);
    if (check.status) return;

    // Get the target user and their data
    const user = interaction.options.getUser("user");
    const userData = await getDataUser(user.id, interaction.guild.id);

    // Get new values from options or use existing values
    const balance = interaction.options.getInteger("balance") || userData.balance;
    const level = interaction.options.getInteger("level") || userData.level;
    const balloons = interaction.options.getInteger("balloons") || userData.swag.balloons;
    const mobiles = interaction.options.getInteger("mobiles") || userData.swag.mobile;
    const bikes = interaction.options.getInteger("bikes") || userData.swag.bike;
    let multiplier = interaction.options.getNumber("multiplier") || userData.votes;

    // Check if any changes were made
    if (
      balance === userData.balance &&
      level === userData.level &&
      balloons === userData.balloons &&
      mobiles === userData.mobile &&
      bikes === userData.bike &&
      multiplier === userData.votes
    ) return redEmbed(interaction, client, {
      type: "editReply",
      title: lang.errorTitle,
      description: lang.modifyProfileError.replace("{user}", `<@${user.id}>`),
      footer: client.user.username,
      ephemeral: false
    });

    // Check for negative values
    if (balance < 0 || level < 0 || balloons < 0 || mobiles < 0 || bikes < 0 || multiplier < 0)
      return redEmbed(interaction, client, {
        type: "editReply",
        title: lang.errorTitle,
        description: lang.amountErrorNegativeNumberContent,
        footer: client.user.username,
        ephemeral: false
      });

    // Round multiplier to 2 decimal places if it's a positive number
    if (multiplier && multiplier >= 0) multiplier = multiplier.toFixed(2);

    // Update user data
    userData.balance = balance;
    userData.level = level;
    userData.swag.balloons = balloons;
    userData.swag.mobile = mobiles;
    userData.swag.bike = bikes;
    userData.votes = multiplier;
    await userData.save();

    // Send success message with updated profile information
    return greenEmbed(interaction, client, {
      type: "editReply",
      title: lang.succesfulTitle,
      description: lang.modifyProfileContent.replace("{user}", `<@${user.id}>`),
      fields: [
        { name: lang.balanceField, value: `${balance.toLocaleString() || "-"}`, inline: true },
        { name: lang.levelField, value: `${userData.level.toLocaleString() || "-"}`, inline: true },
        { name: lang.balloon, value: `${userData.swag.balloons.toLocaleString() || "-"}`, inline: true },
        { name: lang.mobile, value: `${userData.swag.mobile.toLocaleString() || "-"}`, inline: true },
        { name: lang.bike, value: `${userData.swag.bike.toLocaleString() || "-"}`, inline: true },
        { name: lang.multiplierField, value: `${userData.votes || "-"}`, inline: true },
      ],
      footer: client.user.username,
      ephemeral: false
    });
  },
};
