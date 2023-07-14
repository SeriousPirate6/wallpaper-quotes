const ffmpeg = require("fluent-ffmpeg");
const { timeFormat } = require("../utility/timeFormat");

getMediaLength = async (videoPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        console.error("Error getting video duration:", err);
        reject(err);
      }
      resolve(metadata.format.duration);
    });
  });
};

module.exports = {
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

  getLastSecondsGap: async ({ mediaInput, seconds }) => {
    if (isNaN(seconds)) {
      console.log(`Param "seconds" must be of numeric type.`);
      return;
    }

    const mediaLength = await getMediaLength(mediaInput);

    if (mediaLength < seconds)
      return {
        init: "00:00:00.000",
        end: timeFormat({ timeInSeconds: mediaLength }),
      };
    return {
      init: timeFormat({ timeInSeconds: mediaLength - seconds }),
      end: timeFormat({ timeInSeconds: mediaLength }),
    };
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
