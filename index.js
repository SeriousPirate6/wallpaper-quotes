const fonts = require("./constants/fonts");
const properties = require("./constants/properties");
const { addTextToImage, adjustDimensionsAndRatio } = require("./jimp");
const { getImageKeyWord } = require("./openai");
const { getImage } = require("./pexel");
const { searchPhoto } = require("./unsplash");
const { getRandomQuote } = require("./zenquotes");

(async () => {
  const quote = await getRandomQuote();
  // const image_description = await getImageKeyWord(quote.q);
  const image_description = "peace";
  const unsplash_image = await searchPhoto({
    query: image_description,
    per_page: 20,
  }); // from Unsplash

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
