const axios = require("axios");
const FormData = require("form-data");
const { decryptAndGetToken } = require("../database/mdb-tokens");

getOrUpdateAccessToken = async ({ code, refreshToken }) => {
  if (!code && !refreshToken) return;

  const bodyFormData = new FormData();
  bodyFormData.append("client_id", process.env.FREESOUND_CLIENT_ID);
  bodyFormData.append("client_secret", process.env.FREESOUND_CLIENT_SECRET);

  if (code) {
    bodyFormData.append("grant_type", "authorization_code");
    bodyFormData.append("code", code);
  } else if (refreshToken) {
    bodyFormData.append("grant_type", "refresh_token");
    bodyFormData.append("refresh_token", refreshToken);
  }

  const response = (
    await axios.post(
      `${process.env.FREESOUND_API_URL}/oauth2/access_token`,
      bodyFormData
    )
  ).data;

  return {
    access_token: response.access_token,
    refresh_token: response.refresh_token,
  };
};

getAuthorizationUrl = () => {
  return `${process.env.FREESOUND_API_URL}/oauth2/authorize?client_id=${process.env.FREESOUND_CLIENT_ID}&response_type=code`;
};

module.exports = {
  getAccessToken: async (code) => {
    return await getOrUpdateAccessToken({ code });
  },

  refreshAccessToken: async (refreshToken) => {
    return await getOrUpdateAccessToken({ refreshToken });
  },

  fetchAccessToken: async ({ force_continue = false }) => {
    const accessToken = await decryptAndGetToken({
      objectId: process.env.DB_FREESOUND_TOKEN_ID,
    });

    if (accessToken.expiration_date < new Date()) {
      console.log(
        `\nThe freesound token is expired, please use the following link to generate a new one.\n${getAuthorizationUrl()}\n`
      );
      if (!force_continue) process.exit(0);
    } else {
      // checking if token is going to expired in 4 hours or less
      if (accessToken.expiration_date - new Date() < 4 * 60 * 60 * 1000) {
        accessToken.token.needRefreshing = true;
      }
      return accessToken.token.accessToken;
    }
  },
};
