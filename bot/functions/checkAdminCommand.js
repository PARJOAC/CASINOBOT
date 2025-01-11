const { redEmbed } = require("./interactionEmbed");
const Guild = require("./../../mongoDB/Guild");

async function userCanUseCommand(interaction, lang, client) {
  const guildData = await Guild.findOne({ guildId: interaction.guild.id });

  if (!guildData.economyType && interaction.user.id !== process.env.OWNER_ID) {
    await redEmbed(interaction, client, {
      type: "editReply",
      title: lang.errorTitle,
      description: lang.onlyCreatorBotGlobal,
      footer: client.user.username,
      ephemeral: false
    });
    return { status: true };
  };
  
  return { status: false, guildData };
};

module.exports = { userCanUseCommand };