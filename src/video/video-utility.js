const ffmpeg = require("fluent-ffmpeg");
const { timeFormat } = require("../utility/timeFormat");

module.exports = {
  getVideoLength: async (videoPath) => {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          console.error("Error getting video duration:", err);
          reject(err);
        }

        const duration = metadata.format.duration;

        timeFormat({ timeInSeconds: duration });

        console.log("Video duration:", duration);
        resolve(duration);
      });
    });
  },

  getVideoFramesPerSecond: async (videoPath) => {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          console.error("Error getting video FPS:", err);
          reject(err);
        }

        const frameRate = metadata.streams[0].r_frame_rate.split("/")[0];
        console.log("Video FPS:", frameRate);
        resolve(frameRate);
      });
    });
  },
};
