const { SlashCommandBuilder } = require("discord.js");
const { logEmbedLose, logEmbedWin } = require("../../functions/logEmbeds");
const { blueEmbed, greenEmbed, redEmbed } = require("../../functions/interactionEmbed");
const { initGame } = require("../../functions/initGame");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("coinflip")
        .setDescription("Play coinflip by betting to win money!")
        .addStringOption((option) =>
            option
                .setName("bet")
                .setDescription("Amount of money to bet (type 'a' to bet all)")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("prediction")
                .setDescription("Choose between head or tail")
                .setRequired(true)
                .addChoices(
                    { name: "Head", value: "head" },
                    { name: "Tail", value: "tail" }
                )
        ),
    category: "game",
    commandId: "1310895925610287135",
    async execute(interaction, client, lang, playerData) {
        let betAmount = interaction.options.getString("bet");

        let initGames = await initGame(betAmount, interaction, client, lang, playerData);
        if (initGames.state) return;
        betAmount = initGames.betAmount;

        let prediction = interaction.options.getString("prediction");

        const fecha = new Date();
        playerData.lastCoinFlip = fecha;

        let coinFlipResult = Math.random() < 0.5 ? "head" : "tail";

        const headEmoji = "<:cara:1310711659316379751>";
        const tailEmoji = "<:cruz:1310711628857217065>";

        const isWin = coinFlipResult == prediction;

        await blueEmbed(interaction, client, {
            type: "editReply",
            title: lang.flipCoin,
            footer: client.user.username,
            ephemeral: false,
            fetchReply: true
        });

        if (isWin) {
            let winAmount = Math.trunc(betAmount * (playerData.votes || 1));
            const newData = await logEmbedWin(betAmount, playerData, winAmount, interaction, client, lang);

            return greenEmbed(interaction, client, {
                type: "editReply",
                title: lang.winTitle,
                fields: [
                    { name: lang.userChoiceField, value: prediction === "head" ? headEmoji : tailEmoji, inline: false },
                    { name: lang.resultSpin, value: prediction === "head" ? headEmoji : tailEmoji, inline: false },
                    { name: lang.betField, value: `${betAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
                    { name: lang.winField, value: `${winAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
                    { name: lang.multiplierField, value: `x${newData.newPlayerData.votes || 1}`, inline: false },
                    { name: lang.balanceField, value: `${newData.newPlayerData.balance.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false }
                ],
                footer: client.user.username,
                ephemeral: false
            });

        } else {
            const newData = await logEmbedLose(betAmount, playerData, interaction, client);

            return redEmbed(interaction, client, {
                type: "editReply",
                title: lang.youLose,
                fields: [
                    { name: lang.userChoiceField, value: prediction === "head" ? headEmoji : tailEmoji, inline: false },
                    { name: lang.resultSpin, value: prediction === "head" ? tailEmoji : headEmoji, inline: false },
                    { name: lang.betField, value: `${betAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
                    { name: lang.loseField, value: `${betAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
                    { name: lang.multiplierField, value: `x${newData.newPlayerData.votes || 1}`, inline: false },
                    { name: lang.balanceField, value: `${newData.newPlayerData.balance.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
                ],
                footer: client.user.username,
                ephemeral: false
            });

        };
    },
};
