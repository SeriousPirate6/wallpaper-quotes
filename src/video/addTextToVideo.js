const fs = require("fs");
const util = require("util");
const {
  mediaCut,
  getMiddleSecondsGap,
  getMediaLength,
  videoDimensions,
  videoCrop,
} = require("./media-utility");
const properties = require("../constants/properties");
const { audioToMp3 } = require("../audio/audioConverter");
const exec = util.promisify(require("child_process").exec);
const { halveFrameRate } = require("./framesManipulations");
const { getVideoFramesPerSecond } = require("./media-utility");
const { deleteFolderRecursively } = require("../utility/media");
const { sharpText, maskAuthorImage } = require("./trySharpImageEdit");
const { generateTSpansFromQuote } = require("./generateTSpansFromQuote");

const debug = false;

module.exports = {
  addTextToVideo: async ({
    quote,
    frameList,
    framerate,
    videoInput,
    videoOutput,
    audioInput,
    audioOutput,
  }) => {
    try {
      console.log("Initializing temporary files");
      const rawFramesFolder = "temp/raw-frames";
      const editedFramesFolder = "temp/edited-frames";

      if (!fs.existsSync(rawFramesFolder)) {
        console.log(`Creating folder: "${rawFramesFolder}"`);
        fs.mkdirSync(rawFramesFolder);
      }
      if (!fs.existsSync(editedFramesFolder)) {
        console.log(`Creating folder: "${editedFramesFolder}"`);
        fs.mkdirSync(editedFramesFolder);
      }

      const duration = await getMediaLength(videoInput);

      const audio_timestamps = await getMiddleSecondsGap({
        mediaInput: audioInput,
        secondsToCut: duration,
      });

      const convertedFile = await audioToMp3({ audioInput, audioOutput });
      // currently mantaining the original audio extensions, it doesn't seem to cause any problems

      const audio_cutted = await mediaCut({
        mediaInput: convertedFile,
        mediaOutput: audioInput, // weird, but don't want to use a new name yet
        startTime: audio_timestamps.init,
        duration: audio_timestamps.duration,
        threadCount: 2,
      });

      console.log("Rendering");

      const authorName = quote.author.name;
      const authorImage = authorName.replace(" ", "_") + ".png";

      await maskAuthorImage(
        authorName,
        `${properties.DIR_VIDEO_TEST}/${authorImage}`
      );

      const t_spans = await generateTSpansFromQuote({
        quote: quote.phrase,
      });

      const allFramesReady = frameList.map((frame) =>
        sharpText({
          inputPath: `${rawFramesFolder}/${frame}`,
          outputPath: `${editedFramesFolder}/${frame}`,
          t_spans,
          authorName,
        })
      );

      await Promise.all(allFramesReady);

      await exec(
        `ffmpeg -r ${framerate} -i ${editedFramesFolder}/%d.png -i ${audio_cutted} -c:v libx265 -preset medium -x265-params "keyint=30:min-keyint=30:scenecut=0:open-gop=0:rc-lookahead=30:subme=0:crf=23:psy-rd=1.0:rdoq-level=2:qcomp=0.70" -r 30 -c:a aac -b:a 128k -movflags faststart -max_muxing_queue_size 9999 -vf "fps=${framerate},format=yuv420p" -y ${videoOutput}`
      );
      console.log("Cleaning up");
      deleteFolderRecursively("temp");

      return videoOutput;
    } catch (error) {
      console.log("An error occurred:", error);

      if (debug === false) {
        deleteFolderRecursively("temp");
        deleteFolderRecursively(`${properties.DIR_VIDEO_TEST}/audio_trimmed`);
        deleteFolderRecursively(`${properties.DIR_VIDEO_TEST}/videoOutput.mp4`);
      }
    }
  },
};
