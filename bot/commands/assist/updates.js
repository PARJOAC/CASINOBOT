const { SlashCommandBuilder } = require("discord.js");
const { blueEmbed } = require("../../functions/interactionEmbed");

module.exports = {
    // Define the slash command using SlashCommandBuilder
    data: new SlashCommandBuilder()
        .setName("updates")
        .setDescription("See the latest update of the bot (english only)"),
    category: "assist",
    commandId: "1307993499874099242",

    // Execute function for the slash command
    async execute(interaction, client) {
        // Use blueEmbed function to create and send an embed message
        return blueEmbed(interaction, client, {
            type: "editReply",
            title: "Version 2.4.1 released! 12/01/2025 (DD/MM/YYYY)",
            description: `Thank you for gambling with <@${client.user.id}>!\nThis version includes the following:\n`,
            // Define fields for the embed, each representing a section of the update
            fields: [
                {
                    name: "🐛 Bug Fixes",
                    value: "\n- Crime command give millions coins.\n- Bot optimization (less lag)\n- In the profile command, in the section of the last times played, the buttons did not exist\n- When you won an item, it was duplicated to what you already had.\n- Correction of messages to make them more readable\n- When you added, removed money, or deleted an account, the message was sent to the person executing the command instead of the end user.",
                    inline: false,
                },
                {
                    name: "📊 Balances",
                    value: "- Crime command give around 1,500 and 10,000 coins.\n- You can won bikes on games to sell.",
                    inline: false,
                },
                {
                    name: "🆕 New",
                    value: "- /crime command added.\n- /seteconomy added.\n- Greek Language added.\n- The /profile command messages have been changed for better user readability.\n- /serverinfo added to view server information\n- Improvements to administration commands\n- New /setcommand added to Add/Remove commands con servers",
                    inline: false,
                },
                {
                    name: "📝 Notes",
                    value: "To get help, report a bug or make suggestions, join the support server: https://discord.gg/p8CDnWHZJq",
                    inline: false,
                },
            ],
            footer: client.user.username,
            ephemeral: false
        });
    },
};
