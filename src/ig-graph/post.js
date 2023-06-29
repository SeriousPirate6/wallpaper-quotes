require("dotenv").config();
const axios = require("axios");

getPostId = async ({ access_token, image_url, caption }) => {
  try {
    const post_id = await axios.post(
      `${process.env.IG_GRAPH_URL}/${process.env.IG_BUSINESS_ID}/media`,
      {
        params: {
          image_url,
          caption,
          access_token,
        },
      }
    );
    return post_id;
  } catch (err) {
    console.log(err);
  }
};

postImage = async ({ access_token, creation_id }) => {
  await axios.post(
    process.env.IG_GRAPH_URL + `/${process.env.IG_BUSINESS_ID}/media_publish`,
    {
      params: {
        creation_id,
        access_token,
      },
    }
  );
};

module.exports = {
  createImagePost: async ({ access_token, image_url, caption }) => {
    const creation_id = await getPostId({ access_token, image_url, caption });
    await postImage({ access_token, creation_id });

    return creation_id;
  },
};
