getAccessToken = async (code) => {
  try {
    const response = (
      await axios.get(`${process.env.IG_GRAPH_URL}/oauth/access_token`, {
        params: {
          client_id: process.env.IG_APP_CLIENT_ID,
          redirect_uri: process.env.IG_REDIRECT_URL,
          client_secret: process.env.IG_APP_SECRET_KEY,
          code,
        },
      })
    ).data;
    console.log(response);
    return response.access_token ? response.access_token : null;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getLongLiveAccessToken: async (code) => {
    const accessToken = await getAccessToken(code);

    if (accessToken) {
      try {
        const response = (
          await axios.get(`${process.env.IG_GRAPH_URL}/oauth/access_token`, {
            params: {
              client_id: process.env.IG_APP_CLIENT_ID,
              client_secret: process.env.IG_APP_SECRET_KEY,
              grant_type: "fb_exchange_token",
              fb_exchange_token: accessToken,
            },
          })
        ).data;
        console.log(response);
        return response.access_token ? response.access_token : null;
      } catch (error) {
        console.log(error);
      }
    }
  },
};
