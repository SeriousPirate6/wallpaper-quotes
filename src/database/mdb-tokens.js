require("dotenv").config();
const { ObjectId } = require("mongodb");
const { encrypt, decrypt, fromHexToBytes } = require("../utility/stringUtils");
const {
  getDB,
  insertData,
  closeConnection,
  createConnection,
  getDocumentById,
  updateData,
} = require("./mdb-basics");
const { isJSON } = require("../utility/jsonUtils");

getTokenIfExists = async ({ db, objectId }) => {
  if (typeof objectId !== "string" || objectId.length !== 24) return false;

  const tokenFile = await getDocumentById(
    db,
    process.env.COLLECTION_TOKENS,
    objectId
  );
  return tokenFile;
};

module.exports = {
  encryptAndInsertToken: async ({ token, objectId }) => {
    const client = await createConnection();
    const db = await getDB(client, process.env.DB_NAME);

    const expiration_date = new Date();
    expiration_date.setDate(expiration_date.getDate() + 1);

    const encrypted_token = encrypt(
      token,
      fromHexToBytes(process.env.ENC_SECRET_KEY)
    );

    const isTokenPresent = await getTokenIfExists({ db, objectId });

    try {
      const insertedData = isTokenPresent
        ? await updateData(db, process.env.COLLECTION_TOKENS, objectId, {
            token: encrypted_token,
            expiration_date,
          })
        : await insertData(db, process.env.COLLECTION_TOKENS, {
            token: encrypted_token,
            expiration_date,
          });

      return { insertedData, encrypted_token };
    } finally {
      await closeConnection(client);
    }
  },

  decryptAndGetToken: async ({ objectId }) => {
    const client = await createConnection();
    const db = await getDB(client, process.env.DB_NAME);
    const tokenFile = await getTokenIfExists({ db, objectId });

    if (tokenFile) {
      const token = decrypt(
        tokenFile.token,
        fromHexToBytes(process.env.ENC_SECRET_KEY)
      );

      tokenFile.token = isJSON(token) ? JSON.parse(token) : token;

      return tokenFile;
    } else return null;
  },
};
