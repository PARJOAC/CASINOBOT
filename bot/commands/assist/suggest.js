const { SlashCommandBuilder } = require("discord.js");
const { redEmbed, greenEmbed } = require("../../functions/interactionEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("suggest")
    .setDescription("Send a suggestion to the support channel")
    .addStringOption((option) =>
      option
        .setName("suggestion")
        .setDescription("Your suggestion")
        .setRequired(true)
    ),
  category: "assist",
  commandId: "1298679907693629531",
  async execute(interaction, client, lang) {
    const suggestion = interaction.options.getString("suggestion");
    const supportChannel = process.env.SUGGEST_CHANNEL_ID;

    if (!supportChannel)
      return redEmbed(interaction, client, {
        type: "editReply",
        title: lang.errorTitle,
        description: lang.suggestErrorChannel,
        footer: client.user.username,
        ephemeral: false
      });

    greenEmbed(supportChannel, client, {
      title: lang.suggestTitle,
      description: `**${interaction.user.tag}** (**${interaction.user.id}**) ${lang.suggestContent}\n\n${suggestion}`,
      footer: client.user.username,
      ephemeral: false
    });

    return greenEmbed(interaction, client, {
      type: "editReply",
      title: lang.succesfulTitle,
      description: lang.suggestSuccess,
      ephemeral: false
    });

  },
};
