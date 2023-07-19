const sharp = require("sharp");
const properties = require("../constants/properties");
const { downloadMedia } = require("../utility/media");
const { getAuthorImage } = require("../utility/getAuthorImage");

module.exports = {
  sharpText: (sharpText = async ({
    inputPath,
    outputPath,
    t_spans,
    authorName,
    targetWidth = 1080,
    targetHeight = 1920,
  }) => {
    return new Promise((resolve, reject) => {
      sharp(inputPath)
        .resize(targetWidth, targetHeight)
        .composite([
          {
            input: properties.VIDEO_QUOTE_FRAME,
            gravity: "southeast",
          },
          {
            input: `${properties.DIR_VIDEO_TEMP}/${authorName.replace(
              " ",
              "_"
            )}.png`,
            gravity: "southeast",
            top: targetHeight - 233,
            left: targetWidth - 178,
          },
          {
            input: Buffer.from(
              `<svg width="${targetWidth}" height="${targetHeight}">
                <style>
                  .title {
                    fill: "white"; font-size: 70px; font-weight: bold; font-family: 'Helvetica', sans-serif;"
                  }
                </style>
                <text x="50%" y="50%" fill="white" text-anchor="middle" class="title">
                  ${t_spans
                    .map((row) => {
                      return row;
                    })
                    .join("\n")}
                </text>
              </svg>`
            ),
            gravity: "southeast",
          },
          {
            input: Buffer.from(
              `<svg width="${targetWidth}" height="${targetHeight}">
                <style>
                  .title {
                    fill: "white"; font-size: 28px; font-weight: bold; font-family: 'Helvetica', sans-serif;"
                  }
                </style>
                <text x="50%" y="50%" fill="white" text-anchor="middle" class="title">${authorName}</text>
              </svg>`
            ),
            gravity: "southeast",
            top: targetHeight / 2 - 255,
            left: targetWidth / 2 - 176,
          },
        ])
        .toFile(outputPath, (error, info) => {
          if (error) {
            console.error("Error processing image:", error);
            reject(error);
          } else {
            console.log("Image processed successfully");
            console.log("Output file:", info);
            resolve(outputPath);
          }
        });
    });
  }),

  maskAuthorImage: (maskAuthorImage = async (authorName, outputPath) => {
    const image = await downloadMedia({
      mediaUrl: getAuthorImage(authorName),
      outputPath: `${properties.DIR_VIDEO_TEMP}/${authorName}`,
    });
    return new Promise((resolve, reject) => {
      sharp(image)
        .resize(156, 156)
        .composite([
          {
            input: properties.CIRCLE_MASK,
            blend: "dest-in",
          },
        ])
        .toFile(outputPath, (error, info) => {
          if (error) {
            console.error("Error processing image:", error);
            reject(error);
          } else {
            console.log("Image processed successfully");
            console.log("Output file:", info);
            resolve(info);
          }
        });
    });
  }),
};
