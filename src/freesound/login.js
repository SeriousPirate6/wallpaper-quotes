const axios = require("axios");

module.exports = {
  getAuthorizationUrl: () => {
    return `${process.env.FREESOUND_API_URL}/oauth2/authorize?client_id=${process.env.FREESOUND_CLIENT_ID}&response_type=code`;
  },

  getAccessToken: async (code) => {
    const response = (
      await axios.post(`${process.env.FREESOUND_API_URL}/oauth2/access_token`, {
        params: {
          client_id: process.env.FREESOUND_CLIENT_ID,
          client_secret: process.env.FREESOUND_CLIENT_SECRET,
          grant_type: "authorization_code",
          code,
        },
      })
    ).data;

    console.log(response);
    return {
      access_token: response.access_token,
      refresh_token: response.refresh_token,
    };
  },

  refreshToken: async (refresh_token) => {
    const response = (
      await axios.post(`${process.env.FREESOUND_API_URL}/oauth2/access_token`, {
        params: {
          client_id: process.env.FREESOUND_CLIENT_ID,
          client_secret: process.env.FREESOUND_CLIENT_SECRET,
          grant_type: "refresh_token",
          refresh_token,
        },
      })
    ).data;

    console.log(response);
    return response;
  },
};
