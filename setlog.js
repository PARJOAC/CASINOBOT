const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const Guild = require("./mongoDB/Guild");
const { redEmbed, greenEmbed } = require("./bot/functions/interactionEmbed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setlog")
        .setDescription("Set log channels on server")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("Channel to send log games")
                .setRequired(false)
                .addChannelTypes(ChannelType.GuildText)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    commandId: "1321098630265835530",
    admin: false,
    category: "admin",
    async execute(interaction, client, lang) {
        if (interaction.user.id !== interaction.guild.ownerId)
            return redEmbed(interaction, client, {
                type: "editReply",
                title: lang.errorTitle,
                description: lang.onlyGuildOwner
                    .replace("{owner}", `<@${interaction.guild.ownerId}>`),
                footer: client.user.username,
                ephemeral: false
            });

        const channel = interaction.options.getChannel("channel");

        if (!channel)
            return redEmbed(interaction, client, {
                type: "editReply",
                title: lang.errorTitle,
                description: lang.noChannelSelected,
                footer: client.user.username,
                ephemeral: false,
            });

        let guildData = await Guild.findOne({ guildId: interaction.guild.id });

        guildData.logChannelId = channel.id;
        await guildData.save();

        await greenEmbed(interaction, client, {
            type: "editReply",
            title: lang.successTitle,
            description: lang.logChannelSet.replace("{channel}", channel.id),
            footer: client.user.username,
            ephemeral: true,
        });
    },
};
