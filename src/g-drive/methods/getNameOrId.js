const { google } = require("googleapis");
const { getAllIdsWithToken } = require("./getAllIdsWithToken");

module.exports = {
  nameToFileId: (nameToFileId = async ({
    auth,
    fileName,
    contains = false,
    folder = false,
  }) => {
    const searchMethod = contains ? "contains" : "=";
    const condition = folder ? "" : "not";

    const fileIds = await getAllIdsWithToken({
      auth,
      query: `name ${searchMethod} '${fileName}' and ${condition} mimeType = 'application/vnd.google-apps.folder'`,
      fields: "files(id, name, createdTime, webViewLink)",
      orderBy: "createdTime asc",
    });

    console.log(fileIds.length);

    if (contains) {
      return fileIds.length === 0 ? null : fileIds;
    }
    return fileIds.length === 0 ? null : fileIds[0].id;
  }),

  nameToFolderId: async ({ auth, folderName, contains = false }) => {
    return await nameToFileId({
      auth,
      fileName: folderName,
      contains,
      folder: true,
    });
  },

  idToName: async ({ auth, fileId }) => {
    const drive = google.drive({ version: "v3", auth });
    const response = await drive.files.get({
      fileId: fileId,
    });
    return response.data.name;
  },
};
