const fs = require("fs");
const client = require("https");

module.exports = {
  downloadImage: (downloadImage = async (url, filepath) => {
    return new Promise((resolve, reject) => {
      client.get(url, (res) => {
        if (res.statusCode === 200) {
          const ext = res.headers["content-type"].split("/").pop();
          const complete_path = `${filepath.replaceAll(" ", "_")}.${ext}`;
          res
            .pipe(fs.createWriteStream(complete_path))
            .on("error", reject)
            .once("close", () => {
              resolve(complete_path);
              return complete_path;
            });
        } else {
          // Consume response data to free up memory
          res.resume();
          reject(
            new Error(`Request Failed With a Status Code: ${res.statusCode}`)
          );
        }
      });
    });
  }),

  getImageTypeFromUrl: (getImageTypeFromUrl = async (url) => {
    try {
      const reponse = await fetch(url, {
        method: "HEAD",
      });
      return reponse.headers.get("Content-Type");
    } catch {
      console.log(
        `The url: '${url}' is not valid or does not contains an image.`
      );
    }
  }),

  deleteImage: (deleteImage = async (filepath) => {}),
};
