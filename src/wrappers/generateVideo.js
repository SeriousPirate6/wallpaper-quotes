const fs = require("fs");
const properties = require("../constants/properties");
const { downloadMedia } = require("../utility/media");
const { addTextToVideo } = require("../video/addTextToVideo");
const { mediaCut, getMiddleSecondsGap } = require("../video/media-utility");
const { downloadAudio } = require("../freesound/sounds");

module.exports = {
  generateVideo: (generateVideo = async ({ db_quote }) => {
    if (!fs.existsSync(properties.DIR_VIDEO_TEMP)) {
      console.log(`Creating folder: '${properties.DIR_VIDEO_TEMP}'`);
      fs.mkdirSync(properties.DIR_VIDEO_TEMP);
    }

    const videoPath = await downloadMedia({
      mediaUrl: db_quote.video.url,
      outputPath: `${properties.DIR_VIDEO_TEMP}/downloaded_video`,
    });

    const midSeconds = await getMiddleSecondsGap({
      mediaInput: videoPath,
      secondsToCut: 8,
    });

    const video_trimmed = await mediaCut({
      mediaInput: videoPath,
      mediaOutput: `${properties.DIR_VIDEO_TEMP}/output_trimmed.mp4`,
      startTime: midSeconds.init,
      duration: midSeconds.duration,
      threadCount: 1,
    });

    const videoOutput = `${properties.DIR_VIDEO_TEMP}/output.mp4`;

    const audioInput = await downloadAudio({
      query: "calming sounds",
      pathNoName: properties.DIR_VIDEO_TEMP,
    });
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
