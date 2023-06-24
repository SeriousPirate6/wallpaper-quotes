const fonts = require("./constants/fonts");
const { User } = require("./classes/user");
const { Quote } = require("./classes/quote");
const { Image } = require("./classes/Image");
const { searchPhoto } = require("./unsplash");
const { Author } = require("./classes/author");
const { getImageKeyWord } = require("./openai");
const { getRandomQuote } = require("./zenquotes");
const { sanitize } = require("./utility/string-utility");
const { insertQuote } = require("./database/mdb-quotes");
const { getAuthorImage } = require("./utility/get-author-image");
const { addTextToImage, adjustDimensionsAndRatio } = require("./jimp");
const { DriveService } = require("./g-drive/g-drive");

(async () => {
  const quote = await getRandomQuote();
  const image_description = sanitize(await getImageKeyWord(quote.q));
  // const image_description = "exploration";

  const unsplash_image = await searchPhoto({
    query: image_description,
    per_page: 20,
  });

  const db_quote = new Quote({
    phrase: quote.q,
    author: new Author({
      name: quote.a,
      image: getAuthorImage(quote.a),
    }),
    image: new Image({
      id: unsplash_image.id,
      createdTime: unsplash_image.created_at,
      url: unsplash_image.urls.regular,
      keyword: image_description,
      user: new User({
        id: unsplash_image.user.id,
        profile_image: unsplash_image.user.profile_image.large,
        ig_username: unsplash_image.user.instagram_username,
      }),
      tags: unsplash_image.tags.map((e) => e.title),
    }),
  });

  const quoteId = await insertQuote(db_quote);

  if (quoteId) {
    db_quote.id = quoteId;

    const cropped_image = await adjustDimensionsAndRatio({
      imagePath: db_quote.image.url,
    });

    const imageReady = await addTextToImage({
      imagePath: cropped_image,
      imageCaption: quote.q,
      textFont: fonts.HELVETICA_BOLD,
      authorName: quote.a,
      authorFont: fonts.HELVETICA_SMALL,
    });

    const drive = new DriveService();
    await drive.initialize();
    await drive.remainingSpace(true);
    await drive.uploadFile({
      fileName: imageReady,
      description: quote.q,
      file_props: { db_quote_id: quoteId },
    });
  }
})();
