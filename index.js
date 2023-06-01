const fonts = require("./constants/fonts");
const properties = require("./constants/properties");
const { downloadImage } = require("./images");
const { cropImage, addTextToImage } = require("./jimp");
const { textCompletion } = require("./openai");
const { getImage } = require("./pexel");
const { searchPhoto } = require("./unsplash");
const { getRandomQuote } = require("./zenquotes");

(async () => {
  // const pexel_image = await getImage("ferrari"); // from Pexel
  const unsplash_image = await searchPhoto("peace"); // from Unsplash
  // const downloaded_image_pexel = await downloadImage(
  //   pexel_image.src.large2x,
  //   pexel_image.alt
  // );
  const downloaded_image_unsplash = await downloadImage(
    unsplash_image.urls.regular,
    unsplash_image.description
      ? unsplash_image.description
      : unsplash_image.alt_description
  );
  const cropped_image = await cropImage({
    imagePath: downloaded_image_unsplash,
  });
  const quote = (await getRandomQuote()).q;
  await addTextToImage({
    imagePath: cropped_image ? cropped_image : downloaded_image_unsplash,
    imageCaption: quote,
    textFont: fonts.HELVETICA_BOLD,
  });
})();
