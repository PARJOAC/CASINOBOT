const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Guild = require("../../../mongoDB/Guild");
const { interactionEmbed } = require("../../functions/interactionEmbed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('seteconomy')
        .setDescription('Change the type of economy between local and global.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    commandId: "1321098630265835530",
    admin: false,
    category: "admin",
    async execute(interaction, client, lang) {
        const guildId = interaction.guild.id;
        let guildData = await Guild.findOne({ guildId: guildId });
        if(interaction.user.id !== interaction.guild.ownerId) return interaction.editReply({
            embeds: [
                await interactionEmbed({
                    title: lang.errorTitle,
                    description: lang.onlyGuildOwner
                    				 .replace("{owner}", `<@${interaction.guild.ownerId}>`),
                    color: 0xff0000,
                    footer: "CasinoBot",
                    client
                })
            ]
        })
        if (guildData) {
            guildData.economyType = !guildData.economyType;
            await guildData.save();
            return interaction.editReply({
                content: lang.setEconomy
                    .replace("{type}", guildData.economyType ? lang.local : lang.global)
            });
        }
    },
};
