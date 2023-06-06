require("dotenv").config();
const axios = require("axios");

module.exports = {
  searchPhoto: (searchPhoto = async ({ query, per_page = 1 }) => {
    try {
      const response = (
        await axios.get(`${process.env.UNSPLASH_ENDPOINT}/search/photos`, {
          headers: {
            Authorization: `Client-ID ${process.env.UNSPLASH_API_KEY}`,
          },
          params: {
            query,
            per_page,
          },
        })
      ).data.results;
      const random = Math.floor(Math.random() * response.length);
      console.log(response[random]);
      return response[random];
    } catch (error) {
      console.log(error);
    }
  }),

  getImagesVariants: (getImagesVariants = async ({ query, n_variants }) => {
    const images = [];
    for await (n of n_variants) {
      images.push(await searchPhoto({ query, per_page: n_variants }));
    }
    return images;
  }),
};
