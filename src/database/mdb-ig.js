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

getTokenIfExists = async (db) => {
  const tokenFile = await getDocumentById(
    db,
    process.env.COLLECTION_TOKENS,
    process.env.DB_IG_TOKEN_ID
  );
  return tokenFile;
};

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

    const isTokenPresent = await getTokenIfExists(db);

    try {
      const insertedData = isTokenPresent
        ? await updateData(
            db,
            process.env.COLLECTION_TOKENS,
            process.env.DB_IG_TOKEN_ID,
            {
              token: encrypted_token,
              expiration_date,
            }
          )
        : await insertData(db, process.env.COLLECTION_TOKENS, {
            _id: new ObjectId(process.env.DB_IG_TOKEN_ID),
            token: encrypted_token,
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
    const tokenFile = await getTokenIfExists(db);

    if (tokenFile) {
      const token = decrypt(
        tokenFile.token,
        fromHexToBytes(process.env.ENC_SECRET_KEY)
      );

      tokenFile.token = token;

      return tokenFile;
    } else return null;
  },

  insertPost: async (postId, imageFileId, caption) => {
    const client = await createConnection();
    const db = await getDB(client, process.env.DB_NAME);

    try {
      const insertedData = await insertData(db, process.env.COLLECTION_POSTS, {
        postId,
        imageFileId,
        caption,
      });

      return insertedData;
    } finally {
      await closeConnection(client);
    }
  },
};
