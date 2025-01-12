const { Events, PermissionsBitField } = require("discord.js");
const { getGuildLanguage } = require("../functions/getGuildLanguage");
const { logCommand } = require("../functions/logEmbeds");
const { getDataUser } = require("../functions/getDataUser");
const { redEmbed } = require("../functions/interactionEmbed");
const { delSet } = require("../functions/getSet");
const Status = require("../../mongoDB/Status");
const Guild = require("../../mongoDB/Guild");

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction, client) {
        if (!interaction) return;
        if (!interaction.isCommand()) return;
        if (!interaction.isChatInputCommand()) return;
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        if (!interaction.guild) {
            return interaction.reply({
                content: "This command can only be used within a server.",
                ephemeral: true,
            });
        }

        const lang = await getGuildLanguage(interaction.guild.id);

        let status = await Status.findOne();
        if (!status) {
            status = new Status({ statusBot: false });
            await status.save();
        }

        if (status.statusBot && interaction.user.id !== "714376484139040809")
            return redEmbed(interaction, client, {
                type: "reply",
                title: "🚧 Bot Under Maintenance",
                description: "**We're currently performing maintenance on the bot.** Some commands might be temporarily unavailable or may not function as expected.\n\nStay updated on the bot's status by visiting the <#1315334265910853632> channel in our [Support Server](https://discord.gg/p8CDnWHZJq).",
                fields: [
                    { name: "Why Maintenance?", value: "We're working to improve the bot's performance and introduce exciting new features!", inline: false },
                    { name: "Need Help?", value: "Feel free to ask questions or report issues in our support server. We'll get back to you as soon as possible!", inline: false }
                ],
                footer: client.user.username,
                ephemeral: true
            });

        const requiredPermissions = [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.EmbedLinks,
            PermissionsBitField.Flags.UseExternalEmojis,
            PermissionsBitField.Flags.MentionEveryone,
            PermissionsBitField.Flags.UseApplicationCommands,
            PermissionsBitField.Flags.UseExternalStickers,
            PermissionsBitField.Flags.SendMessagesInThreads,
            PermissionsBitField.Flags.ReadMessageHistory,
        ];

        const permissionNames = {
            [PermissionsBitField.Flags.ViewChannel]: "View Channel",
            [PermissionsBitField.Flags.SendMessages]: "Send Messages",
            [PermissionsBitField.Flags.EmbedLinks]: "Embed Links",
            [PermissionsBitField.Flags.UseExternalEmojis]: "Use External Emojis",
            [PermissionsBitField.Flags.MentionEveryone]: "Mention @everyone, @here, and All Roles",
            [PermissionsBitField.Flags.UseApplicationCommands]: "Use Application Commands",
            [PermissionsBitField.Flags.UseExternalStickers]: "Use External Stickers",
            [PermissionsBitField.Flags.SendMessagesInThreads]: "Send Messages in Threads",
            [PermissionsBitField.Flags.ReadMessageHistory]: "Read Message History"

        };

        const botPermissions = interaction.channel.permissionsFor(client.user);
        const missingPermissions = requiredPermissions.filter(
            (perm) => !botPermissions || !botPermissions.has(perm)
        );

        if (missingPermissions.length > 0) {
            const missingPermissionsNames = missingPermissions.map(
                (perm) => permissionNames[perm]
            );

            return redEmbed(interaction, client, {
                type: "reply",
                title: lang.errorTitle,
                description: lang.noPermission.replace(
                    "{permissions}",
                    missingPermissionsNames
                        .map((perm) => `• **${perm}**`)
                        .join("\n")
                ),
                footer: client.user.username,
                ephemeral: true
            });
        };

        let guildData = await Guild.findOne({ guildId: interaction.guild.id });
        if (guildData && guildData.commandsNotUsed.includes(interaction.commandName))
            return redEmbed(interaction, client, {
                type: "reply",
                title: lang.errorTitle,
                description: lang.commandDisabled.replace("{command}", interaction.commandName),
                footer: client.user.username,
                ephemeral: true
            });

        let playerData = await getDataUser(interaction.user.id, interaction.guild.id);

        if (interaction.isChatInputCommand() && !interaction.replied && !interaction.deferred) {
            try {
                await interaction.deferReply();
            } catch {
                await delSet(interaction.user.id);
                return;
            };
        };

        try {
            logCommand(interaction, client);
            await command.execute(interaction, client, lang, playerData);
        } catch (error) {
            await delSet(interaction.user.id);
            if (!interaction.isRepliable()) return;

            console.log(error)

            if (interaction.deferred) {
                return redEmbed(interaction, client, {
                    type: "editReply",
                    title: lang.errorTitle,
                    description: lang.errorCommand,
                    footer: client.user.username,
                    ephemeral: true
                });
            } else if (interaction.replied) {
                return redEmbed(interaction, client, {
                    type: "followUp",
                    title: lang.errorTitle,
                    description: lang.errorCommand,
                    footer: client.user.username,
                    ephemeral: true
                });
            } else {
                return redEmbed(interaction, client, {
                    type: "reply",
                    title: lang.errorTitle,
                    description: lang.errorCommand,
                    footer: client.user.username,
                    ephemeral: true
                });
            };
        };

    },
};
