const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Guild = require("../../../mongoDB/Guild");
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
        const guildData = await Guild.findOne({ guildId: interaction.guild.id });

        return greenEmbed(interaction, client, {
            type: "editReply",
            title: lang.serverInfoTitle,
            fields: [
                { name: lang.serverName, value: interaction.guild.name, inline: true },
                { name: lang.serverMembers, value: interaction.guild.memberCount, inline: true },
                { name: lang.economyType, value: guildData.economyType ? lang.local : lang.global, inline: true }
            ],
            thumbnail: interaction.guild.iconURL({ dynamic: true }),
            footer: client.user.username,
            ephemeral: false
        });

    },
};
