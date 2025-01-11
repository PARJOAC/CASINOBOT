const { SlashCommandBuilder } = require("discord.js");
const { getDataUser } = require("../../functions/getDataUser");
const { redEmbed, greenEmbed } = require("../../functions/interactionEmbed");
const { addSet, delSet, getSet, getSetUser } = require("../../functions/getSet");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("gift")
        .setDescription("Gift money to another user")
        .addUserOption((option) =>
            option
                .setName("recipient")
                .setDescription("The user to whom you want to gift money")
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option
                .setName("amount")
                .setDescription("The amount of money to gift")
                .setRequired(true)
        ),
    category: "users",
    commandId: "1296240894306943038",
    async execute(interaction, client, lang, playerData) {
        const recipient = interaction.options.getUser("recipient");
        const amount = interaction.options.getInteger("amount");

        const executing = await getSet(interaction, lang, client);
        if (executing) return;
        await addSet(interaction.user.id);

        const isPlaying = await getSetUser(recipient.id);

        if (recipient.id == playerData.userId) {
            await delSet(interaction.user.id);
            return redEmbed(interaction, client, {
                type: "editReply",
                title: lang.errorTitle,
                description: lang.someUser,
                footer: client.user.username,
                ephemeral: false
            });
        };

        if (isPlaying) {
            await delSet(interaction.user.id);
            return redEmbed(interaction, client, {
                type: "editReply",
                title: lang.errorTitle,
                description: lang.userCurrentlyPlaying,
                footer: client.user.username,
                ephemeral: false
            });
        };

        if (amount <= 0) {
            await delSet(interaction.user.id);
            return redEmbed(interaction, client, {
                type: "editReply",
                title: lang.errorTitle,
                description: lang.amountErrorNegativeNumberContent,
                footer: client.user.username,
                ephemeral: false
            });
        };

        let recipientData = await getDataUser(recipient.id, interaction.guild.id);
        if (!recipientData) {
            await delSet(interaction.user.id);
            return redEmbed(interaction, client, {
                type: "editReply",
                title: lang.errorTitle,
                description: lang.userCatchNotHaveAccount,
                footer: client.user.username,
                ephemeral: false
            });
        };

        if (amount > playerData.balance) {
            await delSet(interaction.user.id);
            return redEmbed(interaction, client, {
                type: "editReply",
                title: lang.errorTitle,
                description: lang.giftSenderNotHaveMoneyContent,
                footer: client.user.username,
                ephemeral: false
            });
        };

        playerData.balance -= amount;
        await playerData.save();
        recipientData.balance += amount;
        await recipientData.save();

        await delSet(interaction.user.id);

        await greenEmbed(interaction, client, {
            type: "editReply",
            title: lang.succesfulTitle,
            description: lang.giftSucContent
                .replace("{amount}", amount.toLocaleString())
                .replace("{user}", recipient.username),
            footer: client.user.username,
            ephemeral: false
        });

    },
};
