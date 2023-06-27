require("dotenv").config();
const { google } = require("googleapis");
const { nameToFolderId } = require("./getNameOrId");

module.exports = {
  createFolder: async ({ auth, folderName, parentId = null }) => {
    const driveService = google.drive({ version: "v3", auth });

    if (!folderName) {
      console.log(`Cannot create folder with null name.`);
      return;
    }

    const folderId = await nameToFolderId({ auth, folderName });
    if (folderId) {
      console.log(`The folder ${folderName} already exists.`);
      return folderId;
    }

    const folderMetaData = {
      name: folderName,
      parents: [parentId ? parentId : process.env.DRIVE_DEFAULT_FOLDER],
      mimeType: "application/vnd.google-apps.folder",
    };

    const response = await driveService.files.create({
      resource: folderMetaData,
      fields: "id",
    });

    switch (response.status) {
      case 200:
        console.log("Folder created id: ", response.data.id);
        return response.data.id;
      default:
        console.log("Error creating folder, " + response.errors);
        break;
    }
  },
};
