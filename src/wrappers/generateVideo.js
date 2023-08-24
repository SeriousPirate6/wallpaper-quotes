const fs = require("fs");
const util = require("util");
const properties = require("../constants/properties");
const { downloadMedia } = require("../utility/media");
const { downloadAudio } = require("../freesound/sounds");
const exec = util.promisify(require("child_process").exec);
const { addTextToVideo } = require("../video/addTextToVideo");
const {
  getMiddleSecondsGap,
  videoDimensions,
  getVideoFramesPerSecond,
  videoCrop,
} = require("../video/media-utility");
const {
  halveFrameRate,
  extractFramesFromDuration,
} = require("../video/framesManipulations");

module.exports = {
  generateVideo: (generateVideo = async ({
    db_quote,
    targetWidth = 1080,
    targetHeight = 1920,
  }) => {
    const tempFolder = "temp";
    const rawFramesFolder = tempFolder + "/raw-frames";

    if (!fs.existsSync(properties.DIR_VIDEO_TEST)) {
      console.log(`Creating folder: '${properties.DIR_VIDEO_TEST}'`);
      fs.mkdirSync(properties.DIR_VIDEO_TEST);
    }
    if (!fs.existsSync(tempFolder)) {
      console.log(`Creating folder: "${tempFolder}"`);
      fs.mkdirSync(tempFolder);
    }
    if (!fs.existsSync(rawFramesFolder)) {
      console.log(`Creating folder: "${rawFramesFolder}"`);
      fs.mkdirSync(rawFramesFolder);
    }

    let videoInput = await downloadMedia({
      mediaUrl: db_quote.video.url,
      outputPath: `${properties.DIR_VIDEO_TEST}/downloaded_video`,
    });

    const audioInput = await downloadAudio({
      query: "classical music",
      pathNoName: properties.DIR_VIDEO_TEST,
    });

    const video_dimensions = await videoDimensions({ videoInput });
    if (
      video_dimensions.width > targetWidth ||
      video_dimensions.height > targetHeight
    ) {
      videoInput = await videoCrop({ videoInput });
    }

    const midSeconds = await getMiddleSecondsGap({
      mediaInput: videoInput,
      secondsToCut: 8,
      timeFormatted: false,
    });

    const framerate = await getVideoFramesPerSecond(videoInput);
    const videoOutput = `${properties.DIR_VIDEO_TEST}/output.mp4`;
    const audioOutput = `${properties.DIR_VIDEO_TEST}/audio_trimmed.wav`;

    console.log("Decoding");
    await exec(`ffmpeg -i ${videoInput} -y ${rawFramesFolder}/%d.png`);

    frames = [];
    // reading frames in folder an sorting them in numeric asc order
    fs.readdirSync(rawFramesFolder).forEach((file) => {
      frame_number = Number(file.replace(/\.[^/.]+$/, ""));
      frames[frame_number] = `${rawFramesFolder}/${file}`;
    });
    const remainingFramesList = halveFrameRate({
      frames,
      framerate,
    });
    const frameList = extractFramesFromDuration({
      frames: remainingFramesList.frames,
      framerate: remainingFramesList.framerate,
      start: midSeconds.init,
      duration: midSeconds.duration,
    });

    const videoEdited = await addTextToVideo({
      quote: db_quote,
      frameList,
      framerate,
      videoInput,
      videoOutput,
      audioInput,
      audioOutput,
    });

    console.log(videoEdited);
    return videoEdited;
  }),
};
