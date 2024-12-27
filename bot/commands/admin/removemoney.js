const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Player = require("../../../mongoDB/Player");
const Guild = require("../../../mongoDB/Guild");
const { interactionEmbed } = require("../../functions/interactionEmbed");
const { getSetUser } = require("../../functions/getSet");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removemoney")
    .setDescription("Remove money from a user's balance (creator bot only)")
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
    const guildData = await Guild.findOne({ guildId: interaction.guild.id });

    if (!guildData.economyType && interaction.user.id !== "714376484139040809") {
      return interaction.editReply({
        embeds: [
          await interactionEmbed({
            title: lang.errorTitle,
            description: lang.onlyCreatorBotGlobal,
            color: 0xfe4949,
            footer: "CasinoBot",
            client,
          }),
        ],
        ephemeral: true,
      });
    }

    const targetUser = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    const isPlaying = await getSetUser(targetUser.id);

    if (isPlaying) {
      return interaction.editReply({
        embeds: [
          await interactionEmbed({
            title: lang.errorTitle,
            description: lang.userCurrentlyPlaying,
            color: 0xfe4949,
            footer: "CasinoBot",
            client,
          }),
        ],
        ephemeral: true,
      });
    }

    if (amount <= 0) {
      return interaction.editReply({
        embeds: [
          await interactionEmbed({
            title: lang.errorTitle,
            description: lang.negativeAmount,
            color: 0xfe6059,
            footer: "CasinoBot",
            client,
          }),
        ],
        ephemeral: true,
      });
    }

    let playerData = await getDataUser(user.id, interaction.guild.id);

    if (!playerData) {
      return interaction.editReply({
        embeds: [
          await interactionEmbed({
            title: lang.errorTitle,
            description: lang.userNotFoundOnDataBase.replace(
              "{user}",
              targetUser.id
            ),
            color: 0xff0000,
            footer: "Casinobot",
            client,
          }),
        ],
        ephemeral: true,
      });
    }

    if (playerData.balance < amount) {
      return interaction.editReply({
        embeds: [
          await interactionEmbed({
            title: lang.errorTitle,
            description: lang.userNotHaveMoney,
            color: 0xff0000,
            footer: "Casinobot",
            client,
          }),
        ],
        ephemeral: true,
      });
    }

    playerData.balance -= amount;
    await playerData.save();

    return interaction.editReply({
      embeds: [
        await interactionEmbed({
          title: lang.succesfulTitle,
          description: lang.succesfulRemoveMoney
            .replace("{amount}", amount.toLocaleString())
            .replace("{user}", targetUser.username),
          color: 0x00ff00,
          footer: "Casinobot",
          client,
        }),
      ],
    });
  },
};
