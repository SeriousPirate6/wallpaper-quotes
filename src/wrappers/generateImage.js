const fonts = require("../constants/fonts");
const { adjustDimensionsAndRatio, addTextToImage } = require("../jimp");

module.exports = {
  generateImage: async ({ db_quote }) => {
    const cropped_image = await adjustDimensionsAndRatio({
      imagePath: db_quote.image.url,
    });

    const imageReady = await addTextToImage({
      imagePath: cropped_image,
      imageCaption: db_quote.phrase,
      textFont: fonts.HELVETICA_BOLD,
      authorName: db_quote.author.name,
      authorFont: fonts.HELVETICA_SMALL,
    });

    return imageReady;
  },
};
