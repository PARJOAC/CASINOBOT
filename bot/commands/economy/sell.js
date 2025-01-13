const { SlashCommandBuilder } = require("discord.js");
const { redEmbed, greenEmbed } = require("../../functions/interactionEmbed");
const { addSet, delSet, getSet } = require("../../functions/getSet");

module.exports = {
  // Define the slash command using SlashCommandBuilder
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
          { name: "Mobile", value: "mobile" },
          { name: "Bike", value: "bike" }
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

  // Execute function for the slash command
  async execute(interaction, client, lang, playerData) {

    // Check if the user is already executing a command
    const executing = await getSet(interaction, lang, client);
    if (executing) return;
    // Add user to the set of executing users
    await addSet(interaction.user.id);

    // Get the item and quantity from the command options
    const item = interaction.options.getString("item");
    const quantity = interaction.options.getInteger("quantity");

    // Check if the quantity is positive
    if (quantity <= 0) {
      await delSet(interaction.user.id);
      return redEmbed(interaction, client, {
        type: "editReply",
        title: lang.errorTitle,
        description: lang.negativeItem,
        footer: client.user.username,
        ephemeral: false
      });
    };

    let amountGained = 0;

    // Handle selling based on the item type
    if (item === "balloon") {
      if (playerData.swag.balloons >= quantity) {
        playerData.swag.balloons -= quantity;
        amountGained = quantity * 50;
      } else {
        await delSet(interaction.user.id);
        return redEmbed(interaction, client, {
          type: "editReply",
          title: lang.errorTitle,
          description: lang.errorBalloonSellContent
            .replace("{balloon}", playerData.swag.balloons),
          footer: client.user.username,
          ephemeral: false
        });
      };
    } else if (item === "mobile") {
      if (playerData.swag.mobile >= quantity) {
        playerData.swag.mobile -= quantity;
        amountGained = quantity * 100;
      } else {
        await delSet(interaction.user.id);
        return redEmbed(interaction, client, {
          type: "editReply",
          title: lang.errorTitle,
          description: lang.errorMobileSellContent
            .replace("{mobile}", playerData.swag.mobile),
          footer: client.user.username,
          ephemeral: false
        });
      };
    } else if (item === "bike") {
      if (playerData.swag.bike >= quantity) {
        playerData.swag.bike -= quantity;
        amountGained = quantity * 150;
      } else {
        await delSet(interaction.user.id);
        return redEmbed(interaction, client, {
          type: "editReply",
          title: lang.errorTitle,
          description: lang.errorBikeSellContent
            .replace("{bike}", playerData.swag.bike),
          footer: client.user.username,
          ephemeral: false
        });
      };
    };

    // Update player's balance and save the changes
    playerData.balance += amountGained;
    await playerData.save();

    // Remove user from the set of executing users
    await delSet(interaction.user.id);

    // Send success message with transaction details
    return greenEmbed(interaction, client, {
      type: "editReply",
      title: lang.successTitle,
      description: lang.succesfulSellContent
        .replace("{quantity}", quantity)
        .replace("{item}", item === "balloon" ? lang.balloon : item === "bike" ? lang.bike : lang.mobile)
        .replace("{amount}", amountGained.toLocaleString()),
      fields: [
        { name: lang.balanceField, value: `${playerData.balance.toLocaleString()} 💰`, inline: false },
        { name: lang.balloon, value: `${playerData.swag.balloons.toLocaleString()} 🎈`, inline: false },
        { name: lang.mobile, value: `${playerData.swag.mobile.toLocaleString()} 📱`, inline: false },
        { name: lang.bike, value: `${playerData.swag.bike.toLocaleString()} 🚲`, inline: false },
      ],
      footer: client.user.username,
      ephemeral: false
    });

  },
};
