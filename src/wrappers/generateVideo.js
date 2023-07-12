const { searchVideo } = require("../pexel");
const { downloadVideo } = require("../utility/media");

module.exports = {
  generateVideo: (generateVideo = async (db_quote) => {
    const video = await searchVideo({ query: db_quote.image.keyword });
    const rand = Math.floor(Math.random() * video.length);

    const videoPath = await downloadVideo({
      videoUrl: video[rand].video_files.find((video) => video.width === 1080)
        .link,
      outputPath: "downloaded_video.mp4",
    });
  }),
};

(async () => {
  await generateVideo({ image: { keyword: "power" } });
})();
