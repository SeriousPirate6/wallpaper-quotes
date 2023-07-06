const { default: axios } = require("axios");
const { constructJsonVars } = require("./getEnvVars");

module.exports = {
  pushEnvVarsToRender: async () => {
    const jsonData = constructJsonVars();
    if (!jsonData) return;

    try {
      const response = (
        await axios.put(
          `${process.env.RENDER_API_URL}/services/${process.env.RENDER_SERVICE_ID}/env-vars`,
          JSON.parse(jsonData),
          {
            headers: {
              Authorization: `Bearer ${process.env.RENDER_API_KEY}`,
            },
          }
        )
      ).data;
      console.log("Env vars uploaded successfully.");
      return response;
    } catch (error) {
      console.log(error);
    }
  },
};
