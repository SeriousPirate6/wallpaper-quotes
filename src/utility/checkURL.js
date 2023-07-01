const http = require("http");
const https = require("https");

module.exports = {
  checkURL: async (url) => {
    const protocol = url.startsWith("https") ? https : http;

    return new Promise((resolve) => {
      protocol
        .get(url, (response) => {
          const { statusCode } = response;
          resolve(statusCode === 200);
        })
        .on("error", () => {
          resolve(false);
        });
    });
  },
};
