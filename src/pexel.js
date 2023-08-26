require("dotenv").config();
const axios = require("axios");

module.exports = {
  getImage: async (query) => {
    try {
      const response = (
        await axios.get(`${process.env.PEXEL_ENDPOINT}/v1/search`, {
          headers: {
            Authorization: process.env.PEXEL_API_KEY,
          },
          params: {
            query,
            page: 1,
            per_page: 1,
          },
        })
      ).data;
      // console.log(response.photos);
      return response.photos[0];
    } catch (error) {
      console.log(error);
    }
  },

  searchVideo: async ({ query }) => {
    try {
      const response = (
        await axios.get(`${process.env.PEXEL_ENDPOINT}/v1/videos/search`, {
          headers: {
            Authorization: process.env.PEXEL_API_KEY,
          },
          params: {
            query,
            orientation: "portrait",
            size: "medium",
            page: 1,
            per_page: 10,
          },
        })
      ).data?.videos;

      const optimalResolutionVideos = response.filter(
        (video) => video.width === 1080 || video.width === 720
      );

      if (optimalResolutionVideos.length === 0) {
        console.log("\nPossible low resolution video.\n");
        return response[0];
      }

      const rand = Math.floor(Math.random() * optimalResolutionVideos.length);
      return optimalResolutionVideos[rand];
    } catch (error) {
      console.log(error);
    }
  },
};
