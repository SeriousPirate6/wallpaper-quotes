require("dotenv").config();
const axios = require("axios");

getPostId = async ({ image_url, caption }) => {
  const post_id = await axios.get(
    process.env.IG_GRAPH_URL + `${process.env.IG_BUSINESS_ID}/media`,
    {
      params: {
        image_url,
        caption,
        access_token: process.env.IG_ACCESS_TOKEN,
      },
    }
  );
  return post_id;
};

postImage = async ({ creation_id }) => {
  await axios.get(
    process.env.IG_GRAPH_URL + `${process.env.IG_BUSINESS_ID}/media_publish`,
    {
      params: {
        creation_id,
        access_token: process.env.IG_ACCESS_TOKEN,
      },
    }
  );
};

module.exports = {
  createImagePost: async ({ image_url, caption }) => {
    const creation_id = await getPostId({ image_url, caption });
    await postImage({ creation_id });

    return creation_id;
  },
};
