const fonts = require("./constants/fonts");
const properties = require("./constants/properties");
const { downloadImage } = require("./images");
const {
  cropImage,
  addTextToImage,
  adjustDimensionsAndRatio,
} = require("./jimp");
const { getImageKeyWord } = require("./openai");
const { getImage } = require("./pexel");
const { searchPhoto } = require("./unsplash");
const { cutString } = require("./utility/utility");
const { getRandomQuote } = require("./zenquotes");

(async () => {
  const quote = await getRandomQuote();
  // const image_description = await getImageKeyWord(quote.q);
  const image_description = "discipline";
  const unsplash_image = await searchPhoto(image_description); // from Unsplash

  const cropped_image = await adjustDimensionsAndRatio({
    imagePath: unsplash_image.urls.regular,
  });
  await addTextToImage({
    imagePath: cropped_image,
    imageCaption: quote.q,
    textFont: fonts.HELVETICA_BOLD,
    authorName: quote.a,
    authorFont: fonts.HELVETICA_SMALL,
  });
})();
