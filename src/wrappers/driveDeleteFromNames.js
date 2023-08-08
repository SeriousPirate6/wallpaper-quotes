const properties = require("../constants/properties");
const { DriveService } = require("../g-drive/DriveService");

module.exports = {
  driveDeleteFromNames: async (names) => {
    if (!Array.isArray(names)) {
      console.log("The param provided is not an array.");
      return;
    }

    const drive = new DriveService();
    await drive.authenticate();

    for await (fileName of names) {
      const fileId = (
        await drive.getAllIdsWithToken({
          query: `${properties.QUERY_IN_PARENT(
            process.env.DRIVE_NEWQUOTES_FOLDER
          )} and ${
            properties.QUERY_NON_FOLDERS
          } and ${properties.QUERY_NAME_CONTAINS(fileName)}`,
          fields: "files(id, name, webViewLink, properties(db_quote_id))",
        })
      )[0].id;

      if (fileId) await drive.delItem({ fileId });
      else console.log("No file id for file name: ", fileName);
    }
  },
};
