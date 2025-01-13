// Import required modules from discord.js and custom functions
const {
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");
const Guild = require("../../../mongoDB/Guild");
const { redEmbed } = require("../../functions/interactionEmbed");

module.exports = {
    // Define the slash command using SlashCommandBuilder
    data: new SlashCommandBuilder()
        .setName("setcommand")
        .setDescription("Add/Remove command on the server")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    category: "admin",
    admin: false,
    commandId: "1328060955309117521",

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

        // Filter and map available commands
        const commands = client.commands
            .filter(
                (command) =>
                    command.data.name !== "setcommand" &&
                    !command.admin
            )
            .map((command) => ({
                label: `/${command.data.name}`,
                value: command.data.name,
            }));

        // Set up pagination
        const pageSize = 9;
        const totalPages = Math.ceil(commands.length / pageSize);
        let currentPage = 0;

        // Function to get options for the current page
        const getPageOptions = (page) => commands
            .slice(page * pageSize, (page + 1) * pageSize)
            .map((cmd) => ({
                label: cmd.label,
                value: cmd.value,
                description: cmd.description,
            }));

        // Function to create the embed for the current page
        const createEmbed = (page) => {
            const embed = new EmbedBuilder()
                .setTitle(lang.availableCommands)
                .setDescription(lang.totalPages.replace("{page}", page + 1).replace("{totalPages}", totalPages))
                .setColor(parseInt(process.env.BLUE_COLOR, 16))
                .setTimestamp()
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });

            const commandsOnPage = commands.slice(page * pageSize, (page + 1) * pageSize);
            for (const cmd of commandsOnPage) {
                const isDisabled = guildData.commandsNotUsed.includes(cmd.value) ? lang.disabled : lang.enabled;
                embed.addFields({
                    name: `${cmd.label}`,
                    value: `- ${isDisabled}`,
                    inline: true
                });
            }

            return embed;
        };

        // Create the select menu
        const menu = new StringSelectMenuBuilder()
            .setCustomId("select-command")
            .setPlaceholder(lang.selectedCommand)
            .addOptions(getPageOptions(currentPage));

        const rowMenu = new ActionRowBuilder().addComponents(menu);

        // Create navigation buttons
        const rowButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("previous-page")
                .setLabel(lang.previous)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === 0),
            new ButtonBuilder()
                .setCustomId("next-page")
                .setLabel(lang.next)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === totalPages - 1)
        );

        // Send the initial message with the embed and components
        await interaction.editReply({
            embeds: [createEmbed(currentPage)],
            components: [rowMenu, rowButtons],
            ephemeral: true,
        });

        // Set up a collector for user interactions
        const filter = (i) => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time: 60000,
        });

        // Handle collected interactions
        collector.on("collect", async (i) => {
            if (i.isButton()) {
                // Handle pagination buttons
                if (i.customId === "next-page") currentPage++;
                else if (i.customId === "previous-page") currentPage--;

                menu.setOptions(getPageOptions(currentPage));
                rowButtons.components[0].setDisabled(currentPage === 0);
                rowButtons.components[1].setDisabled(currentPage === totalPages - 1);

                await i.update({
                    embeds: [createEmbed(currentPage)],
                    components: [rowMenu, rowButtons],
                });
            } else if (i.isStringSelectMenu()) {
                // Handle command selection
                await i.deferUpdate();

                const selectedCommand = i.values[0];
                const commandsNotUsed = guildData.commandsNotUsed;

                // Toggle command usage status
                if (commandsNotUsed.includes(selectedCommand)) {
                    guildData.commandsNotUsed = commandsNotUsed.filter(command => command !== selectedCommand);
                } else {
                    guildData.commandsNotUsed.push(selectedCommand);
                }
                await guildData.save();

                const updatedEmbed = createEmbed(currentPage);

                await i.editReply({
                    embeds: [updatedEmbed],
                    components: [rowMenu, rowButtons],
                });
            }
        });

        // Handle collector end
        collector.on("end", () => {
            interaction.editReply({ components: [] });
        });
    },
};
