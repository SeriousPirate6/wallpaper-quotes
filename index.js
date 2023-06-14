const fonts = require("./constants/fonts");
const { Quote } = require("./classes/Quote");
const { searchPhoto } = require("./unsplash");
const { getImageKeyWord } = require("./openai");
const { getRandomQuote } = require("./zenquotes");
const { insertQuote } = require("./database/mdb-quotes");
const { getAuthorImage } = require("./utility/get-author-image");
const { addTextToImage, adjustDimensionsAndRatio } = require("./jimp");

(async () => {
  const quote = await getRandomQuote();
  const image_description = await getImageKeyWord(quote.q);
  // const image_description = "exploration";

  const unsplash_image = (
    await searchPhoto({
      query: image_description,
      per_page: 20,
    })
  ).urls.regular;

  const isNewQuote = await insertQuote(
    new Quote({
      text: quote.q,
      author: quote.a,
      author_image: getAuthorImage(quote.a),
      back_image: unsplash_image,
    })
  );

  if (isNewQuote) {
    const cropped_image = await adjustDimensionsAndRatio({
      imagePath: unsplash_image,
    });

    await addTextToImage({
      imagePath: cropped_image,
      imageCaption: quote.q,
      textFont: fonts.HELVETICA_BOLD,
      authorName: quote.a,
      authorFont: fonts.HELVETICA_SMALL,
    });
  }
})();
