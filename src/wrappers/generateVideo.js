const { searchVideo } = require("../pexel");
const { downloadMedia } = require("../utility/media");
const { mediaCut } = require("../video/audio-utility");

module.exports = {
  generateVideo: (generateVideo = async (db_quote) => {
    const video = await searchVideo({ query: db_quote.image.keyword });
    const rand = Math.floor(Math.random() * video.length);

    const video_trimmed = await mediaCut({
      audioInput: "test/output.mp4",
      audioOutput: "test/output_trimmed.mp4",
      startTime: "00:00:10",
      duration: "00:00:05",
    });

    const videoPath = await downloadMedia({
      mediaUrl: video[rand].video_files.find((video) => video.width === 1080)
        .link,
      outputPath: "downloaded_video.mp4",
    });
  }),
};

(async () => {
  await generateVideo({ image: { keyword: "power" } });
})();
