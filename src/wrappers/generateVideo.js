const properties = require("../constants/properties");
const { searchVideo } = require("../pexel");
const { downloadMedia } = require("../utility/media");
const { addTextToVideo } = require("../video/addTextToVideo");
const { mediaCut, getLastSecondsGap } = require("../video/media-utility");

module.exports = {
  generateVideo: (generateVideo = async (db_quote) => {
    const video = await searchVideo({ query: db_quote.image.keyword });
    const rand = Math.floor(Math.random() * video.length);

    const videoPath = await downloadMedia({
      mediaUrl: video[rand].video_files.find((video) => video.width === 1080)
        .link,
      outputPath: `${properties.DIR_VIDEO_TEMP}/downloaded_video`,
    });
    // const videoPath = `${properties.DIR_VIDEO_TEMP}/downloaded_video.mp4`;

    const lastSeconds = await getLastSecondsGap({
      mediaInput: videoPath,
      secondsToCut: 5.5,
    });

    const video_trimmed = await mediaCut({
      mediaInput: videoPath,
      mediaOutput: `${properties.DIR_VIDEO_TEMP}/output_trimmed.mp4`,
      startTime: lastSeconds.init,
      duration: lastSeconds.duration,
    });

    const videoOutput = `${properties.DIR_VIDEO_TEMP}/output.mp4`;

    const audioInput = `${properties.DIR_VIDEO_TEMP}/audio.mp3`;
    const audioOutput = `${properties.DIR_VIDEO_TEMP}/audio_trimmed.mp3`;

    await addTextToVideo({
      quote: db_quote,
      videoInput: video_trimmed,
      videoOutput,
      audioInput,
      audioOutput,
    });
  }),
};

(async () => {
  await generateVideo({
    phrase:
      "You have power over your mind - not outside events. Realize this, and you will find strength.",
    image: { keyword: "rose" },
    author: { name: "Marcus Aurelius" },
  });
})();
