const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { userCanUseCommand } = require("../../functions/checkAdminCommand");
const { greenEmbed } = require("../../functions/interactionEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Get information about the server and CasinoBot")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: "admin",
  admin: false,
  commandId: "1296240894214934529",
  async execute(interaction, client, lang) {
    const check = await userCanUseCommand(interaction, lang, client);
    if (check.status) return;

    return greenEmbed(interaction, client, {
       title: lang.serverInfoTitle,
       fields: [
        { name: lang.serverName, value: interaction.guild.name, inline: true },
        { name: lang.serverOwner, value: interaction.guild.owner.user.tag, inline: true },
        { name: lang.serverMembers, value: interaction.guild.memberCount, inline: true },
        { name: lang.economyType, value: check.economyType ? lang.activated : lang.deactivated, inline: true }
       ],
       thumbnail: interaction.guild.iconURL({ dynamic: true }),
       footer: client.user.username,
       ephemeral: false
    });

  },
};
