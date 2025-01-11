const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { changeLanguage } = require("../../functions/getGuildLanguage");
const { greenEmbed } = require("../../functions/interactionEmbed");

const languages = [
    { name: "🇦🇪 Arabic", value: "ar" },
    { name: "🇨🇳 Chinese", value: "zh" },
    { name: "🇪🇸 Spanish", value: "es" },
    { name: "🇫🇷 French", value: "fr" },
    { name: "🇺🇸 English", value: "en" },
    { name: "🇮🇳 Hindi", value: "hi" },
    { name: "🇮🇹 Italian", value: "it" },
    { name: "🇩🇪 German", value: "de" },
    { name: "🇵🇱 Polish", value: "pl" },
    { name: "🇵🇹 Portuguese", value: "pt" },
    { name: "🇷🇺 Russian", value: "ru" },
    { name: "🇯🇵 Japanese", value: "ja" },
    { name: "🇬🇷 Greek", value: "el" },
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setlang")
        .setDescription("Change the language of the bot")
        .addStringOption((option) =>
            option
                .setName("lang")
                .setDescription("Choose the language")
                .setRequired(true)
                .addChoices(...languages.map(({ name, value }) => ({ name, value })))
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    category: "admin",
    admin: false,
    commandId: "1317911814880759909",
    async execute(interaction, client, lang) {
        const selectLang = interaction.options.getString("lang");

        lang = await changeLanguage(interaction.guild.id, selectLang);

        const selectedLanguage = languages.find((lang) => lang.value === selectLang)?.name || "🇺🇸 English";

        return greenEmbed(interaction, client, {
            type: "editReply",
            title: lang.succesfulTitle,
            description: lang.succesfulChangeLanguage
                .replace("{language}", selectedLanguage),
            footer: client.user.username,
            ephemeral: false
        });

    },
};
