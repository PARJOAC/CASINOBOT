const { delSet, addSet } = require("./getSet");
const { interactionEmbed } = require("./interactionEmbed");

async function initInfo(interaction, processChannel) {
    const logChannel = interaction.client.guilds.cache
        .get(process.env.GUILD_ID)
        .channels.cache.get(process.env[processChannel]);

    const user = await interaction.client.users.fetch(interaction.user.id);
    const guild = interaction.guild;
    const channel = interaction.channel;

    return { logChannel, user, guild, channel };
}

async function logEmbedWin(nameGame, betAmount, totalBalance, won, interaction, client) {
    await delSet(interaction.user.id);
    const info = await initInfo(interaction, "GAMES_LOG_CHANNEL_ID");

    return info.logChannel.send({
        embeds: [
            await interactionEmbed({
                title: `${nameGame} | Win 🎉`,
                description: `**🧑 User:** ${info.user.username} (**${info.user.id}**)\n**🏠 Server:** ${info.guild.name} (**${info.guild.id
                    }**)\n\n**💰 Bet Amount:** ${betAmount.toLocaleString()} <:blackToken:1304186797064065065>\n**🏅 Won:** ${won.toLocaleString()} <:blackToken:1304186797064065065>\n**🔖 Total Balance:** ${totalBalance.toLocaleString()} <:blackToken:1304186797064065065>`,
                color: 0x00ff00,
                thumbnail: info.user.displayAvatarURL({ dynamic: true }),
                footer: "© 2024 - All rights reserved to the developer",
                client
            })
        ]
    });
}

async function logEmbedLose(nameGame, betAmount, totalBalance, interaction, client) {
    await delSet(interaction.user.id);
    const info = await initInfo(interaction, "GAMES_LOG_CHANNEL_ID");

    return info.logChannel.send({
        embeds: [
            await interactionEmbed({
                title: `${nameGame} | Lose 😢`,
                description: `**🧑 User:** ${info.user.username} (**${info.user.id}**)\n**🏠 Server:** ${info.guild.name} (**${info.guild.id}**)\n\n**💰 Bet Amount:** ${betAmount.toLocaleString()} <:blackToken:1304186797064065065>\n**❌ Lose:** ${betAmount.toLocaleString()} <:blackToken:1304186797064065065>\n**🔖 Total Balance:** ${totalBalance.toLocaleString()} <:blackToken:1304186797064065065>`,
                color: 0xff0000,
                thumbnail: info.user.displayAvatarURL({ dynamic: true }),
                footer: "© 2024 - All rights reserved to the developer",
                client
            })
        ]
    });
}

async function logEmbedTie(nameGame, betAmount, totalBalance, interaction, client) {
    await delSet(interaction.user.id);
    const info = await initInfo(interaction, "GAMES_LOG_CHANNEL_ID");

    return info.logChannel.send({
        embeds: [
            await interactionEmbed({
                title: `${nameGame} | Tie 🤝`,
                description: `**🧑 User:** ${info.user.username} (**${info.user.id}**)\n**🏠 Server:** ${info.guild.name} (**${info.guild.id
                    }**)\n\n**💰 Bet Amount:** ${betAmount.toLocaleString()} <:blackToken:1304186797064065065>\n**🔖 Total Balance:** ${totalBalance.toLocaleString()} <:blackToken:1304186797064065065>`,
                color: 0xf4d03f,
                thumbnail: info.user.displayAvatarURL({ dynamic: true }),
                footer: "© 2024 - All rights reserved to the developer",
                client
            })
        ]
    });
}

async function logEmbedVotes(rewardVote, interaction, client) {
    const info = await initInfo(interaction, "VOTES_LOG_CHANNEL_ID");

    return info.logChannel.send({
        embeds: [
            await interactionEmbed({
                title: `New Vote 🎉`,
                description: `**🧑 User:** ${info.user.username} (**${info.user.id}**)\n**🏠 Server:** ${info.guild.name} (**${info.guild.id}**)\n\n**🎁 Reward:** ${rewardVote}`,
                color: 0x3498db,
                thumbnail: info.user.displayAvatarURL({ dynamic: true }),
                footer: "© 2024 - All rights reserved to the developer",
                client
            })
        ]
    });
}

async function logCommand(nameCommand, interaction, lang, client) {
    await addSet(interaction);
    const info = await initInfo(interaction, "COMMANDS_LOG_CHANNEL_ID");

    const options = interaction.options.data.map(option => `${option.name}: ${option.value}`).join(" ");

    return info.logChannel.send({
        embeds: [
            await interactionEmbed({
                title: `${nameCommand} | Command Executed 🔎`,
                description: `**🧑 User:** ${info.user.username} (**${info.user.id}**)\n**🏠 Server:** ${info.guild.name} (**${info.guild.id}**)\n**📢 Channel:** ${info.channel.name} (**${info.channel.id}**)\n\n**📝 Executed Command:**\n\`\`\`/${nameCommand} ${options}\`\`\`\n`,
                color: 0x82e0aa,
                thumbnail: info.user.displayAvatarURL({ dynamic: true }),
                footer: "© 2024 - All rights reserved to the developer",
                client
            })
        ]
    });
}

module.exports = { logEmbedWin, logEmbedLose, logEmbedTie, logEmbedVotes, logCommand };
