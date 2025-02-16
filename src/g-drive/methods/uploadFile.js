require("dotenv").config();
const { google } = require("googleapis");
const properties = require("../../constants/properties");
const { createReadStream } = require("../../utility/createReadStream");

module.exports = {
  uploadFile: async ({
    auth,
    fileName,
    description,
    file_props,
    parentFolder = null,
  }) => {
    const driveService = google.drive({ version: "v3", auth });

    const fileMetaData = {
      name: fileName,
      parents: [parentFolder ? parentFolder : process.env.DRIVE_DEFAULT_FOLDER],
      description,
      properties: file_props,
    };

    try {
      const body = await createReadStream(fileName);

      const media = {
        mimeType:
          file_props.media_type === properties.MEDIA_FORMAT.MP4
            ? properties.MIME_TYPE.VIDEO
            : properties.MIME_TYPE.IMAGE,
        body,
      };

      const response = await driveService.files.create({
        resource: fileMetaData,
        media: media,
        fields: "id",
      });

      switch (response.status) {
        case 200:
          console.log("File created id: ", response.data.id);
          return response.data.id;
        default:
          console.log("Error creating file, " + response.errors);
          break;
      }
    } catch (err) {
      console.log(err);
    }
  },
};
