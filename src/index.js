const express = require("express");
const bodyParser = require("body-parser");
const { searchPhoto } = require("./unsplash");
const { getImageKeyWord } = require("./openai");
const { getRandomQuote } = require("./zenquotes");
const driveUpload = require("./wrappers/driveUpload");
const {
  sanitize,
  encrypt,
  decrypt,
  getRandomBytes: getRandomKey,
  fromHexToBytes,
} = require("./utility/stringUtils");
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

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/test", async (req, res) => {
  const ciao = await encryptAndInsertToken("asd");
  console.log(ciao);
  res.send(ciao);
});

app.get("/getAuthentication", async ({ res }) => {
  const code = req.query.code;
  if (code) {
    const accessToken = await getLongLiveAccessToken(code);
    if (accessToken) {
      await encryptAndInsertToken(accessToken);
      res.send({ accessToken });
    } else res.send("Unable to generate access token. Invalid code provided.");
  } else res.status(400, "The param 'code' is mandatory");
});

app.get("/generateQuoteImage", async (req, res) => {
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

    const image = await generateImage(db_quote);

    await driveUpload({ image, db_quote });
  }
});

app.post("/postQuoteImage", async (req, res) => {
  const drive = await new DriveService().authenticate();
  const sharedId = await drive.shareFile({
    fileId,
  });

  // more of it another time
});

(async () => {
  await decryptAndGetToken();
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
