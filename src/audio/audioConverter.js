const ffmpeg = require("fluent-ffmpeg");

module.exports = {
  audioToMp3: async ({ audioInput, audioOutput }) => {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(audioInput)
        .audioCodec("libmp3lame")
        .audioBitrate("192k")
        .output(audioOutput)
        .on("end", () => {
          console.log("Conversion finished");
          resolve(audioOutput);
        })
        .on("error", (err) => {
          console.error("Error converting audio:", err);
          reject(err);
        })
        .run();
    });
  },
};
