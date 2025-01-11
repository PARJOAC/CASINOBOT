const { SlashCommandBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder, } = require("discord.js");
const { getDataUser } = require("../../functions/getDataUser");
const { getDate } = require("../../functions/getDate");
const { calculateProfile } = require("../../functions/winExperience");
const { blueEmbed } = require("../../functions/interactionEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Check a user's profile, including balance and stats")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user whose profile you want to check")
    ),
  category: "users",
  commandId: "1296240894306943041",
  async execute(interaction, client, lang) {
    let userToCheck = interaction.options.getUser("user") || interaction.user;
    let playerData = await getDataUser(userToCheck.id, interaction.guild.id);
    let progressBar = await calculateProfile(playerData);

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("basicInfo")
          .setLabel(lang.basicInfoButton)
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("items")
          .setLabel(lang.itemsButton)
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("lastPlays")
          .setLabel(lang.lastPlaysButton)
          .setStyle(ButtonStyle.Primary)
      );

    await blueEmbed(interaction, client, {
      type: "editReply",
      title: lang.initProfile,
      footer: client.user.username,
      ephemeral: false,
      components: [row]
    });

    const filter = (i) => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 30000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "basicInfo") {
        await blueEmbed(i, client, {
          type: "update",
          title: lang.profileTitle.replace("{user}", userToCheck.username),
          thumbnail: userToCheck.displayAvatarURL(),
          fields: [
            { name: lang.balanceField, value: `${playerData.balance.toLocaleString()} 💰`, inline: true },
            { name: lang.votesText, value: `\`\`x${playerData.votes}\`\``, inline: true },
            { name: lang.levelField, value: `${playerData.level.toLocaleString()}`, inline: true },
            { name: lang.experienceField, value: `${playerData.experience.toLocaleString()} / ${progressBar.xpNeededNew.toLocaleString()} XP`, inline: true },
            { name: lang.progressLevel, value: progressBar.progressBar, inline: false }
          ],
          footer: client.user.username,
          ephemeral: false,
          components: [row]
        });
      } else if (i.customId === "items") {
        await blueEmbed(i, client, {
          type: "update",
          title: lang.profileTitle.replace("{user}", userToCheck.username),
          thumbnail: userToCheck.displayAvatarURL(),
          fields: [
            { name: lang.balloon, value: `${playerData.swag.balloons.toLocaleString()} 🎈`, inline: true },
            { name: lang.mobile, value: `${playerData.swag.mobile.toLocaleString()} 📱`, inline: true },
            { name: lang.bike, value: `${playerData.swag.bike.toLocaleString()} 🚲`, inline: true }
          ],
          footer: client.user.username,
          ephemeral: false,
          components: [row]
        });
      } else if (i.customId === "lastPlays") {
        await blueEmbed(i, client, {
          type: "update",
          title: lang.profileTitle.replace("{user}", userToCheck.username),
          thumbnail: userToCheck.displayAvatarURL(),
          fields: [
            { name: lang.lastBlackJack, value: `${getDate(playerData.lastBlackJack, lang)}`, inline: true },
            { name: lang.lastCoinFlip, value: `${getDate(playerData.lastCoinFlip, lang)}`, inline: true },
            { name: lang.lastCrash, value: `${getDate(playerData.lastCrash, lang)}`, inline: true },
            { name: lang.lastMinesweeper, value: `${getDate(playerData.lastMinesweeper, lang)}`, inline: true },
            { name: lang.lastRace, value: `${getDate(playerData.lastRace, lang)}`, inline: true },
            { name: lang.lastRoulette, value: `${getDate(playerData.lastRoulette, lang)}`, inline: true },
            { name: lang.lastRps, value: `${getDate(playerData.lastRps, lang)}`, inline: true },
            { name: lang.lastRussianRoulette, value: `${getDate(playerData.lastRussianRoulette, lang)}`, inline: true },
            { name: lang.lastSlots, value: `${getDate(playerData.lastSlot, lang)}`, inline: true }
          ],
          footer: client.user.username,
          ephemeral: false,
          components: [row]
        });
      };
    });

    collector.on("end", async (collected, reason) => {
      if (reason === "time") return interaction.editReply({ components: [] });
    });

  },
};
