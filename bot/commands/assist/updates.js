const { SlashCommandBuilder } = require("discord.js");
const { blueEmbed } = require("../../functions/interactionEmbed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("updates")
        .setDescription("See the latest update of the bot (english only)"),
    category: "assist",
    commandId: "1307993499874099242",
    async execute(interaction, client) {
        return blueEmbed(interaction, client, {
            type: "editReply",
            title: "Version 2.2.5 released! 06/01/2025 (DD/MM/YYYY)",
            description: `Thank you for gambling with <@${client.user.id}>!\nThis version includes the following:\n`,
            fields: [
                {
                    name: "🐛 Bug Fixes",
                    value: "\n- Crime command give millions coins.\n- Bot optimization (less lag)",
                    inline: false,
                },
                {
                    name: "📊 Balances",
                    value: "- Crime command give around 1,500 and 10,000 coins.\n- You can won bikes on games to sell.",
                    inline: false,
                },
                {
                    name: "🆕 New",
                    value: "- /crime command added.\n- /seteconomy added.\n- Greek Language added.\n- The /profile command messages have been changed for better user readability.",
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
