// Import required modules from discord.js and custom functions
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { blueEmbed } = require("../../functions/interactionEmbed");

module.exports = {
    // Define the slash command using SlashCommandBuilder
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Show available commands"),
    category: "assist",
    commandId: "1296240894306943039",

    // Execute function for the slash command
    async execute(interaction, client, lang) {

        // Read command folders from the commands directory
        const commandFolders = fs.readdirSync(path.join(__dirname, "..", "..", "commands"));
        const commandCategories = {};

        // Iterate through each command folder
        for (const folder of commandFolders) {
            // Read command files from each folder
            const commandFiles = fs
                .readdirSync(path.join(__dirname, "..", "..", "commands", folder))
                .filter((file) => file.endsWith(".js"));

            commandCategories[folder] = [];
            // Process each command file
            for (const file of commandFiles) {
                const command = require(path.join(
                    __dirname,
                    "..",
                    "..",
                    "commands",
                    folder,
                    file
                ));
                // Skip admin commands
                if (command.admin) continue;
                // Get command info from language file or use default values
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

        // Create embeds for each command category
        const categoryEmbeds = Object.entries(commandCategories).map(
            ([category, commands]) => {
                // Create a list of commands for the category
                const commandList =
                    commands
                        .map((command) => `</${command.name}:${command.commandId}> -> ${command.description}`)
                        .join("\n\n") || lang.noCommands;

                // Define emoji mappings for categories
                const categoryEmojiMap = {
                    admin: "⚙️",
                    assist: "❗",
                    economy: "💰",
                    games: "🎮",
                    users: "👤",
                };

                // Create and return the embed for the category
                return {
                    title: `${categoryEmojiMap[category] || "📜"} ${lang.categories[category] ||
                        category.charAt(0).toUpperCase() + category.slice(1)
                        }`,
                    description: commandList,
                    color: parseInt(process.env.BLUE_COLOR, 16),
                };
            }
        );

        // Define category emojis for buttons
        const categoryEmojis = ["⚙️", "❗", "💰", "🎮", "👤"];
        const row = new ActionRowBuilder();

        // Create buttons for each category
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

        // Send the initial help message with buttons
        const message = await blueEmbed(interaction, client, {
            type: "editReply",
            title: lang.helpWelcome.title,
            description: lang.helpWelcome.description,
            footer: client.user.username,
            ephemeral: false,
            components: [row],
            fetchReply: true
        });

        // Create a collector for button interactions
        const collector = message.createMessageComponentCollector({ time: 120000 });

        // Handle button clicks
        collector.on("collect", async (buttonInteraction) => {
            const index = parseInt(buttonInteraction.customId.split("_")[1]);

            if (index >= 0 && index < categoryEmbeds.length) {
                await buttonInteraction.update({
                    embeds: [categoryEmbeds[index]],
                    components: [row],
                });
            };
        });

        // Remove buttons when the collector ends
        collector.on("end", () => {
            interaction.editReply({ components: [] });
        });

    },
};
