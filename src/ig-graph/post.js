require("dotenv").config();
const axios = require("axios");

getPostId = async ({
  access_token,
  media_url,
  media_type,
  caption,
  is_reel = false,
}) => {
  try {
    const response = (
      await axios.post(
        `${process.env.IG_GRAPH_URL}/${process.env.IG_BUSINESS_ID}/media`,
        null, // data params not needed
        {
          params: {
            image_url: !is_reel ? media_url : null,
            video_url: is_reel ? media_url : null,
            media_type,
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

postMedia = async ({ access_token, creation_id, cooldownSeconds = 2 }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const post_media = await axios.post(
        process.env.IG_GRAPH_URL +
          `/${process.env.IG_BUSINESS_ID}/media_publish`,
        null, // data params not needed
        {
          params: {
            creation_id,
            access_token,
          },
        }
      );

      resolve(post_media.data);
    } catch (err) {
      if (err.response?.data?.error?.code === 9007) {
        setTimeout(async () => {
          console.log(
            `Media not ready yet, retrying in ${cooldownSeconds} second(s)...`
          );
          resolve(await postMedia({ access_token, creation_id }));
        }, cooldownSeconds * 1000);
      } else {
        console.log(err.response?.data);
        reject(err.response?.data);
      }
    }
  });
};

checkPublishingLimits = async ({ access_token }) => {
  const response = (
    await axios.get(
      process.env.IG_GRAPH_URL +
        `/${process.env.IG_BUSINESS_ID}/content_publishing_limit`,
      {
        params: {
          fields: "config, quota_usage",
          access_token,
        },
      }
    )
  ).data.data;
  return response;
};

module.exports = {
  createImagePost: async ({ access_token, media_url, caption }) => {
    const creation_id = await getPostId({
      access_token,
      media_url,
      caption,
    });
    await postMedia({ access_token, creation_id });

    console.log(`New post with id: ${creation_id}`);
    return creation_id;
  },

  createStoryPost: async ({ access_token, story_url, is_reel = false }) => {
    const creation_id = await getPostId({
      access_token,
      media_url: story_url,
      media_type: "STORIES",
      is_reel,
    });
    await postMedia({ access_token, creation_id });

    console.log(`New story with id: ${creation_id}`);
    return creation_id;
  },

  createReelPost: async ({ access_token, media_url, caption }) => {
    const creation_id = await getPostId({
      access_token,
      media_url,
      media_type: "REELS",
      caption,
      is_reel: true,
    });

    await postMedia({ access_token, creation_id });

    console.log(`New reel with id: ${creation_id}`);
    return creation_id;
  },

  getPostedLast24h: async ({ access_token }) => {
    const response = await checkPublishingLimits({ access_token });
    return response[0].quota_usage;
  },
};
