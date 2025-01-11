const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { logEmbedLose, logEmbedWin } = require("../../functions/logEmbeds");
const { blueEmbed, redEmbed, greenEmbed } = require("../../functions/interactionEmbed");
const { delSet } = require("../../functions/getSet");
const { initGame } = require("../../functions/initGame");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("russianroulette")
        .setDescription("Play Russian Roulette with a bet and try your luck!")
        .addStringOption(option =>
            option
                .setName("bet")
                .setDescription("Amount of money to bet (type 'a' to bet all)")
                .setRequired(true)
        ),
    category: "games",
    commandId: "1302792209992777821",
    async execute(interaction, client, lang, playerData) {
        let betAmount = interaction.options.getString("bet");

        let initGames = await initGame(betAmount, interaction, client, lang, playerData);
        if (initGames.state) return;
        betAmount = initGames.betAmount;

        let rounds = 0, multiplier = 0, gameOver = false, winAmount;
        const isDead = () => Math.random() < 1 / (6 - rounds);

        const fecha = new Date();
        playerData.lastRussianRoulette = fecha;

        const generateButtons = () => new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("shoot").setLabel(lang.shootButton).setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId("cashout").setLabel(lang.cashOutButton).setStyle(ButtonStyle.Success)
        );

        const message = await blueEmbed(interaction, client, {
            type: "editReply",
            title: lang.initRussianRouletteTitle,
            description: lang.initRussianRouletteDescription,
            fields: [
                { name: lang.betField, value: `${betAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
                { name: lang.multiplierField, value: `x${multiplier.toFixed(2)}`, inline: false },
            ],
            footer: client.user.username,
            ephemeral: false,
            components: [generateButtons()],
            fetchReply: true,
        });

        const collector = message.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id && !gameOver,
            time: 30000,
        });

        collector.on("collect", async i => {
            if (i.customId === "shoot") {
                rounds++;
                multiplier += 0.15;

                if (isDead()) {
                    gameOver = true;
                    const newData = await logEmbedLose(betAmount, playerData, interaction, client);

                    return redEmbed(i, client, {
                        type: "update",
                        title: lang.youLose,
                        fields: [
                            { name: lang.roundsSurvived, value: `${rounds}/6`, inline: false },
                            { name: lang.betField, value: `${betAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
                            { name: lang.loseField, value: `${betAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
                            { name: lang.balanceField, value: `${newData.newPlayerData.balance.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
                        ],
                        footer: client.user.username,
                        ephemeral: false,
                        components: []
                    });
                };

                winAmount = Math.trunc(betAmount * multiplier * (playerData.votes || 1));
                await greenEmbed(i, client, {
                    type: "update",
                    title: lang.safeTitle,
                    fields: [
                        { name: lang.roundsSurvived, value: `${rounds}/6`, inline: false },
                        { name: lang.betField, value: `${betAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
                        { name: lang.winField, value: `${winAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
                        { name: lang.multiplierField, value: `x${multiplier.toLocaleString()} + x${playerData.votes || 1}`, inline: false },
                        { name: lang.balanceField, value: `${playerData.balance.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
                    ],
                    footer: client.user.username,
                    ephemeral: false,
                    components: [generateButtons()]
                });
            } else if (i.customId === "cashout") {
                if (multiplier == 0.00) {
                    await i.deferUpdate();
                    return redEmbed(interaction, client, {
                        type: "followUp",
                        title: lang.errorTitle,
                        description: lang.cashoutFail,
                        footer: client.user.username,
                        ephemeral: true
                    });
                };
                gameOver = true;
                const newData = await logEmbedWin(betAmount, playerData, winAmount, interaction, client, lang);

                greenEmbed(i, client, {
                    type: "update",
                    title: lang.cashOutsuccesful,
                    fields: [
                        { name: lang.roundsSurvived, value: `${rounds}/6`, inline: false },
                        { name: lang.betField, value: `${betAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
                        { name: lang.winField, value: `${winAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
                        { name: lang.multiplierField, value: `x${multiplier.toLocaleString()} + x${newData.newPlayerData.votes || 1}`, inline: false },
                        { name: lang.balanceField, value: `${newData.newPlayerData.balance.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false }
                    ],
                    footer: client.user.username,
                    ephemeral: false,
                    components: []
                });
                
                collector.stop();
            };
        });

        collector.on("end", async (collected, reason) => {
            delSet(interaction.user.id);
            if (reason === "time") {
                interaction.editReply({ components: [] });
                return redEmbed(interaction, client, {
                    type: "followUp",
                    title: lang.timeException,
                    description: lang.timeExceptionDescription,
                    footer: client.user.username,
                    ephemeral: true,
                });
            };
        });

    },
};
