const ffmpeg = require("fluent-ffmpeg");

module.exports = {
  mediaCut: async ({
    audioInput,
    audioOutput,
    startTime = "00:00:00",
    duration,
  }) => {
    return new Promise((resolve, reject) => {
      ffmpeg(audioInput)
        .setStartTime(startTime)
        .setDuration(duration)
        .output(audioOutput)
        .on("end", () => {
          console.log("Cutting complete");
          resolve(audioOutput);
        })
        .on("error", (err) => {
          console.error("Error cutting the audio:", err);
          reject(err);
        })
        .run();
    });
  },
};
