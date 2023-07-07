const fs = require("fs");
require("dotenv").config();
const { ObjectId } = require("mongodb");
const { readJSON } = require("../utility/jsonUtils");
const { encrypt, decrypt, fromHexToBytes } = require("../utility/stringUtils");
const {
  getDB,
  insertData,
  closeConnection,
  createConnection,
  getDocumentById,
} = require("./mdb-basics");

module.exports = {
  encryptAndInsertCreds: async (driveLocation) => {
    if (!fs.existsSync(driveLocation)) {
      console.log("The file provided does not exists.");
      return;
    }

    const client = await createConnection();
    const db = await getDB(client, process.env.DB_NAME);

    const driveCreds = JSON.stringify(readJSON(driveLocation));

    const encrypted_creds = encrypt(
      driveCreds,
      fromHexToBytes(process.env.ENC_SECRET_KEY)
    );

    try {
      const insertedData = await insertData(db, process.env.COLLECTION_TOKENS, {
        _id: new ObjectId(process.env.DB_DRIVE_CREDS_ID),
        token: encrypted_creds,
      });

      return { insertedData, encrypted_creds };
    } finally {
      await closeConnection(client);
    }
  },

  decryptAndGetCreds: async () => {
    const client = await createConnection();
    const db = await getDB(client, process.env.DB_NAME);
    const credsFile = await getDocumentById(
      db,
      process.env.COLLECTION_TOKENS,
      process.env.DB_DRIVE_CREDS_ID
    );

    if (credsFile) {
      const token = decrypt(
        credsFile.token,
        fromHexToBytes(process.env.ENC_SECRET_KEY)
      );

      credsFile.token = JSON.parse(token);

      return credsFile;
    } else return null;
  },
};
