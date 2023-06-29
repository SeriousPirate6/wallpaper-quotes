require("dotenv").config();
const { generateRandom } = require("../../utility/stringUtils");

module.exports = {
  requireAuth: () => {
    const state = generateRandom(16);

    return (
      `${process.env.FB_AUTH_URL}` +
      `?client_id=${process.env.IG_APP_CLIENT_ID}` +
      `&redirect_uri=${process.env.IG_REDIRECT_URL}` +
      `&state=${state}`
    );
  },
};
