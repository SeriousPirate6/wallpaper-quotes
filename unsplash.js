require("dotenv").config();
const axios = require("axios");

module.exports = {
  searchPhoto: (searchPhoto = async (query) => {
    try {
      const response = (
        await axios.get(`${process.env.UNSPLASH_ENDPOINT}/search/photos`, {
          headers: {
            Authorization: `Client-ID ${process.env.UNSPLASH_API_KEY}`,
          },
          params: {
            query,
            per_page: 1,
          },
        })
      ).data;
      console.log(response.results[0]);
      return response.results[0];
    } catch (error) {
      console.log(error);
    }
  }),
};
