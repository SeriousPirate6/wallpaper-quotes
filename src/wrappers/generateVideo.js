const { searchVideo } = require("../pexel");
const properties = require("../constants/properties");
const { downloadMedia } = require("../utility/media");
const { addTextToVideo } = require("../video/addTextToVideo");
const { mediaCut, getLastSecondsGap } = require("../video/media-utility");

module.exports = {
  generateVideo: (generateVideo = async ({ db_quote }) => {
    const videoPath = await downloadMedia({
      mediaUrl: db_quote.video.url,
      outputPath: `${properties.DIR_VIDEO_TEMP}/downloaded_video`,
    });

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

    const audioInput = `${properties.DIR_VIDEO_TEMP}/audio.wav`;
    const audioOutput = `${properties.DIR_VIDEO_TEMP}/audio_trimmed.wav`;

    const videoEdited = await addTextToVideo({
      quote: db_quote,
      videoInput: video_trimmed,
      videoOutput,
      audioInput,
      audioOutput,
    });

    console.log(videoEdited);
    return videoEdited;
  }),
};
