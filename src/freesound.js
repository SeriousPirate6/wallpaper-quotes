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

  downloadAudio: (downloadAudio = async ({ query, pathNoName }) => {
    const url = await getAudioLink({ query });

    return new Promise((resolve, reject) => {
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

          const outputFile =
            pathNoName +
            "/" +
            stringToMap(contentDisposition).get("filename").replace(/"/g, "");

          fs.writeFileSync(outputFile, response.data);

          console.log("Audio downloaded successfully.");
          resolve(outputFile);
        })
        .catch((error) => {
          console.error("Error downloading audio:", error.message);
          reject(error.message);
        });
    });
  }),
};
