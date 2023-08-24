const fs = require("fs");
const Jimp = require("jimp");
const path = require("path");
const { checkURL } = require("./utility/checkURL");
const { shorten } = require("./utility/stringUtils");
const properties = require("./constants/properties");
const { getAuthorImage } = require("./utility/getAuthorImage");
const {
  getImageTypeFromUrl,
  deleteFolderRecursively,
} = require("./utility/media");

const isValidPath = (path) => {
  if (!fs.existsSync(path)) {
    console.warn(
      path
        ? `The path '${path}' does not exists.`
        : "Param 'imagePath' not provided."
    );
  } else return true;
};

module.exports = {
  adjustDimensionsAndRatio: (adjustDimensionsAndRatio = async ({
    imagePath,
    width = 1080, // IG standards
    height = 1350,
  }) => {
    try {
      const image_type = await getImageTypeFromUrl(imagePath);
      if (!image_type && !isValidPath(imagePath)) return;

      return new Promise((resolve, reject) => {
        Jimp.read(imagePath).then((image, err) => {
          if (err) reject(err);

          const file_ext = image_type
            ? `.${image_type.split("/")[1]}`
            : path.extname(imagePath);
          const file_name = shorten(
            path
              .parse(imagePath)
              .name.replace(/[^a-z0-9]|\s+|\r?\n|\r/gim, "_"),
            10
          );

          const timestamp = Date.now();
          const dest_folder = properties.DIR_RESIZED;
          if (!fs.existsSync(dest_folder)) fs.mkdirSync(dest_folder);

          const width_diff = width - image.bitmap.width;
          const height_diff = height - image.bitmap.height;
          if (width_diff > 0 || height_diff > 0) {
            // if one of the two measures are smaller than the corresponding target measure, we make sure to resize it.
            if (width_diff >= height_diff) {
              // if the difference gap is bigger in width, we make sure that width will be at least as its target measure.
              image.resize(
                width,
                (width / image.bitmap.width) * image.bitmap.height
              );
            } else {
              // same thing in case height gap is bigger than the one of width
              image.resize(
                (height / image.bitmap.height) * image.bitmap.width,
                height
              );
            }
          } else {
            // if both sizes are bigger than their target measures, we proceed doing the opposite compare to above
            if (width_diff > height_diff) {
              // the sign is inverted because the difference, if present, is negative in this case
              image.resize(
                width,
                (width / image.bitmap.width) * image.bitmap.height
              );
            } else {
              image.resize(
                (height / image.bitmap.height) * image.bitmap.width,
                height
              );
            }
          }

          fs.writeFileSync(
            `${dest_folder}/${file_name}_${timestamp}${file_ext}`,
            Jimp.encoders["image/png"](
              image.crop(
                image.bitmap.width - width > 0
                  ? (image.bitmap.width - width) / 2
                  : 0,
                image.bitmap.height - height > 0
                  ? (image.bitmap.height - height) / 2
                  : 0,
                width,
                height
              )
            )
          );
          resolve(`${dest_folder}/${file_name}_${timestamp}${file_ext}`);
        });
      });
    } catch (err) {
      console.log(err);
    }
  }),

  addTextToImage: (addTextToImage = async ({
    imagePath,
    imageCaption = "Pass your text throught the param 'imageCaption'",
    textFont = Jimp.FONT_SANS_128_BLACK,
    authorName = "Author name here",
    authorFont = Jimp.FONT_SANS_32_BLACK,
    outputPath,
  }) => {
    if (!isValidPath(imagePath)) return;

    const file_ext = path.extname(imagePath);
    const file_name = imagePath.replace(/^.*[\\\/]/, "");

    const timestamp = Date.now();
    const dest_folder = properties.DIR_OUTPUT;
    if (!fs.existsSync(dest_folder)) fs.mkdirSync(dest_folder);

    return new Promise((resolve, reject) => {
      Jimp.read(`${imagePath}`)
        .then(async function (image) {
          const textImage = new Jimp(
            image.bitmap.width,
            image.bitmap.height,
            0x0,
            (err) => {
              //((0x0 = 0 = rgba(0, 0, 0, 0)) = transparent)
              if (err) reject(err);
            }
          );
          const font = await Jimp.loadFont(textFont);
          const font2 = await Jimp.loadFont(authorFont);
          textImage.print(
            font,
            0,
            0,
            {
              text: `"${imageCaption.trim()}"`,
              alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
              alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
            },
            image.bitmap.width - properties.TEXT_WIDTH,
            image.bitmap.height
          );
          textImage.print(
            font2,
            0,
            0,
            {
              text: `~ ${authorName.trim()}`,
              alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT,
              alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM,
            },
            image.bitmap.width - 300,
            image.bitmap.height - 200
          );
          textImage.color([{ apply: "xor", params: ["#ffffff"] }]);

          const author_image_url = getAuthorImage(authorName);
          const urlExists = await checkURL(author_image_url);

          Jimp.read(properties.QUOTE_FRAME, (err, backgr) => {
            if (err) {
              reject(err);
            } else {
              Jimp.read(
                urlExists ? author_image_url : properties.UNKNOWN_AUTHOR_IMAGE,
                async (err, author_image) => {
                  if (err) {
                    reject(err);
                  } else {
                    const mask = await Jimp.read(properties.CIRCLE_MASK);
                    const masked_image = author_image.resize(
                      mask.bitmap.width,
                      mask.bitmap.height
                    );
                    mask.mask(masked_image, 0, 0);
                    fs.writeFileSync(
                      outputPath
                        ? outputPath
                        : `${dest_folder}/${file_name}_${timestamp}${file_ext}`,
                      Jimp.encoders["image/png"](
                        image
                          .blit(backgr, 0, 0)
                          .blit(textImage, properties.TEXT_WIDTH / 2, 0)
                          .blit(
                            mask,
                            image.bitmap.width -
                              properties.AUTHOR_IMAGE_OFFSET_X,
                            image.bitmap.height -
                              properties.AUTHOR_IMAGE_OFFSET_Y
                          )
                      )
                    );
                    deleteFolderRecursively(properties.DIR_RESIZED);
                    resolve(
                      outputPath
                        ? outputPath
                        : `${dest_folder}/${file_name}_${timestamp}${file_ext}`
                    );
                  }
                }
              );
            }
          });
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }),
};
