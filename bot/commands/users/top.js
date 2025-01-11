const { SlashCommandBuilder } = require("discord.js");
const Player = require("../../../mongoDB/Player");
const Guild = require("../../../mongoDB/Guild");
const { playerGuild } = require("../../../mongoDB/GuildPlayer");
const { greenEmbed, redEmbed } = require("../../functions/interactionEmbed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("top")
        .setDescription("Show the Top 10 players with the most money or highest level")
        .addStringOption((option) =>
            option
                .setName("category")
                .setDescription("Choose whether to view the top by money or level")
                .setRequired(true)
                .addChoices(
                    { name: "Money", value: "balance" },
                    { name: "Level", value: "level" }
                )
        )
        .addStringOption((option) =>
            option
                .setName("scope")
                .setDescription("Choose whether to view the top globally or server-specific")
                .setRequired(true)
                .addChoices(
                    { name: "Global", value: "global" },
                    { name: "Server", value: "server" }
                )
        ),
    category: "users",
    commandId: "1296240894306943042",
    async execute(interaction, client, lang) {
        const category = interaction.options.getString("category");
        const scope = interaction.options.getString("scope");
        const guildData = await Guild.findOne({ guildId: interaction.guild.id });

        let topPlayers;

        await greenEmbed(interaction, client, {
            type: "editReply",
            title: lang.topTitle.replace("{category}", category === "balance" ? lang.moneyTitle : lang.levelTitle),
            description: lang.waiting,
            footer: client.user.username,
            ephemeral: false
        });

        const PlayerGuild = await playerGuild(interaction.guild.id);

        try {
            if (scope === "global") {
                if (guildData.economyType) {
                    topPlayers = await PlayerGuild.find().sort(category === "balance" ? { balance: -1 } : { level: -1 }).limit(10);
                } else {
                    topPlayers = await Player.find().sort(category === "balance" ? { balance: -1 } : { level: -1 })
                        .limit(10);
                }
            } else if (scope === "server") {
                const members = await interaction.guild.members.fetch();
                const memberIds = members
                    .map((member) => member.user.id);

                if (guildData.economyType) {
                    topPlayers = await PlayerGuild.find({ userId: { $in: memberIds } }).sort(category === "balance" ? { balance: -1 } : { level: -1 }).limit(10);
                } else {
                    topPlayers = await Player.find({ userId: { $in: memberIds } }).sort(category === "balance" ? { balance: -1 } : { level: -1 }).limit(10);
                }
            }

            if (!topPlayers || topPlayers.length === 0)
                return redEmbed(interaction, client, {
                    type: "editReply",
                    description: lang.errorNotPlayerFound,
                    footer: client.user.username,
                    ephemeral: false
                });

            let topMessage = (
                await Promise.all(
                    topPlayers.map(async (player, index) => {
                        try {
                            let user = client.users.cache.get(player.userId);

                            if (!user) {
                                user = await client.users.fetch(player.userId).catch(() => null);
                            }

                            const playerInfo = user
                                ? `${user.username} (${user.id})`
                                : lang.unknownTopPlayer;

                            return lang.top10Content
                                .replace("{topNumber}", index + 1)
                                .replace("{user}", playerInfo)
                                .replace(
                                    "{category}",
                                    category === "balance"
                                        ? `**${player.balance.toLocaleString()}** 💰`
                                        : lang.topLevelContent.replace("{level}", player.level)
                                );
                        } catch (error) {
                            return lang.unknownTopPlayer;
                        }
                    })
                )
            ).filter((message) => message !== null);

            topMessage = Array.isArray(topMessage) ? topMessage : [];
            topMessage = topMessage.join("\n\n");

            return greenEmbed(interaction, client, {
                type: "editReply",
                description: topMessage,
                footer: client.user.username,
                ephemeral: false
            });

        } catch (error) {
            return redEmbed(interaction, client, {
                type: "editReply",
                title: lang.errorTitle,
                footer: client.user.username,
                ephemeral: false
            });
        };

    },
};
