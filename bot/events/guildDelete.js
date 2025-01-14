const { Events } = require("discord.js");
const { redEmbed } = require("../functions/interactionEmbed");

module.exports = {
  name: Events.GuildDelete,
  async execute(guild, client) {
    if (!guild) return;
    const guildChannel = process.env.LOG_CHANNEL_GUILD_DELETE;

    if (guildChannel) {
      return redEmbed(guildChannel, client, {
        title: "Bot Removed from a Server",
        description: `The bot has been removed from the server: ${guild.name}`,
        thumbnail: guild.iconURL({ dynamic: true }),
        fields: [
          { name: "Server Name", value: guild.name, inline: true },
          { name: "Server ID", value: guild.id, inline: true },
          { name: "Member Count (at time of leave)", value: `${guild.memberCount || "Unknown"}`, inline: true },
          { name: "Created On", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
          { name: "Total Servers", value: `The bot is now in ${client.guilds.cache.size} server(s).`, inline: true },
        ],
        footer: client.user.username
      });
    } else {
      console.error("Channel not found or bot lacks access to the channel.");
    }
  },
};
