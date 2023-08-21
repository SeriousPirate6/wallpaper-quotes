const ffmpeg = require("fluent-ffmpeg");
const { downloadAudio } = require("../freesound/sounds");
const {
  mediaCut,
  getMediaLength,
  getMiddleSecondsGap,
} = require("../video/media-utility");

module.exports = {
  audioToMp3: async ({ inputFilePath, outputFilePath }) => {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(inputFilePath)
        .audioCodec("libmp3lame")
        .audioBitrate("192k")
        .output(outputFilePath)
        .on("end", () => {
          console.log("Conversion finished");
          resolve(outputFilePath);
        })
        .on("error", (err) => {
          console.error("Error converting audio:", err);
          reject(err);
        })
        .run();
    });
  },
};
