const { google } = require("googleapis");

module.exports = {
  getPropsFromFile: async ({ auth, fileId }) => {
    const drive = google.drive({ version: "v3", auth });
    const file = await drive.files.get({
      fileId: fileId,
      fields:
        "id, name, size, mimeType, parents, webViewLink, " +
        "properties(id, username, timestamp, media_type, media_product_type)," +
        "permissions(kind, id, emailAddress, role)",
    });
    console.log(file.data);
    return file.data ? file.data : null;
  },
};
