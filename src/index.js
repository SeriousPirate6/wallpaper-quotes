const express = require("express");
const bodyParser = require("body-parser");
const { searchPhoto } = require("./unsplash");
const { getImageKeyWord } = require("./openai");
const { getRandomQuote } = require("./zenquotes");
const { quoteDriveUpload: driveUpload } = require("./wrappers/driveUpload");
const { sanitize } = require("./utility/stringUtils");
const { insertQuote } = require("./database/mdb-quotes");
const { DriveService } = require("./g-drive/DriveService");
const { getProperties } = require("./utility/getProperties");
const { contructDriveUrl } = require("./utility/constructDriveUrl");
const { generateImage } = require("./wrappers/generateImage");
const { requireAuth } = require("./ig-graph/login/getAuthWindow");
const { getLongLiveAccessToken } = require("./ig-graph/login/getAccessToken");
const {
  encryptAndInsertToken,
  decryptAndGetToken,
} = require("./database/mdb-ig");
const { createImagePost } = require("./ig-graph/post");
const properties = require("./constants/properties");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/requireAuthWindow", async ({ res }) => {
  const auth_url = requireAuth();
  res.send({ auth_url });
});

app.get("/getAuthentication", async (req, res) => {
  const code = req.query.code;
  if (code) {
    const accessToken = await getLongLiveAccessToken(code);
    if (accessToken) {
      const encryptedToken = await encryptAndInsertToken(accessToken);
      res.send({ accessToken: encryptedToken });
    } else res.send("Unable to generate access token. Invalid code provided.");
  } else res.status(400, "The param 'code' is mandatory");
});

app.get("/generateQuoteImage", async ({ res }) => {
  try {
    const quote = await getRandomQuote();
    const image_description = sanitize(await getImageKeyWord(quote.q));

    const image = await searchPhoto({
      query: image_description,
      per_page: 20,
    });

    db_quote = getProperties({ quote, image, image_description });
    const quoteId = await insertQuote(db_quote);

    if (quoteId) {
      db_quote.id = quoteId;

      const image = await generateImage({ db_quote });

      const image_id = await driveUpload({
        image,
        db_quote,
      });
      res.send({
        status: "success",
        message: "Image generated and uploaded correctly.",
        image: {
          id: image_id,
        },
      });
    } else {
      res.status(500).send({
        status: "failed",
        message: "The image could not be uploaded.",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "failed",
      message: "The method is not available right now.",
    });
  }
});

app.get("/getQuoteAndPostIt", async ({ res }) => {
  // get a fileId from the "NewQuotes" folder
  // use that id to generate the post
  // update the parent folder of that id to the "Archive" folder
  const drive = new DriveService();
  await drive.authenticate();

  const imageFile = (
    await drive.getAllIdsWithToken({
      query: `${properties.QUERY_IN_PARENT(
        process.env.DRIVE_NEWQUOTES_FOLDER
      )} and ${properties.QUERY_NON_FOLDERS}`,
      fields: "files(id, name, webViewLink)",
    })
  )[0];

  if (imageFile) {
    try {
      const permissionId = await drive.shareFile({
        fileId: imageFile.id,
      });

      const access_token = (await decryptAndGetToken()).token;

      const image_url = contructDriveUrl({ web_link: imageFile.webViewLink });

      const postId = await createImagePost({
        access_token,
        image_url,
        caption: "Daily random quote.",
      });

      // adding id to a post collection in mongo

      await drive.revokeSharePermission({ fileId, permissionId });
    } catch (err) {
      console.log(err);
      res.status(500).send({
        status: "failed",
        message: "Something goes wrong with posting the image.",
      });
    }
  } else {
    res.status(204).send({
      status: "no content",
      message: "No images found to be posted.",
    });
  }
});

(async () => {
  // const cc = new DriveService();
  // await cc.authenticate();
  // await cc.getAllIdsWithToken({
  //   query: properties.QUERY_IN_PARENT(process.env.DRIVE_NEWQUOTES_FOLDER),
  // });
  // const ciao = await cc.nameToFileId({
  //   fileName:
  //     "output/photo_1479064312651_1688035006239.jpeg_1688035006455..jpeg",
  // });
  // await cc.updateFileParent({
  //   fileId: ciao.id,
  //   newParentId: process.env.DRIVE_DEFAULT_FOLDER,
  // });
  // console.log(requireAuth());
  // const fileId = "1HOJ7ufpDY7HK3zuQnIM0lGVmfwXkF0jh";
  // const text = "baubau";
  // const secretKey = getRandomKey(32);
  // const asd = encrypt(text, secretKey);
  // console.log(asd);
  // const ciao = decrypt(asd, secretKey);
  // console.log(ciao);
  // console.log(requireAuth());
  // const drive = new DriveService().authenticate();
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
})();

app.listen(port, () => {
  console.log(`Running on port: ${port}`);
});
