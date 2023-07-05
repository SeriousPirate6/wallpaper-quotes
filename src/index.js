require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { searchPhoto } = require("./unsplash");
const { getImageKeyWord } = require("./openai");
const { getRandomQuote } = require("./zenquotes");
const properties = require("./constants/properties");
const { sanitize } = require("./utility/stringUtils");
const { createImagePost } = require("./ig-graph/post");
const { insertQuote, getQuoteById } = require("./database/mdb-quotes");
const { DriveService } = require("./g-drive/DriveService");
const { getProperties } = require("./utility/getProperties");
const { generateImage } = require("./wrappers/generateImage");
const { quoteDriveUpload } = require("./wrappers/driveUpload");
const { requireAuth } = require("./ig-graph/login/getAuthWindow");
const { contructDriveUrl } = require("./utility/constructDriveUrl");
const { getLongLiveAccessToken } = require("./ig-graph/login/getAccessToken");
const {
  encryptAndInsertToken,
  decryptAndGetToken,
  insertPost,
} = require("./database/mdb-ig");
const { deleteFile } = require("./utility/images");

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

      const image_id = await quoteDriveUpload({
        image,
        db_quote,
      });

      deleteFile(image);
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
  const drive = new DriveService();
  await drive.authenticate();

  const imageFile = (
    await drive.getAllIdsWithToken({
      query: `${properties.QUERY_IN_PARENT(
        process.env.DRIVE_NEWQUOTES_FOLDER
      )} and ${properties.QUERY_NON_FOLDERS}`,
      fields: "files(id, name, webViewLink, properties(db_quote_id))",
    })
  )[0];

  const quoteProps = await getQuoteById({
    quoteId: imageFile?.properties?.db_quote_id,
  });

  if (imageFile) {
    try {
      const permissionId = await drive.shareFile({
        fileId: imageFile.id,
      });

      const access_token = (await decryptAndGetToken()).token;

      const image_url = contructDriveUrl({ web_link: imageFile.webViewLink });

      const description = quoteProps?.image?.keyword
        ? `${quoteProps?.image?.keyword}.`
        : "Daily random quote.";

      const image_credits = quoteProps?.image.user?.ig_username
        ? `\nImage credits: @${quoteProps?.image.user?.ig_username}\n-`
        : "";

      // TODO extracting tags dinamically
      const tags = `#motivationalquotes #motivational #motivationalquote #MotivationalSpeaker #motivationalmonday #motivationalwords #motivationalpost #motivationalfitness #motivationalquoteoftheday #motivationalspeakers #motivationalmondays #motivationalquotesoftheday #motivationalspeaking #motivationalvideo #motivationalcoach #motivationalqoutes #MotivationalPage #motivationalspeech #motivationalposts #MotivationalPic #motivationalmoments #motivationalquotesandsayings #MotivationalQuotesDaily #motivationalhustler #MotivationalMusic #MotivationalMoment #motivationalmoments500 #motivationalthoughts #motivationalposter #motivationalaccount`;

      const caption = `-\n-\n${description}\n-${image_credits}\n${tags}`;
      const postId = await createImagePost({
        access_token,
        image_url,
        caption,
      });

      await insertPost(postId, imageFile.id, caption);

      await drive.revokeSharePermission({ fileId: imageFile.id, permissionId });
      await drive.updateFileParent({
        fileId: imageFile.id,
        newParentId: process.env.DRIVE_ARCHIVE_FOLDER,
      });

      res.send({
        status: "success",
        message: "Image posted successfully",
        image: {
          id: imageFile.id,
          url: imageFile.webViewLink,
        },
      });
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

app.listen(port, () => {
  console.log(`Running on port: ${port}`);
});
