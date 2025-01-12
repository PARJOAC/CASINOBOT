const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { getDataUser } = require("../../functions/getDataUser");
const { redEmbed, greenEmbed } = require("../../functions/interactionEmbed");
const { getSetUser } = require("../../functions/getSet");
const { userCanUseCommand } = require("../../functions/checkAdminCommand");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addmoney")
    .setDescription("Add money to a user")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("User to whom you want to add money")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("amount")
        .setDescription("Amount of money to add")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("reason")
        .setDescription("Reason for adding money")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: "admin",
  admin: false,
  commandId: "1296240894214934528",
  async execute(interaction, client, lang) {
    const check = await userCanUseCommand(interaction, lang, client);
    if (check.status) return;

    const user = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    const isPlaying = await getSetUser(user.id);

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
        description: lang.negativeMoney,
        footer: client.user.username,
        ephemeral: false
      });

    let playerData = await getDataUser(user.id, interaction.guild.id);

    playerData.balance += amount;
    await playerData.save();

    await greenEmbed(interaction, client, {
      type: "editReply",
      title: lang.succesfulTitle,
      description: lang.succesfulAddMoneyContent
        .replace("{amount}", amount.toLocaleString())
        .replace("{user}", user.username),
      footer: client.user.username,
      ephemeral: false
    });

    try {
      const reason = interaction.options.getString("reason") || lang.noReason;

      const embed = new EmbedBuilder()
        .setColor(parseInt(process.env.GREEN_COLOR))
        .setTitle(lang.userMessageAddMoneyTitle.replace("{user}", interaction.user.username))
        .setDescription(lang.userMessageAddMoneyContent.replace("{amount}", amount.toLocaleString()))
        .addFields(
          { name: lang.serverName, value: interaction.guild.name, inline: false },
          { name: lang.reason, value: reason, inline: false }
        )
        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

      await user.send({ embeds: [embed] });
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
