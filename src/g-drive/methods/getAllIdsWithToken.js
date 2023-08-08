const { google } = require("googleapis");

module.exports = {
  getAllIdsWithToken: async ({
    auth,
    query = false,
    fields = false,
    orderBy = false,
    print = true,
  }) => {
    const drive = google.drive({ version: "v3", auth });
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
    if (print) console.log(foldersList);
    return foldersList;
  },
};
