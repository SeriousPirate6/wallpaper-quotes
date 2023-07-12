const fs = require("fs");
const sharp = require("sharp");
const properties = require("../constants/properties");
const { downloadImage } = require("../utility/media");
const { getAuthorImage } = require("../utility/getAuthorImage");

module.exports = {
  sharpText: (sharpText = async ({
    inputPath,
    outputPath,
    text,
    authorName,
  }) => {
    const { width, height } = await sharp(inputPath).metadata();

    sharp(inputPath)
      .composite([
        {
          input: properties.VIDEO_QUOTE_FRAME,
          gravity: "southeast",
        },
        {
          input: "test/" + authorName.replace(" ", "_") + ".png",
          gravity: "southeast",
          top: 1687,
          left: 902,
        },
        {
          input: Buffer.from(
            `<svg width="${width}" height="${height}">
            <style>
            .title { fill: "white"; font-size: 70px; font-weight: bold; font-family: 'Helvetica', sans-serif;"}
            </style>
            <text x="50%" y="50%" fill="white" text-anchor="middle" class="title">${text}</text>
            </svg>`
          ),
          gravity: "southeast",
        },
        {
          input: Buffer.from(
            `<svg width="${width}" height="${height}">
            <style>
            .title { fill: "white"; font-size: 28px; font-weight: bold; font-family: 'Arial', sans-serif;"}
            </style>
            <text x="50%" y="50%" fill="white" text-anchor="middle" class="title">${authorName}</text>
            </svg>`
          ),
          gravity: "southeast",
          top: height / 2 - 255,
          left: width / 2 - 176,
        },
      ])
      .toFile(outputPath, (error, info) => {
        if (error) {
          console.error("Error processing image:", error);
        } else {
          console.log("Image processed successfully");
          console.log("Output file:", info);
        }
      });
  }),

  maskAuthorImage: (maskAuthorImage = async (authorName, outputPath) => {
    const image = await downloadImage({
      url: getAuthorImage(authorName),
      outputPath: "test/" + authorName,
    });

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
        } else {
          console.log("Image processed successfully");
          console.log("Output file:", info);
        }
      });
  }),
};
