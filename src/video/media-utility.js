const ffmpeg = require("fluent-ffmpeg");
const { timeFormat } = require("../utility/timeFormat");

getSecondsGap = ({ mediaLength, secondsToCut, timeInit, duration }) => {
  if (isNaN(secondsToCut)) {
    console.log(`Param "seconds" must be of numeric type.`);
    return;
  }

  if (mediaLength < secondsToCut)
    return {
      init: "00:00:00.000",
      duration: timeFormat({ timeInSeconds: mediaLength }),
    };
  return {
    init: timeFormat({ timeInSeconds: timeInit }),
    duration: timeFormat({ timeInSeconds: duration }),
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

  getMiddleSecondsGap: async ({ mediaInput, secondsToCut }) => {
    const mediaLength = await getMediaLength(mediaInput);
    const starting_time = Number(((mediaLength - secondsToCut) / 2).toFixed(3));

    return getSecondsGap({
      mediaLength,
      secondsToCut,
      timeInit: starting_time,
      duration: secondsToCut,
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

  mediaCut: async ({
    mediaInput,
    mediaOutput,
    startTime = "00:00:00",
    duration,
  }) => {
    return new Promise((resolve, reject) => {
      ffmpeg(mediaInput)
        .setStartTime(startTime)
        .setDuration(duration)
        .output(mediaOutput)
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
  },
};
