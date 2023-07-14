const { searchVideo } = require("../pexel");
const { downloadMedia } = require("../utility/media");
const { mediaCut, getLastSecondsGap } = require("../video/media-utility");

module.exports = {
  generateVideo: (generateVideo = async (db_quote) => {
    const video = await searchVideo({ query: db_quote.image.keyword });
    const rand = Math.floor(Math.random() * video.length);

    const videoPath = await downloadMedia({
      mediaUrl: video[rand].video_files.find((video) => video.width === 1080)
        .link,
      outputPath: "downloaded_video",
    });

    const lastSeconds = await getLastSecondsGap({
      mediaInput: videoPath,
      seconds: 5,
    });

    const video_trimmed = await mediaCut({
      mediaInput: videoPath,
      mediaOutput: "test/output_trimmed.mp4",
      startTime: lastSeconds.init,
      duration: lastSeconds.end,
    });
  }),
};

(async () => {
  await generateVideo({ image: { keyword: "skyscraper" } });
})();
