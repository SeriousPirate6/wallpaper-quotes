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

  getVideo: async (query) => {
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
            per_page: 1,
          },
        })
      ).data?.videos[0];
      console.log(response);
      return response;
    } catch (error) {
      console.log(error);
    }
  },
};
