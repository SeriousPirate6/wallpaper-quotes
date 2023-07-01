const { google } = require("googleapis");

module.exports = {
  delItem: (delItem = async ({ auth, folderId }) => {
    const drive = google.drive({ version: "v3", auth });

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
  }),

  deleteItems: async ({ auth, ids }) => {
    if (!Array.isArray(ids)) {
      console.log("The param provided is not an array.");
      return;
    }

    for await (const id of ids) {
      await delItem({ auth, folderId: id.id });
    }
  },
};
