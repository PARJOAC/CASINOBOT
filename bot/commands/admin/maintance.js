const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { redEmbed, greenEmbed, yellowEmbed } = require("../../functions/interactionEmbed");
const Status = require("../../../mongoDB/Status");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("maintance")
        .setDescription("Toggle the bot's maintenance mode (creator bot only)")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    category: "admin",
    admin: true,
    commandId: "1312918452163575839",
    async execute(interaction, client, lang) {
        if (interaction.user.id !== process.env.OWNER_ID)
            return redEmbed(interaction, client, {
                type: "editReply",
                title: lang.errorTitle,
                description: lang.onlyCreatorBot,
                footer: client.user.username,
                ephemeral: false
            });

        let status = await Status.findOne();

        if (!status) {
            status = new Status({
                statusBot: false,
                maintenanceStartTime: 0,
            });
            await status.save();
        };

        status.statusBot = !status.statusBot;
        await status.save();

        if (maintenanceChannel && maintenanceChannel.isTextBased())
            await yellowEmbed(process.env.MAINTENANCE_CHANNEL_ID, client, {
                title: status.statusBot ? "⚠️ Bot Maintenance Activated" : "✅ Bot Maintenance Deactivated",
                description: status.statusBot ? "The bot is now in maintenance mode. Some features may be unavailable." : `The bot is fully operational again!`,
                fields: [
                    { name: "Bot Name", value: client.user.username, inline: true },
                    { name: "Status", value: status.statusBot ? "Maintenance" : "Operational", inline: true },
                ],
                footer: client.user.username
            });

        return greenEmbed(interaction, client, {
            type: "editReply",
            title: lang.succesfulTitle,
            description: `Status set to ${status.statusBot ? "Maintenance" : "Operational"}`,
            footer: client.user.username,
            ephemeral: false
        });

    },
};
