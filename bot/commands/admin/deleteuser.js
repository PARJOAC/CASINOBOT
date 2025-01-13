// Import required modules from discord.js and custom functions
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const Player = require("../../../mongoDB/Player");
const { playerGuild } = require("../../../mongoDB/GuildPlayer");
const { redEmbed, greenEmbed } = require("../../functions/interactionEmbed");
const { getSetUser } = require("../../functions/getSet");
const { userCanUseCommand } = require("../../functions/checkAdminCommand");

module.exports = {
  // Define the slash command using SlashCommandBuilder
  data: new SlashCommandBuilder()
    .setName("deleteuser")
    .setDescription("Delete a user from the database")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Select the user to delete from the database")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for deleting the user")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: "admin",
  admin: false,
  commandId: "1296240894214934529",

  // Execute function for the slash command
  async execute(interaction, client, lang) {
    // Check if the user can use this command
    const check = await userCanUseCommand(interaction, lang, client);
    if (check.status) return;

    // Get the target user from command options
    const targetUser = interaction.options.getUser("target");

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

    let player;

    // Get the PlayerGuild model for the current guild
    const PlayerGuild = await playerGuild(interaction.guild.id);

    // Find the player in the database based on the economy type
    check.guildData.economyType ? player = await PlayerGuild.findOne({ userId: targetUser.id }) :
      player = await Player.findOne({ userId: targetUser.id });

    // If player not found, send an error message
    if (!player)
      return redEmbed(interaction, client, {
        type: "editReply",
        title: lang.errorTitle,
        description: lang.userNotFoundOnDataBase
          .replace("{user}", targetUser.id),
        footer: client.user.username,
        ephemeral: false
      });

    // Delete the player from the database based on the economy type
    check.guildData.economyType ? await PlayerGuild.deleteOne({ userId: targetUser.id }) : await Player.deleteOne({ userId: targetUser.id });

    // Send a success message to the command user
    await greenEmbed(interaction, client, {
      type: "editReply",
      title: lang.succesfulTitle,
      description: lang.succesfulDeletedUserContent.replace("{user}", targetUser.id),
      footer: client.user.username,
      ephemeral: false
    });

    try {
      // Get the reason for deleting the user (if provided)
      const reason = interaction.options.getString("reason") || lang.noReason;

      // Create an embed to send to the deleted user
      const embed = new EmbedBuilder()
        .setColor(parseInt(process.env.GREEN_COLOR))
        .setTitle(lang.userDeletedNotifyTitle)
        .setDescription(lang.userDeletedNotifyContent.replace("{user}", interaction.user.username))
        .addFields(
          { name: lang.serverName, value: interaction.guild.name, inline: false },
          { name: lang.reason, value: reason, inline: false }
        )
        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

      // Send the embed to the deleted user
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
