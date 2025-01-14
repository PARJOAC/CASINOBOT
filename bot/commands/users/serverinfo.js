const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Guild = require("../../../mongoDB/Guild");
const { greenEmbed } = require("../../functions/interactionEmbed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("serverinfo")
        .setDescription("Get information about the server and CasinoBot")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    category: "users",
    admin: false,
    commandId: "1327698840530325619",
    async execute(interaction, client, lang) {
        const guildData = await Guild.findOne({ guildId: interaction.guild.id });

        const disabledCommands = guildData.commandsNotUsed && guildData.commandsNotUsed.length > 0
            ? guildData.commandsNotUsed.map(cmd => `\`/${cmd}\``).join("\n")
            : lang.noDisabledCommands;

        return greenEmbed(interaction, client, {
            type: "editReply",
            title: lang.serverInfoTitle,
            fields: [
                { name: lang.serverName, value: interaction.guild.name, inline: false },
                { name: lang.serverMembers, value: `${interaction.guild.memberCount}`, inline: false },
                { name: lang.economyType, value: guildData.economyType ? lang.local : lang.global, inline: false },
                { name: lang.disabledCommands, value: disabledCommands, inline: false }
            ],
            thumbnail: interaction.guild.iconURL({ dynamic: true }),
            footer: client.user.username,
            ephemeral: false
        });

    },
};
