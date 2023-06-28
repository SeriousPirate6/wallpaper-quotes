require("dotenv").config();
const { generateRandom } = require("../../utility/stringUtils");

module.exports = {
  requireAuth: () => {
    const state = generateRandom(16);

    return `${process.env.IG_GRAPH_URL}dialog/oauth
    ?client_id=${process.env.IG_APP_CLIENT_ID}
    &redirect_uri=${process.env.IG_REDIRECT_URL}
    &state=${state}`;
  },
};
