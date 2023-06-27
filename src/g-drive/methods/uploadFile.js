const { google } = require("googleapis");

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
      parents: [parentFolder ? parentFolder : this.wquotes_folder],
      description,
      properties: file_props,
    };

    const media = {
      mimeType:
        file_props.media_type === properties.MEDIA_FORMAT.MP4
          ? properties.MIME_TYPE.VIDEO
          : properties.MIME_TYPE.IMAGE,
      body: fs.createReadStream(fileName),
    };

    const response = await driveService.files.create({
      resource: fileMetaData,
      media: media,
      fields: "id",
    });

    switch (response.status) {
      case 200:
        console.log("File created id: ", response.data.id);
        break;
      default:
        console.log("Error creating file, " + response.errors);
        break;
    }
  },
};
