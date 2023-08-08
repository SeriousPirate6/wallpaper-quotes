require("dotenv").config();
const properties = require("../constants/properties");
const { DriveService } = require("../g-drive/DriveService");

module.exports = {
  quoteDriveUpload: async ({ media, db_quote, type }) => {
    const drive = new DriveService();
    await drive.authenticate();
    await drive.remainingSpace(true);
    const fileId = await drive.uploadFile({
      fileName: media,
      description: db_quote.phrase,
      file_props: {
        db_quote_id: db_quote.id,
        media_type:
          type === properties.REEL
            ? properties.MEDIA_FORMAT.MP4
            : properties.MEDIA_FORMAT.JPG,
      },
      parentFolder:
        type === properties.REEL
          ? process.env.DRIVE_NEWQUOTES_VIDEO_FOLDER
          : process.env.DRIVE_NEWQUOTES_FOLDER,
    });
    return fileId;
  },
};
