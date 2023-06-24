require("dotenv").config();
const axios = require("axios");

module.exports = {
  getRandomQuote: (getRandomQuote = async () => {
    try {
      const response = (
        await axios.get(`${process.env.ZENQUOTE_ENDPOINT}/random`)
      ).data;
      console.log(response[0]);
      return response[0];
    } catch (error) {
      console.log(error);
    }
  }),
};
