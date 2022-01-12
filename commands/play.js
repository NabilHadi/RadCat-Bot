const { joinVoiceChannel, createAudioResource, createAudioPlayer, AudioPlayerStatus } = require("@discordjs/voice");
const { yt_validate, video_info, search, stream } = require("play-dl");

// Global queue for your bot. Every server will have a key and value pair in this map. { guild.id, queue_constructor{} }
const queue = new Map();

module.exports = {
  name: "play",
  description: "play youtube videos",
  async execute(message, args) {
    const voice_channel = message.member.voice.channel;
    if (!voice_channel) return message.channel.send("You need to be in a voice channel to use this command");

    // This is our server queue. We are getting this server queue from the global queue.
    if (!args.length) return message.channel.send("You need to send the second argument!");
    let song = {};

    // If the first argument is a link. Set the song object to have two keys. Title and URl.
    if (args[0].startsWith("https") && yt_validate(args[0]) === "video") {
      const song_info = await video_info(args[0]);
      song = { title: song_info.video_details.title, url: song_info.video_details.url };
    }
    else {
      // If there was no link, we use keywords to search for a video. Set the song object to have two keys. Title and URl.
      const video_finder = async (query) => {
        const video_result = await search(query, { limit: 1 });
        return (video_result.videos.length > 1) ? video_result.videos[0] : null;
      };

      const video = await video_finder(args.join(" "));
      if (video) {
        song = { title: video.title, url: video.url };
      }
      else {
        message.channel.send("Error finding video.");
      }
    }

    const server_queue = queue.get(message.guild.id);
    // If the server queue does not exist (which doesn't for the first video queued) then create a constructor to be added to our global queue.
    if (!server_queue) {

      const queue_constructor = {
        voice_channel: voice_channel,
        text_channel: message.channel,
        connection: null,
        audioPlayer: null,
        songs: [],
      };

      // Add our key and value pair into the global queue. We then use this to get our server queue.
      queue.set(message.guild.id, queue_constructor);
      queue_constructor.songs.push(song);

      // Establish a connection and play the song with the vide_player function.
      try {
        const connection = joinVoiceChannel({
          channelId: voice_channel.id,
          guildId: voice_channel.guildId,
          adapterCreator: voice_channel.guild.voiceAdapterCreator,
        });
        const player = createAudioPlayer();
        queue_constructor.audioPlayer = player;
        queue_constructor.connection = connection;
        queue_constructor.connection.subscribe(player);

        player.on("stateChange", (oldState, newState) => {
          console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
        });
        player.on(AudioPlayerStatus.Idle, () => {
          queue_constructor.songs.shift();
          video_player(message.guild, queue_constructor.songs[0]);
        });
        video_player(message.guild, queue_constructor.songs[0]);
      }
      catch (err) {
        queue.delete(message.guild.id);
        message.channel.send("There was an error connecting!");
        throw err;
      }
    }
    else {
      server_queue.songs.push(song);
      return message.channel.send(`👍 **${song.title}** added to queue!`);
    }
  },
};

const video_player = async (guild, song) => {
  const songQueue = queue.get(guild.id);

  // If no song is left in the server queue. Leave the voice channel and delete the key and value pair from the global queue.
  if (!song) {
    songQueue.connection.destroy();
    songQueue.audioPlayer.stop();
    queue.delete(guild.id);
    return;
  }
  const source = await stream(song.url);
  const resource = createAudioResource(source.stream, {
    inputType: source.type,
  });
  const player = songQueue.audioPlayer;
  player.play(resource);
  await songQueue.text_channel.send(`🎶 Now playing **${song.title}**`);
};