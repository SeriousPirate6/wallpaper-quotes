const util = require("util");
const fs = require("fs-extra");
const { mediaCut } = require("./audio-utility");
const { sharpText, maskAuthorImage } = require("./trySharpImageEdit");
const { getVideoFramesPerSecond, getVideoLength } = require("./media-utility");

const exec = util.promisify(require("child_process").exec);

const debug = false;

const input = "test/input.mp4";
const output = "test/output.mp4";

const audioInput = "test/audio.mp3";
const audioOutput = "test/audio_trimmed.mp3";

(async function () {
  try {
    const video_fps = await getVideoFramesPerSecond(input);
    const video_duration = await getVideoLength(input);

    const audio_cutted = await mediaCut({
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

    const authorName = "Steve Jobs";
    const authorImage = authorName.replace(" ", "_") + ".png";

    await maskAuthorImage(authorName, "test/" + authorImage);

    for await (const frame of frames) {
      // TODO maybe use Promise.all() to speed up the process
      await sharpText({
        inputPath: `temp/raw-frames/${frame}`,
        outputPath: `temp/edited-frames/${frame}`,
        text: "Less is more.",
        authorName,
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
      await fs.unlink("test/audio_trimmed.mp3");
      await fs.unlink("test/output.mp4");
    }
  }
})();
