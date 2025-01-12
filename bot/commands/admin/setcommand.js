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
    data: new SlashCommandBuilder()
        .setName("setcommand")
        .setDescription("Add/Remove command on the server")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    category: "admin",
    admin: false,
    commandId: "1296240894214934528",
    async execute(interaction, client, lang) {
        let guildData = await Guild.findOne({ guildId: interaction.guild.id });
        if (interaction.user.id !== interaction.guild.ownerId)
            return redEmbed(interaction, client, {
                type: "editReply",
                title: lang.errorTitle,
                description: lang.onlyGuildOwner
                    .replace("{owner}", `<@${interaction.guild.ownerId}>`),
                footer: client.user.username,
                ephemeral: false
            });

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

        const pageSize = 9;
        const totalPages = Math.ceil(commands.length / pageSize);
        let currentPage = 0;

        const getPageOptions = (page) => commands
            .slice(page * pageSize, (page + 1) * pageSize)
            .map((cmd) => ({
                label: cmd.label,
                value: cmd.value,
                description: cmd.description,
            }));

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

        const menu = new StringSelectMenuBuilder()
            .setCustomId("select-command")
            .setPlaceholder(lang.selectedCommand)
            .addOptions(getPageOptions(currentPage));

        const rowMenu = new ActionRowBuilder().addComponents(menu);

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

        await interaction.editReply({
            embeds: [createEmbed(currentPage)],
            components: [rowMenu, rowButtons],
            ephemeral: true,
        });

        const filter = (i) => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time: 60000,
        });

        collector.on("collect", async (i) => {
            if (i.isButton()) {
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
                await i.deferUpdate();

                const selectedCommand = i.values[0];
                const commandsNotUsed = guildData.commandsNotUsed;

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

        collector.on("end", () => {
            interaction.editReply({ components: [] });
        });
    },
};
