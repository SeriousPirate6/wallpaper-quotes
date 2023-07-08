require("dotenv").config();
const axios = require("axios");
const properties = require("../constants/properties");
const { getDateDifference } = require("../utility/getDateDifference");

getMedia = async ({
  access_token,
  fields = "id, caption, timestamp, media_type",
  since,
}) => {
  try {
    const response = (
      await axios.get(
        `${process.env.IG_GRAPH_URL}/${process.env.IG_BUSINESS_ID}/media`,
        {
          params: {
            fields,
            since,
            access_token,
          },
        }
      )
    ).data;
    return response;
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  getMediaLast24h: (getMediaLast24h = async ({ access_token }) => {
    const twentyFourHoursAgo = Math.floor(
      // Unix timestamp (epoch)
      new Date(new Date().getTime() - 24 * 60 * 60 * 1000).getTime() / 1000
    );

    const media = await getMedia({ access_token, since: twentyFourHoursAgo });
    return media.data;
  }),

  howMuchTillTheNextPost: async ({ access_token }) => {
    const postedLast24h = await getMediaLast24h({ access_token });
    const posts_number = postedLast24h.length;

    if (posts_number < properties.MAX_POSTS_PER_DAY) {
      console.log("The posts per day quota hasn't been reached yet.");
      return;
    }

    const oldestPost = postedLast24h[posts_number - 1];

    const oldestPostDate = new Date(oldestPost.timestamp);
    const twentyFourHoursAgo = new Date(
      new Date().getTime() - 24 * 60 * 60 * 1000
    );

    const dateDifference = getDateDifference(
      oldestPostDate,
      twentyFourHoursAgo
    );

    console.log(
      `How much to the next post: HH:mm:ss ${dateDifference.hours}:${dateDifference.minutes}:${dateDifference.seconds}`
    );

    return {
      HH: dateDifference.hours,
      mm: dateDifference.minutes,
      ss: dateDifference.seconds,
    };
  },
};
