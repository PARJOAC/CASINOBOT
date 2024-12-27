const { SlashCommandBuilder } = require("discord.js");
const { interactionEmbed } = require("../../functions/interactionEmbed");
const { addSet, delSet, getSet } = require("../../functions/getSet");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sell")
    .setDescription("Sell your balloons and mobiles for coins")
    .addStringOption((option) =>
      option
        .setName("item")
        .setDescription("Choose an item to sell")
        .setRequired(true)
        .addChoices(
          { name: "Balloon", value: "balloon" },
          { name: "Mobile", value: "mobile" }
        )
    )
    .addIntegerOption((option) =>
      option
        .setName("quantity")
        .setDescription("Amount of items to sell")
        .setRequired(true)
    ),
  category: "economy",
  commandId: "1296240894214934532",
  async execute(interaction, client, lang, playerData) {

    const executing = await getSet(interaction, lang, interaction.user.id);
    if (executing) {
      return;
    } else {
      await addSet(interaction.user.id);
    };

    const item = interaction.options.getString("item");
    const quantity = interaction.options.getInteger("quantity");

    if (quantity <= 0) {
      await delSet(interaction.user.id);
      return interaction.editReply({
        embeds: [
          await interactionEmbed({
            title: lang.errorTitle,
            description: lang.negativeItem,
            color: 0xfe6059,
            footer: "CasinoBot",
            client,
          }),
        ],
        ephemeral: true,
      });
    }

    let amountGained = 0;

    if (item === "balloon") {
      if (playerData.swag.balloons >= quantity) {
        playerData.swag.balloons -= quantity;
        amountGained = quantity * 50;
      } else {
        await delSet(interaction.user.id);
        return interaction.editReply({
          embeds: [
            await interactionEmbed({
              title: lang.errorTitle,
              description: lang.errorBalloonSellContent.replace(
                "{balloon}",
                playerData.swag.balloons
              ),
              color: 0xff0000,
              footer: "CasinoBot",
              client,
            }),
          ],
          ephemeral: true,
        });
      }
    } else if (item === "mobile") {
      if (playerData.swag.mobile >= quantity) {
        playerData.swag.mobile -= quantity;
        amountGained = quantity * 200;
      } else {
        await delSet(interaction.user.id);
        return interaction.editReply({
          embeds: [
            await interactionEmbed({
              title: lang.errorTitle,
              description: lang.errorMobileSellContent.replace(
                "{mobile}",
                playerData.swag.mobile
              ),
              color: 0xff0000,
              footer: "CasinoBot",
              client,
            }),
          ],
          ephemeral: true,
        });
      }
    }

    playerData.balance += amountGained;
    await playerData.save();

    await delSet(interaction.user.id);

    return interaction.editReply({
      embeds: [
        await interactionEmbed({
          title: lang.succesfulTitle,
          description: lang.succesfulSellContent
            .replace("{quantity}", quantity)
            .replace(
              "{item}",
              item === "balloon" ? lang.balloon : lang.mobile
            )
            .replace("{amount}", amountGained.toLocaleString()),
          color: 0x00ff00,
          footer: "CasinoBot",
          client,
          fields: [
            {
              name: lang.balanceField,
              value: `${playerData.balance.toLocaleString()} 💰`,
              inline: false,
            },
            {
              name: lang.balloon,
              value: `${playerData.swag.balloons.toLocaleString()} 🎈`,
              inline: false,
            },
            {
              name: lang.mobile,
              value: `${playerData.swag.mobile.toLocaleString()} 📱`,
              inline: false,
            },
          ],
        }),
      ],
    });
  },
};
