const { delSet } = require("./getSet");
const { greenEmbed, blueEmbed, redEmbed, yellowEmbed } = require("./interactionEmbed");
const { wonItem } = require("./wonItem");
const { winExperience } = require("./winExperience");
const { wonGame } = require("./wonGame");

async function initInfo(interaction, processChannel, client) {
    if (processChannel === "LOG_GAMES_CHANNEL_ID") delSet(interaction.user.id);

    const guild = interaction.guild;
    if (!client.guilds.cache.has(guild.id)) return;

    const logChannel = process.env[processChannel];

    const user = await interaction.client.users.fetch(interaction.user.id);
    const channel = interaction.channel;
    const commandName = interaction.commandName;

    return { logChannel, user, guild, channel, commandName };
};

async function logEmbedWin(betAmount, playerData, won, interaction, client, lang) {
    const info = await initInfo(interaction, "LOG_GAMES_CHANNEL_ID", client, lang);
    await wonGame(playerData, won, interaction, lang, client);
    //await wonItem(playerData, interaction, lang, client);
    //await winExperience(playerData, won);

    greenEmbed(info.logChannel, client, {
        title: `${info.commandName} | Win 🎉`,
        description: `**🧑 User:** ${info.user.username} (**${info.user.id}**)\n**🏠 Server:** ${info.guild.name} (**${info.guild.id
            }**)\n\n**💰 Bet Amount:** ${betAmount.toLocaleString()} <:blackToken:1304186797064065065>\n**🏅 Won:** ${won.toLocaleString()} <:blackToken:1304186797064065065>\n**🔖 Total Balance:** ${playerData.balance.toLocaleString()} <:blackToken:1304186797064065065>`,
        thumbnail: info.user.displayAvatarURL({ dynamic: true }),
        footer: client.user.username
    });

    return { newPlayerData: playerData };
};

async function logEmbedLose(betAmount, playerData, interaction, client) {
    const info = await initInfo(interaction, "LOG_GAMES_CHANNEL_ID", client);
    playerData.balance -= betAmount;
    playerData.save();

    redEmbed(info.logChannel, client, {
        title: `${info.commandName} | Lose 😢`,
        description: `**🧑 User:** ${info.user.username} (**${info.user.id}**)\n**🏠 Server:** ${info.guild.name} (**${info.guild.id}**)\n\n**💰 Bet Amount:** ${betAmount.toLocaleString()} <:blackToken:1304186797064065065>\n**❌ Lose:** ${betAmount.toLocaleString()} <:blackToken:1304186797064065065>\n**🔖 Total Balance:** ${playerData.balance.toLocaleString()} <:blackToken:1304186797064065065>`,
        thumbnail: info.user.displayAvatarURL({ dynamic: true }),
        footer: client.user.username
    });

    return { newPlayerData: playerData };
};

async function logEmbedTie(betAmount, playerData, interaction, client) {
    const info = await initInfo(interaction, "LOG_GAMES_CHANNEL_ID", client);

    yellowEmbed(info.logChannel, client, {
        title: `${info.commandName} | Tie 🤝`,
        description: `**🧑 User:** ${info.user.username} (**${info.user.id}**)\n**🏠 Server:** ${info.guild.name} (**${info.guild.id
            }**)\n\n**💰 Bet Amount:** ${betAmount.toLocaleString()} <:blackToken:1304186797064065065>\n**🔖 Total Balance:** ${playerData.balance.toLocaleString()} <:blackToken:1304186797064065065>`,
        thumbnail: info.user.displayAvatarURL({ dynamic: true }),
        footer: client.user.username
    });
};

async function logEmbedVotes(rewardVote, interaction, client) {
    const info = await initInfo(interaction, "LOG_VOTES_CHANNEL_ID", client);

    blueEmbed(info.logChannel, client, {
        title: `New Vote 🎉`,
        description: `**🧑 User:** ${info.user.username} (**${info.user.id}**)\n**🏠 Server:** ${info.guild.name} (**${info.guild.id}**)\n\n**🎁 Reward:** ${rewardVote}`,
        thumbnail: info.user.displayAvatarURL({ dynamic: true }),
        footer: client.user.username
    });
};

async function logCommand(interaction, client) {
    const info = await initInfo(interaction, "LOG_COMMANDS_CHANNEL_ID", client);

    const options = interaction.options.data.map(option => `${option.name}: ${option.value}`).join(" ");

    blueEmbed(info.logChannel, client, {
        title: `${info.commandName} | Command Executed 🔎`,
                description: `**🧑 User:** ${info.user.username} (**${info.user.id}**)\n**🏠 Server:** ${info.guild.name} (**${info.guild.id}**)\n**📢 Channel:** ${info.channel.name} (**${info.channel.id}**)\n\n**📝 Executed Command:**\n\`\`\`/${info.commandName} ${options}\`\`\`\n`,
        thumbnail: info.user.displayAvatarURL({ dynamic: true }),
        footer: client.user.username
    });
};

module.exports = { logEmbedWin, logEmbedLose, logEmbedTie, logEmbedVotes, logCommand };
