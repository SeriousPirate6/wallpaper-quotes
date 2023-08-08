const { handlingRedirects } = require("./media");

require("dotenv").config();

module.exports = {
  contructDriveUrl: async ({ web_link }) => {
    // extracting the sharable id
    return await handlingRedirects(
      process.env.DRIVE_DOWNLOAD_URI + web_link.split("/")[5]
    );
  },
};
