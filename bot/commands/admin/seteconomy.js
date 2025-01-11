const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Guild = require("../../../mongoDB/Guild");
const { redEmbed, greenEmbed } = require("../../functions/interactionEmbed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("seteconomy")
        .setDescription("Change the type of economy between local and global.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    commandId: "1321098630265835530",
    admin: false,
    category: "admin",
    async execute(interaction, client, lang) {
        let guildData = await Guild.findOne({ guildId: interaction.guild.id });
        if (interaction.user.id !== interaction.guild.ownerId)
            return redEmbed(interaction, client, {
                type: "editReply",
                title: lang.errorTitle,
                description: lang.onlyGuildOwner
                    .replace("{owner}", `<@${interaction.guild.ownerId}>`),
                footer: client.user.username,
                ephemeral: false
            });

        if (guildData) {
            guildData.economyType = !guildData.economyType;
            await guildData.save();
            return greenEmbed(interaction, client, {
                type: "editReply",
                title: lang.succesfulTitle,
                description: lang.setEconomy
                    .replace("{type}", guildData.economyType ? lang.local : lang.global),
                footer: client.user.username,
                ephemeral: false
            });
        };

    },
};
