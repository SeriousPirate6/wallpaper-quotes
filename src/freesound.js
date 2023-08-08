const fs = require("fs");
require("dotenv").config();
const axios = require("axios");
const { stringToMap } = require("./utility/stringUtils");
const { downloadMedia, handlingRedirects } = require("./utility/media");
const { createReelPost } = require("./ig-graph/post");
const { decryptAndGetToken } = require("./database/mdb-ig");

searchAudio = async ({ query, page_size = 150 }) => {
  const results = (
    await axios.get(`${process.env.FREESOUND_API_URL}/search/text`, {
      params: {
        query,
        page_size,
        token: process.env.FREESOUND_API_KEY,
      },
    })
  ).data.results;

  console.log("results number:", results.length);
  const random_sound = results[Math.floor(Math.random() * results.length)];

  console.log(random_sound);
  return random_sound;
};

module.exports = {
  getAudioLink: (getAudioLink = async ({ query }) => {
    const audio = await searchAudio({ query });

    const response = (
      await axios.get(`${process.env.FREESOUND_API_URL}/sounds/${audio.id}`, {
        params: {
          token: process.env.FREESOUND_API_KEY,
        },
      })
    ).data;

    const url = response.download;

    console.log(url);
    return url;
  }),

  downloadAudio: (downloadAudio = async ({ query }) => {
    const url = await getAudioLink({ query });

    axios({
      method: "get",
      url,
      responseType: "arraybuffer",
      headers: {
        Authorization: `Bearer ${process.env.FREESOUND_ACCESS_TOKEN}`,
      },
    })
      .then((response) => {
        const contentDisposition = response.headers["content-disposition"];

        const outputFile = stringToMap(contentDisposition)
          .get("filename")
          .replace(/"/g, "");

        fs.writeFileSync(outputFile, response.data);

        console.log("Audio downloaded successfully.");
      })
      .catch((error) => {
        console.error("Error downloading audio:", error.message);
      });
  }),
};

(async () => {
  //   const audio = await getAudioLink({ query: "calming sounds" });
  //   const audio = await downloadAudio({ query: "classical music" });
  //   await downloadMedia({ mediaUrl: audio, outputPath: "downloaded_audio" });
})();
