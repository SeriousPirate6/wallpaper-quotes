require("dotenv").config();
const {
  getDB,
  insertData,
  closeConnection,
  createConnection,
  getDocumentById,
} = require("./mdb-basics");

module.exports = {
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
