const { SlashCommandBuilder } = require("discord.js");
const { interactionEmbed } = require("../../functions/interactionEmbed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("updates")
        .setDescription("See the latest update of the bot (english only)"),
    category: "assist",
    commandId: "1307993499874099242",
    async execute(interaction, client) {

        return interaction.editReply({
            embeds: [
                await interactionEmbed({
                    title: "Version 2.2 released! 24/12/2024 (DD/MM/YYYY)",
                    description: `Thank you for gambling with <@${client.user.id}>!\nThis version includes the following:\n`,
                    color: 0x3498db,
                    footer: "CasinoBot",
                    client,
                    fields: [
                        {
                            name: "🐛 Bug Fixes",
                            value: "\n- Crime command give millions coins.",
                            inline: false,
                        },
                        {
                            name: "📊 Balances",
                            value: "- Crime command give around 1,500 and 10,000 coins.",
                            inline: false,
                        },
                        {
                            name: "🆕 New Commands",
                            value: "- Command to do crime added /crime.\n- Command to change economy type added /seteconomy.\n- Admin Command added on local economy /addmoney, /removemoney and /deleteuser, you can't use on global economy.",
                            inline: false,
                        },
                        {
                            name: "📝 Notes",
                            value: "To get help, report a bug or make suggestions, join the support server: https://discord.gg/p8CDnWHZJq",
                            inline: false,
                        },
                    ],
                }),
            ],
        });
    },
};
