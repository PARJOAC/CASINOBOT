const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Player = require("../../../mongoDB/Player");
const { playerGuild } = require("../../../mongoDB/GuildPlayer");
const { redEmbed, greenEmbed } = require("../../functions/interactionEmbed");
const { getSetUser } = require("../../functions/getSet");
const { userCanUseCommand } = require("../../functions/checkAdminCommand");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deleteuser")
    .setDescription("Delete a user from the database")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Select the user to delete from the database")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: "admin",
  admin: false,
  commandId: "1296240894214934529",
  async execute(interaction, client, lang) {
    const check = await userCanUseCommand(interaction, lang, client);
    if (check.status) return;

    const targetUser = interaction.options.getUser("target");

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

    const PlayerGuild = await playerGuild(interaction.guild.id);

    check.guildData.economyType ? player = await PlayerGuild.findOne({ userId: targetUser.id }) :
      player = await Player.findOne({ userId: targetUser.id });

    if (!player)
      return redEmbed(interaction, client, {
        type: "editReply",
        title: lang.errorTitle,
        description: lang.userNotFoundOnDataBase
          .replace("{user}", targetUser.id),
        footer: client.user.username,
        ephemeral: false
      });

    check.guildData.economyType ? await PlayerGuild.deleteOne({ userId: targetUser.id }) : await Player.deleteOne({ userId: targetUser.id });

    return greenEmbed(interaction, client, {
      type: "editReply",
      title: lang.succesfulTitle,
      description: lang.succesfulDeletedUserContent
        .replace("{user}", targetUser.id),
      footer: client.user.username,
      ephemeral: false
    });

  },
};