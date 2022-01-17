const { yt_validate: ytValidate, video_info: videoInfo, search, stream, playlist_info: playlistInfo } = require("play-dl");
const { joinVoiceChannel, createAudioResource, createAudioPlayer, AudioPlayerStatus } = require("@discordjs/voice");


const role = "dj";

// Global queue. Every server will have a key and value pair in this map. { guild.id, queueConstructor{} }
const globalServersQueues = new Map();


async function play(message, args) {
  let song = {};

  // If the first argument is a link. Set the song object to have two keys. Title and URl.
  if (isValidHttpUrl(args[0])) {
    console.log("vaild http url");
    const linkType = ytValidate(args[0]);
    if (linkType === "video") {
      const songInfo = await videoInfo(args[0]);
      song = { title: songInfo.video_details.title, url: songInfo.video_details.url };
    } else if (linkType === "playlist") {
      const playlist = await playlistInfo(args[0]);
      message.channel.send(`Found a playlist with ${playlist.videos.length}`);
      message.channel.send("The link provided is for a playlist, which is not supported currently!");
      return;
    }

  } else {
    console.log("not vaild http url");
    const video = await queryVideo(args.join(" "));
    if (video) {
      song = { title: video.title, url: video.url };
    } else {
      message.channel.send("Error finding video.");
      return;
    }
  }

  let serverQueue = globalServersQueues.get(message.guild.id);
  // If the server queue does not exist (which doesn't for the first video queued)
  // then create a constructor to be added to our global queue.
  if (!serverQueue) {
    const voiceChannel = message.member.voice.channel;
    serverQueue = createServerQueue(message.guild.id, voiceChannel, message.channel);
    serverQueue.songs.push(song);

    // Establish a connection and play the song with the videoPlayer function.
    try {
      const voiceConnection = createVoiceConnection(
        voiceChannel.id,
        voiceChannel.guild.id,
        voiceChannel.guild.voiceAdapterCreator);

      serverQueue.voiceConnection = voiceConnection;
      const player = createAudioPlayer();
      serverQueue.audioPlayer = player;
      serverQueue.voiceConnection.subscribe(player);

      player.on("stateChange", (oldState, newState) => {
        console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
        if (oldState.status === AudioPlayerStatus.Playing && newState.status === AudioPlayerStatus.Idle) {
          serverQueue.songs.shift();
          playSong(message.guild.id, serverQueue.songs[0]);
        }
      });
      playSong(message.guild.id, serverQueue.songs[0]);
    } catch (err) {
      globalServersQueues.delete(message.guild.id);
      await message.channel.send("There was an error connecting!");
      throw err;
    }
  } else {
    serverQueue.songs.push(song);
    return await message.channel.send(`👍 **${song.title}** added to queue!`);
  }
}

async function playSong(guildId, song) {
  // If no song is left in the server queue.
  // Leave the voice channel and delete the key and value pair from the global queue.
  if (!song) {
    stopConnection(guildId);
    return;
  }
  const serverQueue = globalServersQueues.get(guildId);
  const source = await stream(song.url);
  const audioResource = createAudioResource(source.stream, {
    inputType: source.type,
  });

  serverQueue.audioPlayer.play(audioResource);
  await serverQueue.textChannel.send(`🎶 Now playing **${song.title}**`);
}

function stopConnection(guildId) {
  const serverQueue = globalServersQueues.get(guildId);
  if (!serverQueue) return;
  serverQueue.voiceConnection.destroy();
  serverQueue.audioPlayer.stop();
  globalServersQueues.delete(guildId);
  console.log(`voice connection stopped for guild id:${guildId}`);
}

function createServerQueue(guildId, voiceChannel, textChannel, voiceConnection = null, audioPlayer = null, songs = []) {
  const serverQueueConstructor = {
    voiceChannel: voiceChannel,
    textChannel: textChannel,
    voiceConnection: voiceConnection,
    audioPlayer: audioPlayer,
    songs: songs,
  };
  globalServersQueues.set(guildId, serverQueueConstructor);
  console.log(`created new Server Queue for guild id: ${guildId}`);
  return serverQueueConstructor;
}

function createVoiceConnection(voiceChannelId, guildId, voiceAdapterCreator) {
  return joinVoiceChannel({
    channelId: voiceChannelId,
    guildId: guildId,
    adapterCreator: voiceAdapterCreator,
  });
}

async function queryVideo(query, limit = 1) {
  console.log(`video search query for ${query} with limit: ${limit}`);
  const searchResult = await search(query, { limit: limit });
  if (limit === 1) {
    const infoData = await videoInfo(searchResult[0].url);
    return infoData.video_details;
  } else {
    // TODO
  }
}

function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

module.exports = {
  role,
  play,
  stopConnection,
};