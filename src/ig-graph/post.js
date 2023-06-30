require("dotenv").config();
const axios = require("axios");

getPostId = async ({ access_token, image_url, caption }) => {
  try {
    const response = (
      await axios.post(
        `${process.env.IG_GRAPH_URL}/${process.env.IG_BUSINESS_ID}/media`,
        null, // data params not needed
        {
          params: {
            image_url,
            caption,
            access_token,
          },
        }
      )
    ).data?.id;
    return response;
  } catch (err) {
    console.log(err);
  }
};

postImage = async ({ access_token, creation_id }) => {
  await axios.post(
    process.env.IG_GRAPH_URL + `/${process.env.IG_BUSINESS_ID}/media_publish`,
    null, // data params not needed
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

    console.log(`New post with id: ${creation_id}`);
    return creation_id;
  },
};
