const fs = require("fs");
const Jimp = require("jimp");
const path = require("path");
const fonts = require("./constants/fonts");
const properties = require("./constants/properties");

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
  adjustDimensionsAndRatio: (adjustDimensionsAndRatio = ({
    imagePath,
    width = 1080, // IG standards
    height = 1350,
  }) => {
    if (!isValidPath(imagePath)) return;
    return new Promise((resolve, reject) => {
      Jimp.read(imagePath, function (err, image) {
        if (err) reject(err);
        const file_ext = path.extname(imagePath);
        const file_name = path.parse(imagePath).name;

        const timestamp = Date.now();
        const dest_folder = "resized";
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
        image
          .crop(
            image.bitmap.width - width > 0
              ? (image.bitmap.width - width) / 2
              : 0,
            image.bitmap.height - height > 0
              ? (image.bitmap.height - height) / 2
              : 0,
            width,
            height
          )
          .write(`${dest_folder}/${file_name}_${timestamp}${file_ext}`);

        resolve(`${dest_folder}/${file_name}_${timestamp}${file_ext}`);
      });
    });
  }),

  addTextToImage: (addTextToImage = async ({
    imagePath,
    imageCaption = "Pass your text throught the param 'imageCaption'",
    textFont = Jimp.FONT_SANS_128_BLACK,
  }) => {
    if (!isValidPath(imagePath)) return;

    const file_ext = path.extname(imagePath);
    const file_name = imagePath.replace(/^.*[\\\/]/, "");

    const timestamp = Date.now();
    const dest_folder = "output";
    if (!fs.existsSync(dest_folder)) fs.mkdirSync(dest_folder);

    Jimp.read(`${imagePath}`)
      .then(async function (image) {
        const textImage = new Jimp(
          image.bitmap.width,
          image.bitmap.height,
          0x0,
          (err) => {
            //((0x0 = 0 = rgba(0, 0, 0, 0)) = transparent)
            if (err) throw err;
          }
        );
        const font = await Jimp.loadFont(textFont);
        textImage.print(
          font,
          0,
          0,
          {
            text: imageCaption,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
          },
          image.bitmap.width - properties.TEXT_WIDTH,
          image.bitmap.height
        );
        textImage.color([{ apply: "xor", params: ["#ffffff"] }]);
        Jimp.read("quote-template.png", (err, backgr) => {
          if (err) {
            console.log(err);
          } else {
            image
              .blit(backgr, 0, 0)
              .blit(textImage, properties.TEXT_WIDTH / 2, 0)
              .write(`${dest_folder}/${file_name}_${timestamp}.${file_ext}`);
          }
        });
      })
      .catch(function (err) {
        console.error(err);
      });
  }),
};

// cropImage({
//   imagePath: "Tiger_Looking_Ferocious.jpeg",
// });
// addTextToImage({
//   imagePath: "https://images.pexels.com/photos/136415/pexels-photo-136415.jpeg",
// });
