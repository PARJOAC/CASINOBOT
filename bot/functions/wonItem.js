const { greenEmbed } = require("./interactionEmbed");

async function wonItem(playerData, interaction, lang, client) {
  let prob = Math.random();

  if (prob <= 0.15) {
    const items = ["balloons", "mobile", "bike"];
    const randomIndex = Math.floor(Math.random() * items.length);
    const itemWon = items[randomIndex];

    playerData.swag[itemWon] += 1;

    const message = {
      balloons: lang.wonBalloon,
      mobile: lang.wonMobile,
      bike: lang.wonBike
    }[itemWon];

    return greenEmbed(interaction, client, {
      type: "followUp",
      description: message,
      footer: client.user.username,
      ephemeral: true
    });
  };
  return;
};

module.exports = { wonItem };
