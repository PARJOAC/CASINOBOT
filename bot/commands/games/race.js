const { SlashCommandBuilder } = require("discord.js");
const { logEmbedLose, logEmbedWin } = require("../../functions/logEmbeds");
const { blueEmbed, greenEmbed, redEmbed } = require("../../functions/interactionEmbed");
const { initGame } = require("../../functions/initGame");

const horses = [
  { emoji: "🐎" },
  { emoji: "🎠" },
  { emoji: "🦓" },
  { emoji: "🐱‍🏍" },
  { emoji: "🐲" },
  { emoji: "🦅" },
  { emoji: "🐷" },
  { emoji: "🦖" },
  { emoji: "🐕" },
  { emoji: "🏇" },
  { emoji: "🐈" },
  { emoji: "🦏" },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("race")
    .setDescription("Bet on a horse to win big!")
    .addStringOption((option) =>
      option
        .setName("horse")
        .setDescription("Choose a horse to bet on")
        .setRequired(true)
        .addChoices(
          ...horses.map((_, index) => ({
            name: `${String(index + 1).padStart(2, "0")}`,
            value: index.toString(),
          }))
        )
    )
    .addStringOption((option) =>
      option
        .setName("bet")
        .setDescription("Amount of money to bet (type 'a' to bet all)")
        .setRequired(true)
    ),
  category: "game",
  commandId: "1296240894214934534",
  async execute(interaction, client, lang, playerData) {
    let betAmount = interaction.options.getString("bet");

    let initGames = await initGame(betAmount, interaction, client, lang, playerData);
    if (initGames.state) return;
    betAmount = initGames.betAmount;

    const chosenHorseIndex = parseInt(interaction.options.getString("horse"));
    
    const fecha = new Date();
    playerData.lastRace = fecha;

    await blueEmbed(interaction, client, {
      type: "editReply",
      title: lang.horseStartingTitle,
      description: lang.horseStartingContent,
      footer: client.user.username,
      ephemeral: false,
      fetchReply: true
    });

    setTimeout(async () => {
      const winningHorseIndex = Math.floor(Math.random() * horses.length);
      const isWin = winningHorseIndex === chosenHorseIndex;

      const raceResult = horses
        .map((_, index) => {
          const horseNumber = String(index + 1).padStart(2, "0");
          if (index === winningHorseIndex) {
            return `🏅 ${horseNumber} 🦖`;
          } else {
            const randomDashesCount = Math.floor(Math.random() * 4) + 1;
            const dashes = "- ".repeat(randomDashesCount).trim();
            return `🏁 ${horseNumber} ${dashes} 🦖`;
          }
        })
        .join("\n");

      if (isWin) {
        let winAmount = Math.trunc(betAmount * 8 * (playerData.votes || 1));
        const newData = await logEmbedWin(betAmount, playerData, winAmount, interaction, client);

        return greenEmbed(interaction, client, {
          type: "editReply",
          title: lang.winTitle,
          fields: [
            { name: lang.yourRace, value: `${String(chosenHorseIndex + 1).padStart(2, "0")}`, inline: false },
            { name: lang.raceResult, value: raceResult, inline: false },
            {
              name: lang.raceResultContent
                .replace("{number}", String(winningHorseIndex + 1).padStart(2, "0")), value: "\u200B", inline: false
            },
            { name: lang.betField, value: `${betAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
            { name: lang.winField, value: `${winAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
            { name: lang.multiplierField, value: `x${newData.newPlayerData.votes || 1}`, inline: false },
            { name: lang.balanceField, value: `${newData.newPlayerData.balance.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false }
          ],
          footer: client.user.username,
          ephemeral: false
        });

      } else {
        const newData = await logEmbedLose(betAmount, playerData, interaction, client);

        return redEmbed(interaction, client, {
          type: "editReply",
          title: lang.youLose,
          fields: [
            { name: lang.yourRace, value: `${String(chosenHorseIndex + 1).padStart(2, "0")}`, inline: false },
            { name: lang.raceResult, value: raceResult, inline: false },
            { name: lang.raceResultContent.replace("{number}", String(winningHorseIndex + 1).padStart(2, "0")), value: "\u200B", inline: false },
            { name: lang.betField, value: `${betAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
            { name: lang.loseField, value: `${betAmount.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
            { name: lang.balanceField, value: `${newData.newPlayerData.balance.toLocaleString()} <:blackToken:1304186797064065065>`, inline: false },
          ],
          footer: client.user.username,
          ephemeral: false
        });
      }
    }, 500);
  },
};
