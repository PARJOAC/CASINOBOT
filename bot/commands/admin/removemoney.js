const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { getDataUser } = require("../../functions/getDataUser");
const { redEmbed, greenEmbed } = require("../../functions/interactionEmbed");
const { getSetUser } = require("../../functions/getSet");
const { userCanUseCommand } = require("../../functions/checkAdminCommand");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removemoney")
    .setDescription("Remove money from a user's balance")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user from whom to remove money")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of money to remove")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: "admin",
  admin: false,
  commandId: "1296240894214934530",
  async execute(interaction, client, lang) {
    const check = await userCanUseCommand(interaction, lang, client);
    if (check.status) return;

    const targetUser = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    const isPlaying = await getSetUser(targetUser.id);

    if (isPlaying)
      return redEmbed(interaction, client, {
        type: "editReply",
        title: lang.errorTitle,
        description: lang.userCurrentlyPlaying,
        footer: client.user.username,
        ephemeral: false
      });

    if (amount <= 0)
      return redEmbed(interaction, client, {
        type: "editReply",
        title: lang.errorTitle,
        description: lang.negativeAmount,
        footer: client.user.username,
        ephemeral: false
      });

    let playerData = await getDataUser(targetUser.id, interaction.guild.id);

    if (!playerData)
      return redEmbed(interaction, client, {
        type: "editReply",
        title: lang.errorTitle,
        description: lang.userNotFoundOnDataBase
          .replace("{user}", targetUser.id),
        footer: client.user.username,
        ephemeral: false
      });

    if (playerData.balance < amount)
      return redEmbed(interaction, client, {
        type: "editReply",
        title: lang.errorTitle,
        description: lang.userNotHaveMoney,
        footer: client.user.username,
        ephemeral: false
      });

    playerData.balance -= amount;
    await playerData.save();

    await greenEmbed(interaction, client, {
      type: "editReply",
      title: lang.successTitle,
      description: lang.succesfulRemoveMoney
        .replace("{amount}", amount.toLocaleString())
        .replace("{user}", targetUser.username),
      footer: client.user.username,
      ephemeral: false
    });

    try {
      const reason = interaction.options.getString("reason") || lang.noReason;
      await greenEmbed(interaction, client, {
        type: "userSend",
        title: lang.userRemoveMoneyNotifyTitle,
        description: lang.userRemoveMoneyNotifyContent.replace("{user}", interaction.user.username).replace("{amount}", amount.toLocaleString()),
        fields: [
          { name: lang.reason, value: reason, inline: false }
        ],
        footer: client.user.username
      });
    } catch {
      return redEmbed(interaction, client, {
        type: "followUp",
        title: lang.errorTitle,
        description: lang.dmDisabled,
        footer: client.user.username,
        ephemeral: true
      });
    };

  },
};
