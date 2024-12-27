const actualCommand = new Set();

async function getSetUser(userId) {
  if (actualCommand.has(userId)) return true;
  return false;
}

async function getSet(interaction, lang) {
  if (actualCommand.has(interaction.user.id)) {
    await interaction.followUp({
      content: lang.alreadyExecutingCommand,
      ephemeral: true,
    });
    return true;
  }
  return false;
}

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