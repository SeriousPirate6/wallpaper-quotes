require("dotenv").config();
const axios = require("axios");

defaultStructure = async ({ endpoint, params }) => {
  const response = (
    await axios.get(`${process.env.IMAGGA_API_URL}/${endpoint}`, {
      params,
      auth: {
        username: process.env.IMAGGA_API_KEY,
        password: process.env.IMAGGA_API_SECRET,
      },
    })
  ).data;

  return response;
};

module.exports = {
  tagImage: async ({ image_url }) => {
    const response = await defaultStructure({
      endpoint: "tags",
      params: { image_url },
    });
    console.log(response);
    return response;
  },

  searchText: async ({ image_url }) => {
    const response = await defaultStructure({
      endpoint: "text",
      params: { image_url },
    });
    console.log(response);
    return response;
  },

  cropRelevant: async ({ image_url, resolution }) => {
    const response = await defaultStructure({
      endpoint: "croppings",
      params: { image_url, resolution },
    });
    console.log(response);
    return response;
  },
};

// icon;
// word;
// tile;
// graffiti;
// icons;
// wrapping;
// text;
// letters;
// texture;
// cardboard;
