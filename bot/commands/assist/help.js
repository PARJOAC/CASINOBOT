const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { blueEmbed } = require("../../functions/interactionEmbed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Show available commands"),
    category: "assist",
    commandId: "1296240894306943039",
    async execute(interaction, client, lang) {

        const commandFolders = fs.readdirSync(path.join(__dirname, "..", "..", "commands"));
        const commandCategories = {};

        for (const folder of commandFolders) {
            const commandFiles = fs
                .readdirSync(path.join(__dirname, "..", "..", "commands", folder))
                .filter((file) => file.endsWith(".js"));

            commandCategories[folder] = [];
            for (const file of commandFiles) {
                const command = require(path.join(
                    __dirname,
                    "..",
                    "..",
                    "commands",
                    folder,
                    file
                ));
                if (command.admin) continue;
                const commandInfo = lang.commands[command.data.name];
                commandCategories[folder].push({
                    name: commandInfo ? commandInfo.name : command.data.name,
                    description: commandInfo
                        ? commandInfo.description
                        : command.data.description,
                    commandId: command.commandId
                });
            };
        };

        const categoryEmbeds = Object.entries(commandCategories).map(
            ([category, commands]) => {
                const commandList =
                    commands
                        .map((command) => `</${command.name}:${command.commandId}> -> ${command.description}`)
                        .join("\n\n") || lang.noCommands;

                const categoryEmojiMap = {
                    admin: "⚙️",
                    assist: "❗",
                    economy: "💰",
                    games: "🎮",
                    users: "👤",
                };

                return {
                    title: `${categoryEmojiMap[category] || "📜"} ${lang.categories[category] ||
                        category.charAt(0).toUpperCase() + category.slice(1)
                        }`,
                    description: commandList,
                    color: parseInt(process.env.BLUE_COLOR, 16),
                };
            }
        );

        const categoryEmojis = ["⚙️", "❗", "💰", "🎮", "👤"];
        const row = new ActionRowBuilder();

        categoryEmojis.forEach((emoji, index) => {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`category_${index}`)
                    .setLabel(
                        `${emoji} ${lang.categories[Object.keys(commandCategories)[index]] || "More"
                        }`
                    )
                    .setStyle(ButtonStyle.Primary)
            );
        });

        await blueEmbed(interaction, client, {
            type: "editReply",
            title: lang.helpWelcome.title,
            description: lang.helpWelcome.description,
            footer: client.user.username,
            ephemeral: false,
            components: [row]
        });

        const message = await interaction.fetchReply();

        const collector = message.createMessageComponentCollector({ time: 120000 });

        collector.on("collect", async (buttonInteraction) => {
            const index = parseInt(buttonInteraction.customId.split("_")[1]);

            if (index >= 0 && index < categoryEmbeds.length) {
                await buttonInteraction.update({
                    embeds: [categoryEmbeds[index]],
                    components: [row],
                });
            };
        });

        collector.on("end", () => {
            message.edit({ components: [] });
        });

    },
};
