const { Events } = require("discord.js");
const { interactionEmbed } = require("../functions/interactionEmbed");

module.exports = {
  name: Events.GuildCreate,
  async execute(guild, client) {
    if (!guild) return;
    const guildChannel = client.channels.cache.get(process.env.LOG_CHANNEL_GUILD_ADD);

    if (guildChannel) {
      return guildChannel.send({
        embeds: [
          await interactionEmbed({
            title: "New Server Added!",
            description: `The bot has been added to the server: ${guild.name}`,
            thumbnail: guild.iconURL({ dynamic: true }),
            fields: [
              { name: "Server Name", value: guild.name, inline: true },
              { name: "Server ID", value: guild.id, inline: true },
              { name: "Owner ID", value: (await guild.fetchOwner()).user.id, inline: true },
              { name: "Member Count", value: `${guild.memberCount}`, inline: true },
              { name: "Created On", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
              { name: "Verification Level", value: guild.verificationLevel.toString(), inline: true },
              { name: "Total Servers", value: `The bot is now in ${client.guilds.cache.size} server(s).`, inline: true }
            ],
            footer: "CasinoBot",
            color: 0x00ae85,
            client,
          })
        ]
      });
    } else {
      console.log("Channel not found or bot lacks access to the channel.");
    }
  },
};
