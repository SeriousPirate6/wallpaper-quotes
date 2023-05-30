const Jimp = require("jimp");
const fs = require("fs");
const fonts = require("./constants/fonts");

const source_folder = "test_images";
const fileName = "goku";
const extension = "png";
const imageCaption = "Be willing to be a beginner every single morning";
const font_location = fonts.PLUS_JAKARTA_SANS;

const dest_folder = "edited";
const new_name = Date.now();

if (!fs.existsSync(dest_folder)) {
  fs.mkdirSync(dest_folder);
}

Jimp.read(`${source_folder}/${fileName}.${extension}`)
  .then(function (image) {
    const textImage = new Jimp(
      image.bitmap.width,
      image.bitmap.height,
      0x0,
      (err) => {
        //((0x0 = 0 = rgba(0, 0, 0, 0)) = transparent)
        if (err) throw err;
      }
    );
    return Jimp.loadFont(font_location).then((font) => {
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
        .write(`${dest_folder}/${new_name}.${extension}`);
    });
  })
  .catch(function (err) {
    console.error(err);
  });
