const actualCommand = new Set();
const { redEmbed } = require("./interactionEmbed");

async function getSetUser(userId) {
  if (actualCommand.has(userId)) return true;
  return false;
}

async function getSet(interaction, lang, client) {
  if (actualCommand.has(interaction.user.id)) {
    await redEmbed(interaction, client, {
      type: "followUp",
      title: lang.errorTitle,
      description: lang.alreadyExecutingCommand,
      footer: client.user.username,
      ephemeral: true
    });
    return true;
  };
  return false;
};

async function addSet(userId) {
  actualCommand.add(userId);
};

async function delSet(userId) {
  actualCommand.delete(userId);
};

module.exports = {
  addSet,
  delSet,
  getSet,
  getSetUser
}