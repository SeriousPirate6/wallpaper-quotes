const fs = require("fs");
const Jimp = require("jimp");
const path = require("path");
const fonts = require("./constants/fonts");

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
  cropImage: (cropImage = async ({
    imagePath,
    width = 1080, // IG standards
    height = 1350,
  }) => {
    if (!isValidPath(imagePath)) return;

    Jimp.read(imagePath, function (err, image) {
      if (err) throw err;
      if (width > image.bitmap.width || height > image.bitmap.height) {
        console.warn("The image is smaller than the dimensions provided.");
        return;
      }
      const file_ext = path.extname(imagePath);
      const file_name = path.parse(imagePath).name;

      const timestamp = Date.now();
      const dest_folder = "resized";
      if (!fs.existsSync(dest_folder)) fs.mkdirSync(dest_folder);

      image
        .crop(
          (image.bitmap.width - width) / 2,
          (image.bitmap.height - height) / 2,
          width,
          height
        )
        .write(`${dest_folder}/${file_name}_${timestamp}${file_ext}`);

      return `${dest_folder}/${file_name}_${timestamp}${file_ext}`;
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
          image.bitmap.width,
          image.bitmap.height
        );
        textImage.color([{ apply: "xor", params: ["#ffffff"] }]);
        image
          .blit(textImage, 0, 0)
          .write(`${dest_folder}/${file_name}_${timestamp}.${file_ext}`);
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
