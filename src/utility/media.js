const fs = require("fs");
const client = require("https");
const { https } = require("follow-redirects");

handlingRedirects = async (videoUrl) => {
  return new Promise((resolve) => {
    const options = {
      method: "HEAD",
      maxRedirects: 10,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.3; WOW64; rv:34.0) Gecko/20100101 Firefox/34.0",
      },
    };

    const request = https.request(videoUrl, options, (response) => {
      const finalUrl = response.responseUrl;
      resolve(finalUrl);
    });

    request.end();
  });
};

module.exports = {
  downloadMedia: (downloadMedia = async ({ mediaUrl, outputPath }) => {
    return new Promise((resolve, reject) => {
      try {
        client.get(mediaUrl, async (res) => {
          switch (res.statusCode) {
            case 200:
              const ext = res.headers["content-type"].split("/").pop();
              const complete_path = `${outputPath.replace(/ /g, "_")}.${ext}`;
              res
                .pipe(fs.createWriteStream(complete_path))
                .on("error", reject)
                .once("close", () => {
                  resolve(complete_path);
                });
              break;
            case 302:
              const finalUrl = await handlingRedirects(mediaUrl);
              resolve(await downloadMedia({ mediaUrl: finalUrl, outputPath }));
              break;
            default:
              console.log(
                `Download not available, status code: ${res.statusCode}`
              );
          }
        });
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  }),

  downloadVideo: async ({ videoUrl, outputPath }) => {
    return new Promise(async (resolve, reject) => {
      const fileStream = fs.createWriteStream(outputPath);

      const finalUrl = await handlingRedirects(videoUrl);

      client.get(finalUrl, (response) => {
        response.pipe(fileStream);

        fileStream.on("finish", () => {
          console.log("Video downloaded successfully.");
          resolve(finalUrl);
        });

        fileStream.on("error", (err) => {
          console.error("Error downloading video:", err);
          reject(err);
        });
      });
    });
  },

  getImageTypeFromUrl: (getImageTypeFromUrl = async (mediaUrl) => {
    try {
      const reponse = await fetch(mediaUrl, {
        method: "HEAD",
      });
      return reponse.headers.get("Content-Type");
    } catch (err) {
      console.log(
        `The mediaUrl: '${mediaUrl}' is not valid or does not contains an image.\n${err}`
      );
    }
  }),

  deleteFile: (filePath) => {
    try {
      fs.unlinkSync(filePath);
      console.log("File deleted successfully: ", filePath);
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  },

  deleteFolderRecursively: (dir_output) => {
    fs.rmSync(dir_output, { recursive: true });
  },
};
