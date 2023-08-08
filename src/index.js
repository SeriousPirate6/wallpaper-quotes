require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { searchVideo } = require("./pexel");
const { searchPhoto } = require("./unsplash");
const rateLimit = require("express-rate-limit");
const { getImageKeyWord } = require("./openai");
const { getRandomQuote } = require("./zenquotes");
const { deleteFile } = require("./utility/media");
const properties = require("./constants/properties");
const { sanitize } = require("./utility/stringUtils");
const { exportEnvVars } = require("./env/exportEnvVars");
const { DriveService } = require("./g-drive/DriveService");
const { getProperties } = require("./utility/getProperties");
const { generateImage } = require("./wrappers/generateImage");
const { generateVideo } = require("./wrappers/generateVideo");
const { quoteDriveUpload } = require("./wrappers/driveUpload");
const { checkDriveCreds } = require("./wrappers/checkDriveCreds");
const { requireAuth } = require("./ig-graph/login/getAuthWindow");
const { howMuchTillTheNextPost } = require("./ig-graph/getMedia");
const { contructDriveUrl } = require("./utility/constructDriveUrl");
const { pushEnvVarsToRender } = require("./env/pushEnvVarsToRender");
const { insertQuote, getQuoteById } = require("./database/mdb-quotes");
const { getLongLiveAccessToken } = require("./ig-graph/login/getAccessToken");
const {
  createImagePost,
  getPostedLast24h,
  createStoryPost,
  createReelPost,
} = require("./ig-graph/post");
const {
  encryptAndInsertToken,
  decryptAndGetToken,
  insertPost,
} = require("./database/mdb-ig");
const { driveGetFilesOrFolders } = require("./wrappers/driveGetFilesOrFolders");

const port = 3000;
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set("trust proxy", ["loopback", "linklocal", "uniquelocal"]);
app.set("trust proxy", 0);

const defaultRateLimiter = rateLimit({
  windowMs: 3 * 60 * 1000, // amount of time
  max: 1, // number of requests
  message: {
    status: "not available",
    message: "Too many requests, please try again later.",
  },
  skip: (req) => false,
});

(async () => {
  // await driveGetFilesOrFolders(["Reels"]);
})();

app.get("/ping", async ({ res }) => {
  res.send({ staus: "success", message: "Service online." });
});

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

app.get("/generateQuoteImage", defaultRateLimiter, async (req, res) => {
  const is_reel = req.query.type === properties.REEL ? true : false;

  await checkDriveCreds();

  try {
    const quote = await getRandomQuote();
    const media_description = sanitize(await getImageKeyWord(quote.q));

    const media = !is_reel
      ? await searchPhoto({
          query: media_description,
          per_page: 20,
        })
      : await searchVideo({ query: media_description });

    db_quote = getProperties({
      quote,
      image: !is_reel ? media : null,
      video: is_reel ? media : null,
      media_description,
    });
    const quoteId = await insertQuote(db_quote);

    if (quoteId) {
      db_quote.id = quoteId;

      const media = !is_reel
        ? await generateImage({ db_quote })
        : await generateVideo({ db_quote });

      const image_id = await quoteDriveUpload({
        media,
        db_quote,
        type: is_reel ? properties.REEL : null,
      });

      deleteFile(media);
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

app.get("/getQuoteAndPostIt", defaultRateLimiter, async (req, res) => {
  const is_reel = req.query.type === properties.REEL ? true : false;

  const access_token = (await decryptAndGetToken()).token;
  const posts_number = await getPostedLast24h({ access_token });

  if (posts_number > properties.MAX_POSTS_PER_DAY) {
    console.log(`Already reached the maximum quota of posts per day.`);

    const wait_till_next_post = await howMuchTillTheNextPost({
      access_token,
    });

    res.status(403).send({
      status: "not allowed",
      message: `Already reached the maximum posts quota per day`,
      max_quote: posts_number,
      wait_till_next_post,
    });
  } else {
    await checkDriveCreds();

    const drive = new DriveService();
    await drive.authenticate();

    const mediaFile = (
      await drive.getAllIdsWithToken({
        query: `${properties.QUERY_IN_PARENT(
          !is_reel
            ? process.env.DRIVE_NEWQUOTES_FOLDER
            : process.env.DRIVE_NEWQUOTES_VIDEO_FOLDER
        )} and ${properties.QUERY_NON_FOLDERS}`,
        fields: "files(id, name, webViewLink, properties(db_quote_id))",
        orderBy: "createdTime asc",
      })
    )[0];

    const quoteProps = await getQuoteById({
      quoteId: mediaFile?.properties?.db_quote_id,
    });

    if (mediaFile) {
      try {
        const permissionId = await drive.shareFile({
          fileId: mediaFile.id,
        });

        const media_url = await contructDriveUrl({
          web_link: mediaFile.webViewLink,
        });

        const description = quoteProps?.image?.keyword
          ? `${quoteProps?.image?.keyword}.`
          : "Daily random quote.";

        const image_credits = quoteProps?.image?.user?.ig_username
          ? `\nImage credits: @${quoteProps?.image.user?.ig_username}\n-`
          : "";

        // TODO extracting tags dinamically
        const tags = `#motivationalquotes #motivational #motivationalquote #MotivationalSpeaker #motivationalmonday #motivationalwords #motivationalpost #motivationalfitness #motivationalquoteoftheday #motivationalspeakers #motivationalmondays #motivationalquotesoftheday #motivationalspeaking #motivationalvideo #motivationalcoach #motivationalqoutes #MotivationalPage #motivationalspeech #motivationalposts #MotivationalPic #motivationalmoments #motivationalquotesandsayings #MotivationalQuotesDaily #motivationalhustler #MotivationalMusic #MotivationalMoment #motivationalmoments500 #motivationalthoughts #motivationalposter #motivationalaccount`;

        const caption = `-\n-\n${description}\n-${image_credits}\n${tags}`;
        const postId = !is_reel
          ? await createImagePost({
              access_token,
              media_url,
              caption,
            })
          : await createReelPost({
              access_token,
              media_url,
              caption,
            });

        await createStoryPost({
          access_token,
          story_url: media_url,
          is_reel,
        });

        await insertPost(postId, mediaFile.id, caption);

        await drive.revokeSharePermission({
          fileId: mediaFile.id,
          permissionId,
        });
        await drive.updateFileParent({
          fileId: mediaFile.id,
          newParentId: !is_reel
            ? process.env.DRIVE_ARCHIVE_FOLDER
            : process.env.DRIVE_ARCHIVE_VIDEO_FOLDER,
        });

        res.send({
          status: "success",
          message: "Image posted successfully",
          image: {
            id: mediaFile.id,
            url: mediaFile.webViewLink,
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
  }
});

app.patch("/pushEnvVarsToRender", async ({ res }) => {
  try {
    exportEnvVars();
    await pushEnvVarsToRender();
    res.send({
      status: "success",
      message: "Renders Env Vars updated successfully.",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "failed",
      message: "Something goes wrong, could not perform the request.",
    });
  }
});

app.listen(port, () => {
  console.log(`Running on port: ${port}`);
});
