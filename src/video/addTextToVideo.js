const util = require("util");
const fs = require("fs");
const {
  mediaCut,
  getMiddleSecondsGap,
  getMediaLength,
  videoDimensions,
  videoCrop,
} = require("./media-utility");
const { sharpText, maskAuthorImage } = require("./trySharpImageEdit");
const { getVideoFramesPerSecond } = require("./media-utility");
const { deleteFolderRecursively } = require("../utility/media");
const { generateTSpansFromQuote } = require("./generateTSpansFromQuote");
const properties = require("../constants/properties");
const exec = util.promisify(require("child_process").exec);

const debug = false;

module.exports = {
  addTextToVideo: async ({
    quote,
    videoInput,
    videoOutput,
    audioInput,
    audioOutput,
    targetWidth = 1080,
    targetHeight = 1920,
  }) => {
    try {
      const video_fps = await getVideoFramesPerSecond(videoInput);
      const duration = await getMediaLength(videoInput);

      const audio_timestamps = await getMiddleSecondsGap({
        mediaInput: audioInput,
        secondsToCut: duration,
      });

      const audio_cutted = await mediaCut({
        mediaInput: audioInput,
        mediaOutput: audioOutput,
        startTime: audio_timestamps.init,
        duration: audio_timestamps.duration,
      });

      const video_dimensions = await videoDimensions({ videoInput });
      if (
        video_dimensions.width > targetWidth ||
        video_dimensions.height > targetHeight
      ) {
        videoInput = await videoCrop({ videoInput });
      }

      console.log("Initializing temporary files");
      fs.mkdirSync("temp");
      fs.mkdirSync("temp/raw-frames");
      fs.mkdirSync("temp/edited-frames");

      console.log("Decoding");
      await exec(`ffmpeg -i ${videoInput} temp/raw-frames/%d.png`);

      console.log("Rendering");
      const frames = fs.readdirSync("temp/raw-frames");

      const authorName = quote.author.name;
      const authorImage = authorName.replace(" ", "_") + ".png";

      await maskAuthorImage(
        authorName,
        `${properties.DIR_VIDEO_TEMP}/${authorImage}`
      );

      const t_spans = await generateTSpansFromQuote({
        quote: quote.phrase,
      });

      const allFramesReady = frames.map((frame) =>
        sharpText({
          inputPath: `temp/raw-frames/${frame}`,
          outputPath: `temp/edited-frames/${frame}`,
          t_spans,
          authorName,
        })
      );

      await Promise.all(allFramesReady);

      await exec(
        `ffmpeg -r ${video_fps} -i temp/edited-frames/%d.png -i ${audio_cutted} -c:v libx264 -c:a libmp3lame -vf "fps=${video_fps},format=yuv420p" -y ${videoOutput}`
      );
      console.log("Cleaning up");
      deleteFolderRecursively("temp");

      return videoOutput;
    } catch (error) {
      console.log("An error occurred:", error);

      if (debug === false) {
        deleteFolderRecursively("temp");
        deleteFolderRecursively(
          `${properties.DIR_VIDEO_TEMP}/audio_trimmed.mp3`
        );
        deleteFolderRecursively(`${properties.DIR_VIDEO_TEMP}/videoOutput.mp4`);
      }
    }
  },
};
