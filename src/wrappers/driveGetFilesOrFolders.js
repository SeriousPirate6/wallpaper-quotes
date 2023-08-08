const properties = require("../constants/properties");
const { DriveService } = require("../g-drive/DriveService");

module.exports = {
  driveGetFilesOrFolders: async (names) => {
    if (!Array.isArray(names)) {
      console.log("The param provided is not an array.");
      return;
    }

    const drive = new DriveService();
    await drive.authenticate();

    for await (fileName of names) {
      const fileProps = await drive.getAllIdsWithToken({
        query: `${properties.QUERY_NAME_CONTAINS(fileName)}`,
        fields:
          "files(id, name, webViewLink, properties(db_quote_id), parents)",
        print: false,
      });

      fileProps.forEach(async (file, index) => {
        const parentName = await drive.idToName({ fileId: file.parents[0] });
        fileProps[index].parents.push(parentName.name);
        console.log(fileProps[index]);
      });
    }
  },
};
