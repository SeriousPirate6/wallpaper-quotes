const fs = require("fs");
require("dotenv").config();
const { google } = require("googleapis");
const properties = require("../constants/properties");

module.exports = {
  DriveService: class DriveService {
    initialize = async () => {
      this.auth = await new Promise((resolve) => {
        const SCOPES = ["https://www.googleapis.com/auth/drive"];

        const auth = new google.auth.GoogleAuth({
          keyFile: process.env.KEY_FILE,
          scopes: SCOPES,
        });

        resolve(auth);
      });

      this.wquotes_folder = await this.nameToFolderId({
        folderName: properties.FOLDER_QUOTES,
      });
    };

    remainingSpace = async (print) => {
      const drive = google.drive({ version: "v3", auth: this.auth });
      const about = await drive.about.get({ fields: "storageQuota" });
      const total_space = about.data.storageQuota.limit;
      const used_space = about.data.storageQuota.usage;

      const remaining_space = (
        (total_space - used_space) /
        1024 /
        1024 /
        1024
      ).toFixed(2);
      if (print) console.log(`\nRemaining space: ${remaining_space} GB\n`);
      return remaining_space;
    };

    getAllIdsWithToken = async ({
      query = false,
      fields = false,
      orderBy = false,
    }) => {
      const drive = google.drive({ version: "v3", auth: this.auth });
      let foldersList = [];
      let pageToken = true;
      while (pageToken) {
        const res = await drive.files.list({
          q: query
            ? `${query}`
            : "not mimeType = 'application/vnd.google-apps.folder'",
          fields: fields
            ? `nextPageToken, ${fields}`
            : "nextPageToken, files(id, name)",
          orderBy: orderBy ? orderBy : "",
          pageToken: pageToken === true ? "" : pageToken,
          pageSize: 1000,
        });
        pageToken = res.data.nextPageToken;
        res.data.files.forEach((file) => {
          foldersList.push(file);
        });
      }
      console.log(foldersList);
      return foldersList;
    };

    nameToFileId = async ({ fileName, contains = false, folder = false }) => {
      const searchMethod = contains ? "contains" : "=";
      const condition = folder ? "" : "not";

      const fileIds = await this.getAllIdsWithToken({
        query: `name ${searchMethod} '${fileName}' and ${condition} mimeType = 'application/vnd.google-apps.folder'`,
        fields: "files(id, name, createdTime)",
        orderBy: "createdTime asc",
      });

      if (contains) {
        console.log(fileIds);
        return fileIds.length === 0 ? null : fileIds;
      }
      return fileIds.length === 0 ? null : fileIds[0].id;
    };

    nameToFolderId = async ({ folderName, contains = false }) => {
      return await this.nameToFileId({
        fileName: folderName,
        contains,
        folder: true,
      });
    };

    idToName = async (fileId) => {
      const drive = google.drive({ version: "v3", auth: this.auth });
      const response = await drive.files.get({
        fileId: fileId,
      });
      return response.data.name;
    };

    createFolder = async ({ folderName, parentId = null }) => {
      const driveService = google.drive({ version: "v3", auth: this.auth });

      if (!folderName) {
        console.log(`Cannot create folder with null name.`);
        return;
      }

      const folderId = await this.nameToFolderId(folderName);
      if (folderId) {
        console.log(`The folder ${folderName} already exists.`);
        return folderId;
      }

      if (!parentId) {
        console.log("The parent folder provided is non existing.");
        return;
      }

      const folderMetaData = {
        name: folderName,
        parents: [parentId],
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
    };

    delItem = async (folderId) => {
      const drive = google.drive({ version: "v3", auth: this.auth });

      let response = await drive.files.delete({
        fileId: folderId,
      });
      switch (response.status) {
        case 200:
          console.log("Deleted file: ", response.data.files);
          break;
        default:
          console.log("Deleting file...", folderId);
          break;
      }
    };

    deleteItems = async ({ ids }) => {
      if (!Array.isArray(ids)) {
        console.log("The param provided is not an array.");
        return;
      }

      for await (const id of ids) {
        await this.delItem(id.id);
      }
    };

    uploadFile = async ({
      fileName,
      description,
      file_props,
      parentFolder = null,
    }) => {
      const driveService = google.drive({ version: "v3", auth: this.auth });

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
    };
  },
};
