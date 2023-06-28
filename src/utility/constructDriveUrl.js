require("dotenv").config();

module.exports = {
  contructDriveUrl: ({ web_link }) => {
    // extracting the sharable id
    return process.env.DRIVE_DOWNLOAD_URI + web_link.split("/")[5];
  },
};
