const Jimp = require("jimp");
const util = require("util");
const fs = require("fs-extra");
const { addTextToImage } = require("../jimp");
const { getVideoFramesPerSecond, getVideoLength } = require("./video-utility");
const { audioCut } = require("./audio-utility");

const exec = util.promisify(require("child_process").exec);

const debug = true;

const input = "input.mp4";
const output = "output.mp4";

const audioInput = "audio.mp3";
const audioOutput = "audio_trimmed.mp3";

(async function () {
  try {
    const video_fps = await getVideoFramesPerSecond(input);
    const video_duration = await getVideoLength(input);

    const audio_cutted = await audioCut({
      audioInput,
      audioOutput,
      startTime: "00:00:20",
      duration:
        video_duration.hours +
        ":" +
        video_duration.minutes +
        ":" +
        video_duration.seconds +
        "." +
        video_duration.milliseconds,
    });

    console.log("Initializing temporary files");
    await fs.mkdir("temp");
    await fs.mkdir("temp/raw-frames");
    await fs.mkdir("temp/edited-frames");

    console.log("Decoding");
    await exec(`ffmpeg -i ${input} temp/raw-frames/%d.png`);

    console.log("Rendering");
    const frames = fs.readdirSync("temp/raw-frames");

    for (let count = 1; count <= frames.length; count++) {
      let frame = await Jimp.read(`temp/raw-frames/${count}.png`);

      frame = await addTextToImage({
        imagePath: `temp/raw-frames/${count}.png`,
        outputPath: `temp/edited-frames/${count}.png`,
      });
    }

    await exec(
      `ffmpeg -r ${video_fps} -i temp/edited-frames/%d.png -i ${audio_cutted} -c:v libx264 -c:a libmp3lame -vf "fps=${video_fps},format=yuv420p" ${output}`
    );

    console.log("Cleaning up");
    await fs.remove("temp");
  } catch (error) {
    console.log("An error occurred:", error);

    if (debug === false) {
      await fs.remove("temp");
    }
  }
})();
