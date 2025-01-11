const { Events, ActivityType } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require("@discordjs/voice");
const path = require("path");

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Session started as ${client.user.tag}!`);

    client.user.setActivity(`Type /help for commands 🎉`, { type: ActivityType.Custom });

    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    const connection = joinVoiceChannel({
      channelId: process.env.VOICE_CHANNEL_MUSIC,
      guildId: process.env.GUILD_ID,
      adapterCreator: guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    const audioPath = path.join(__dirname, "..", "..", "initMain", "music", "casinoMusic.mp3");

    const createNewResource = () => createAudioResource(audioPath);

    const playAudio = () => {
      if (player.state.status !== AudioPlayerStatus.Playing) {
        const resource = createNewResource();
        player.play(resource);
      }
    };

    player.on(AudioPlayerStatus.Idle, () => {
      playAudio();
    });

    player.on("error", error => {
      console.error(`Error in audio player: ${error.message}`);
    });

    connection.subscribe(player);

    playAudio();

  }
};
