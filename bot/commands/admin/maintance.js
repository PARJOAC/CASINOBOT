// Import required modules from discord.js and custom functions
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { redEmbed, greenEmbed, yellowEmbed } = require("../../functions/interactionEmbed");
const Status = require("../../../mongoDB/Status");

module.exports = {
    // Define the slash command using SlashCommandBuilder
    data: new SlashCommandBuilder()
        .setName("maintance")
        .setDescription("Toggle the bot's maintenance mode (creator bot only)")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    category: "admin",
    admin: true,
    commandId: "1312918452163575839",

    // Execute function for the slash command
    async execute(interaction, client, lang) {
        // Check if the user is the bot owner
        if (interaction.user.id !== process.env.OWNER_ID)
            return redEmbed(interaction, client, {
                type: "editReply",
                title: lang.errorTitle,
                description: lang.onlyCreatorBot,
                footer: client.user.username,
                ephemeral: false
            });

        // Find or create the status document in the database
        let status = await Status.findOne();

        if (!status) {
            status = new Status({
                statusBot: false,
                maintenanceStartTime: 0,
            });
            await status.save();
        };

        // Toggle the maintenance status
        status.statusBot = !status.statusBot;
        await status.save();

        // Fetch the maintenance channel
        let maintenanceChannel = await client.channels.fetch(process.env.MAINTENANCE_CHANNEL_ID);

        // Send a notification to the maintenance channel if it exists and is a text channel
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

        // Send a confirmation message to the user who executed the command
        return greenEmbed(interaction, client, {
            type: "editReply",
            title: lang.succesfulTitle,
            description: `Status set to ${status.statusBot ? "Maintenance" : "Operational"}`,
            footer: client.user.username,
            ephemeral: false
        });
    },
};
