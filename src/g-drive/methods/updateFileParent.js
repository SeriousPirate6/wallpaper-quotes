const { google } = require("googleapis");
const { getPropsFromFile } = require("./getPropsFromId");

module.exports = {
  updateFileParent: async ({ auth, fileId, newParentId }) => {
    const driveService = google.drive({ version: "v3", auth });

    if (!fileId) {
      console.log(`The file ${fileId} does not exist.`);
      return;
    }

    if (!newParentId) {
      console.log("The parent folder provided is non existing.");
      return;
    }

    console.log("file: " + fileId);
    console.log("folder: " + newParentId);

    const { parents } = await getPropsFromFile(fileId);

    let response = await driveService.files.update({
      fileId: fileId,
      uploadType: "media",
      addParents: [newParentId],
      removeParents: [parents],
    });

    switch (response.status) {
      case 200:
        console.log("Update completed: ", response.data);
        return;
      default:
        console.log("Error uploading file, " + response.errors);
        break;
    }
    return;
  },
};
