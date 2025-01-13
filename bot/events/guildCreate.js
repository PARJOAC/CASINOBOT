const { Events } = require("discord.js");
const { blueEmbed } = require("../functions/interactionEmbed");

module.exports = {
  name: Events.GuildCreate,
  async execute(guild, client) {
    if (!guild) return;
    const guildChannel = process.env.LOG_CHANNEL_GUILD_ADD

    if (guildChannel) {
      return blueEmbed(guildChannel, client, {
        title: "New Server Added!",
        description: `The bot has been added to the server: ${guild.name}`,
        thumbnail: guild.iconURL({ dynamic: true }),
        fields: [
          { name: "Server Name", value: guild.name, inline: true },
          { name: "Server ID", value: guild.id, inline: true },
          { name: "Owner ID", value: guild.ownerId || "Unknown", inline: true },
          { name: "Member Count", value: `${guild.memberCount}`, inline: true },
          { name: "Created On", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
          { name: "Verification Level", value: guild.verificationLevel.toString(), inline: true },
          { name: "Total Servers", value: `The bot is now in ${client.guilds.cache.size} server(s).`, inline: true }
        ],
        footer: client.user.username
      });
    } else {
      console.log("Channel not found or bot lacks access to the channel.");
    }
  },
};
