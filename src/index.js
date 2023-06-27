const fonts = require("./constants/fonts");
const { searchPhoto } = require("./unsplash");
const { getImageKeyWord } = require("./openai");
const { getRandomQuote } = require("./zenquotes");
const { sanitize } = require("./utility/string-utility");
const { insertQuote } = require("./database/mdb-quotes");
const { addTextToImage, adjustDimensionsAndRatio } = require("./jimp");
const { DriveService } = require("./g-drive/DriveService");
const { contructDriveUrl } = require("./utility/construct-drive-url");

(async () => {
  const fileId = "1HOJ7ufpDY7HK3zuQnIM0lGVmfwXkF0jh";

  const drive = new DriveService();
  await drive.authenticate();

  const ids = await drive.getAllIdsWithToken({
    query: "mimeType = 'application/vnd.google-apps.folder'",
  });

  // const ciao = await drive.shareFile({
  //   auth: drive.auth,
  //   fileId,
  // });

  // const ci = await drive.getPropsFromFile({
  //   fileId,
  // });

  // console.log(contructDriveUrl({ web_link: ci.webViewLink }));

  // await drive.revokeSharePermission({
  //   auth: drive.auth,
  //   fileId,
  //   permissionId: ciao,
  // });

  // console.log(ci);
  // const quote = await getRandomQuote();
  // const image_description = sanitize(await getImageKeyWord(quote.q));
  // // const image_description = "exploration";

  // const image = await searchPhoto({
  //   query: image_description,
  //   per_page: 20,
  // });

  // db_quote = getProperties({ quote, image, image_description });

  // const quoteId = await insertQuote(db_quote);

  // if (quoteId) {
  //   db_quote.id = quoteId;

  //   const cropped_image = await adjustDimensionsAndRatio({
  //     imagePath: db_quote.image.url,
  //   });

  //   const imageReady = await addTextToImage({
  //     imagePath: cropped_image,
  //     imageCaption: quote.q,
  //     textFont: fonts.HELVETICA_BOLD,
  //     authorName: quote.a,
  //     authorFont: fonts.HELVETICA_SMALL,
  //   });

  //   const drive = new DriveService();
  //   await drive.initialize();
  //   await drive.remainingSpace(true);
  //   await drive.uploadFile({
  //     fileName: imageReady,
  //     description: quote.q,
  //     file_props: { db_quote_id: quoteId },
  //   });
  // }
})();
