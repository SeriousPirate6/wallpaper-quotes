require("dotenv").config();
const { DriveService } = require("../g-drive/DriveService");

module.exports = {
  quoteDriveUpload: async ({ image, db_quote }) => {
    const drive = new DriveService();
    await drive.authenticate();
    await drive.remainingSpace(true);
    const fileId = await drive.uploadFile({
      fileName: image,
      description: db_quote.phrase,
      file_props: { db_quote_id: db_quote.id },
      parentFolder: process.env.DRIVE_NEWQUOTES_FOLDER,
    });
    return fileId;
  },
};
