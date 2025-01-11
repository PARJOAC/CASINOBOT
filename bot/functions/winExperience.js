async function winExperience(playerData, winnings) {
  let experienceGained = 0;

  experienceGained = Math.floor(Math.trunc(winnings) / 250);
  playerData.experience += experienceGained;

  const xpNeeded = playerData.level * process.env.XP_LEVEL;
  while (playerData.experience >= xpNeeded) {
    playerData.level += 1;
    playerData.experience -= xpNeeded;
  };

  return experienceGained;
};

async function calculateProfile(playerData) {
  const xpNeeded = playerData.level * process.env.XP_LEVEL;
  while (playerData.experience >= xpNeeded) {
    playerData.level += 1;
    playerData.experience -= xpNeeded;
  };

  await playerData.save();
  let xpNeededNew = playerData.level * process.env.XP_LEVEL;
  const progressBarLength = 8;
  const filledLength = Math.floor((playerData.experience / xpNeeded) * progressBarLength);
  const percentage = Math.floor((playerData.experience / xpNeededNew) * 100);
  const progressBar =
    "<:greenProgress:1302975449818726472>".repeat(filledLength) +
    "<:redProgress:1302975965399355493>".repeat(
      progressBarLength - filledLength
    ) +
    percentage +
    " %";

  return { progressBar, xpNeededNew };
};

module.exports = { winExperience, calculateProfile };
