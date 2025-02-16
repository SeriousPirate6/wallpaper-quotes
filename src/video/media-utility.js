const util = require("util");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffprobe-static").path;
const { timeFormat } = require("../utility/timeFormat");
const properties = require("../constants/properties");
const exec = util.promisify(require("child_process").exec);

getSecondsGap = ({
  mediaLength,
  secondsToCut,
  timeInit,
  duration,
  timeFormatted = true,
}) => {
  if (isNaN(secondsToCut)) {
    console.log(`Param "seconds" must be of numeric type.`);
    return;
  }

  if (mediaLength < secondsToCut)
    return {
      init: timeFormatted ? "00:00:00.000" : 0,
      duration: timeFormatted
        ? timeFormat({ timeInSeconds: mediaLength })
        : duration,
    };
  return {
    init: timeFormatted ? timeFormat({ timeInSeconds: timeInit }) : timeInit,
    duration: timeFormatted
      ? timeFormat({ timeInSeconds: duration })
      : duration,
  };
};

module.exports = {
  getMediaLength: (getMediaLength = async (videoPath) => {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          console.error("Error getting video duration:", err);
          reject(err);
        }
        resolve(metadata.format.duration);
      });
    });
  }),

  getFormattedMediaLength: async (videoPath) => {
    const duration = await getMediaLength(videoPath);
    const formattedDuration = timeFormat({ timeInSeconds: duration });
    console.log("Video duration:", formattedDuration);
    return formattedDuration;
  },

  getVideoFramesPerSecond: async (videoPath) => {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          console.error("Error getting video FPS:", err);
          reject(err);
        }

        const frameRate = eval(metadata.streams[0].r_frame_rate).toFixed(2);
        console.log("Video FPS:", frameRate);
        resolve(frameRate);
      });
    });
  },

  getMiddleSecondsGap: async ({
    mediaInput,
    secondsToCut,
    timeFormatted = true,
  }) => {
    const mediaLength = await getMediaLength(mediaInput);
    const starting_time = Number(((mediaLength - secondsToCut) / 2).toFixed(3));

    return getSecondsGap({
      mediaLength,
      secondsToCut,
      timeInit: starting_time,
      duration: secondsToCut,
      timeFormatted,
    });
  },

  getLastSecondsGap: async ({ mediaInput, secondsToCut }) => {
    const mediaLength = await getMediaLength(mediaInput);
    return getSecondsGap({
      mediaLength,
      secondsToCut,
      timeInit: mediaLength - secondsToCut,
      duration: secondsToCut,
    });
  },

  mediaCut: (mediaCut = async ({
    mediaInput,
    mediaOutput,
    startTime = "00:00:00",
    duration,
    threadCount = 2,
  }) => {
    return new Promise((resolve, reject) => {
      ffmpeg(mediaInput)
        .setStartTime(startTime)
        .setDuration(duration)
        .output(mediaOutput)
        .addOption("-threads", threadCount)
        .on("end", () => {
          console.log("Cutting complete");
          resolve(mediaOutput);
        })
        .on("error", (err) => {
          console.error("Error cutting the audio:", err);
          reject(err);
        })
        .run();
    });
  }),

  videoCrop: async ({
    videoInput,
    videoOutput = `${properties.DIR_VIDEO_TEST}/output-cropped.mp4`,
    cropWidth = 1080,
    cropHeight = 1920,
    cropX = 0,
    cropY = 0,
  }) => {
    await exec(
      `ffmpeg -i ${videoInput} -filter:v "crop=${cropWidth}:${cropHeight}:${cropX}:${cropY}" -y ${videoOutput}`
    );
    return videoOutput;
  },

  videoDimensions: async ({ videoInput }) => {
    ffmpeg.setFfprobePath(ffmpegPath);

    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoInput, (err, metadata) => {
        if (err) {
          console.error("Error getting video information:", err);
          reject(err);
        }
        const { width, height } = metadata.streams[0];
        resolve({ width, height });
      });
    });
  },
};
