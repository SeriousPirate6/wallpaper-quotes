require("dotenv").config();
const { google } = require("googleapis");

module.exports = {
  authenticate: async () => {
    return new Promise((resolve) => {
      const SCOPES = ["https://www.googleapis.com/auth/drive"];

      const auth = new google.auth.GoogleAuth({
        keyFile: process.env.DRIVE_KEY_FILE,
        scopes: SCOPES,
      });
      resolve(auth);
    });
  },
};
