require("dotenv").config();
const axios = require("axios");

module.exports = {
  getImage: (getImage = async (query) => {
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
  }),
};
