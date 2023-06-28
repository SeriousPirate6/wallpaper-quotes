require("dotenv").config();
const { ObjectId } = require("mongodb");
const { encrypt, decrypt, fromHexToBytes } = require("../utility/stringUtils");
const {
  getDB,
  insertData,
  closeConnection,
  createConnection,
  getDocumentById,
} = require("./mdb-basics");

module.exports = {
  encryptAndInsertToken: async (token) => {
    const client = await createConnection();
    const db = await getDB(client, process.env.DB_NAME);

    const expiration_date = new Date();
    expiration_date.setDate(expiration_date.getDate() + 59);

    const encrypted_token = encrypt(
      token,
      fromHexToBytes(process.env.ENC_SECRET_KEY)
    );

    try {
      const insertedData = await insertData(db, process.env.COLLECTION_TOKENS, {
        _id: new ObjectId(process.env.DB_IG_TOKEN_ID),
        token: encrypted_token.encryptedText,
        expiration_date,
      });

      return { insertedData, encrypted_token };
    } finally {
      await closeConnection(client);
    }
  },

  decryptAndGetToken: async () => {
    const client = await createConnection();
    const db = await getDB(client, process.env.DB_NAME);
    const tokenFile = await getDocumentById(
      db,
      process.env.COLLECTION_TOKENS,
      process.env.DB_IG_TOKEN_ID
    );

    if (tokenFile) {
      const encryptedData = {
        encryptedText: tokenFile.token,
        iv: process.env.ENC_IV,
      };

      const token = decrypt(
        encryptedData,
        fromHexToBytes(process.env.ENC_SECRET_KEY)
      );

      tokenFile.token = token;

      return tokenFile;
    } else return null;
  },
};
