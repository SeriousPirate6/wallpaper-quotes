const DriveService = require("../g-drive/DriveService");

module.exports = {
  driveUpload: async ({ image, db_quote }) => {
    const drive = new DriveService();
    await drive.initialize();
    await drive.remainingSpace(true);
    await drive.uploadFile({
      fileName: image,
      description: db_quote.phrase,
      file_props: { db_quote_id: db_quote.id },
    });
  },
};
