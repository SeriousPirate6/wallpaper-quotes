const ffmpeg = require("fluent-ffmpeg");

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

  lightenVideo: async ({ inputFilePath, outputFilePath }) => {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(inputFilePath)
        .output(outputFilePath)
        .audioCodec("aac") // Set the audio codec
        .videoCodec("libx264") // Set the video codec
        .outputOptions([
          "-movflags",
          "faststart", // Optimize for web streaming
          "-preset",
          "medium", // Set the encoding speed (adjust as needed)
        ])
        .on("end", () => {
          console.log("Conversion finished");
          resolve(outputFilePath);
        })
        .on("error", (err) => {
          console.error("Error converting video:", err);
          reject(err);
        })
        .run();
    });
  },
};
