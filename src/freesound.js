require("dotenv").config();
const axios = require("axios");
const { downloadMedia } = require("./utility/media");

searchAudio = async ({ query }) => {
  const results = (
    await axios.get(`${process.env.FREESOUND_API_URL}/search/text`, {
      params: {
        query,
        token: process.env.FREESOUND_API_KEY,
      },
    })
  ).data.results;

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

  downloadAudio: async () => {
    const audio = await searchAudio({ query });

    const response = (
      await axios.get(
        `${process.env.FREESOUND_API_URL}/sounds/${audio.id}/download`,
        {
          headers: {
            Authorization: `Bearer ${process.env.FREESOUND_ACCESS_TOKEN}`,
          },
        }
      )
    ).data;

    const url = response.download;
  },
};

(async () => {
  const audio = await getAudioLink({ query: "nature" });

  await downloadMedia({ mediaUrl: audio, outputPath: "downloaded_audio" });
})();
