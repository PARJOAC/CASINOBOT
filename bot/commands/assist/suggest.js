// Import required modules from discord.js and custom functions
const { SlashCommandBuilder } = require("discord.js");
const { redEmbed, greenEmbed } = require("../../functions/interactionEmbed");

module.exports = {
  // Define the slash command using SlashCommandBuilder
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

  // Execute function for the slash command
  async execute(interaction, client, lang) {
    // Get the suggestion from the command options
    const suggestion = interaction.options.getString("suggestion");
    // Get the support channel ID from environment variables
    const supportChannel = process.env.SUGGEST_CHANNEL_ID;

    // Check if the support channel is configured
    if (!supportChannel)
      return redEmbed(interaction, client, {
        type: "editReply",
        title: lang.errorTitle,
        description: lang.suggestErrorChannel,
        footer: client.user.username,
        ephemeral: false
      });

    // Send the suggestion to the support channel
    greenEmbed(supportChannel, client, {
      title: lang.suggestTitle,
      description: `**${interaction.user.tag}** (**${interaction.user.id}**) ${lang.suggestContent}\n\n${suggestion}`,
      footer: client.user.username,
      ephemeral: false
    });

    // Send a success message to the user
    return greenEmbed(interaction, client, {
      type: "editReply",
      title: lang.succesfulTitle,
      description: lang.suggestSuccess,
      ephemeral: false
    });
  },
};
