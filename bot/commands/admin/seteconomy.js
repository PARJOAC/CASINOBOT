// Import required modules from discord.js and custom functions
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Guild = require("../../../mongoDB/Guild");
const { redEmbed, greenEmbed } = require("../../functions/interactionEmbed");

module.exports = {
    // Define the slash command using SlashCommandBuilder
    data: new SlashCommandBuilder()
        .setName("seteconomy")
        .setDescription("Change the type of economy between local and global.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    commandId: "1321098630265835530",
    admin: false,
    category: "admin",

    // Execute function for the slash command
    async execute(interaction, client, lang) {
        // Fetch guild data from the database
        let guildData = await Guild.findOne({ guildId: interaction.guild.id });

        // Check if the user is the guild owner
        if (interaction.user.id !== interaction.guild.ownerId)
            return redEmbed(interaction, client, {
                type: "editReply",
                title: lang.errorTitle,
                description: lang.onlyGuildOwner
                    .replace("{owner}", `<@${interaction.guild.ownerId}>`),
                footer: client.user.username,
                ephemeral: false
            });

        // If guild data exists, toggle the economy type
        if (guildData) {
            guildData.economyType = !guildData.economyType;
            await guildData.save();

            // Send a success message with the new economy type
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
