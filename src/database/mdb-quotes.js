const {
  createConnection,
  getDB,
  insertData,
  closeConnection,
  listRecordForAttribute,
  getDocumentById,
} = require("./mdb-basics");
const { ObjectId } = require("mongodb");
const { Quote } = require("../classes/quote");

module.exports = {
  isUniqueAttribute: (isUniqueAttribute = async ({
    db,
    attribName,
    attribValue,
  }) => {
    const attributes = Object.keys(new Quote());
    if (!attributes.find((e) => e === attribName)) {
      console.log(
        `The attributes ${attribName} does not exists in class 'Quote'.`
      );
      return;
    }

    const duplicate = await listRecordForAttribute(
      db,
      process.env.COLLECTION_QUOTES,
      {
        attribName,
        attribValue,
      }
    );

    if (duplicate.length === 0) return true;
  }),

  insertQuote: (insertQuote = async (quote) => {
    if (!quote instanceof Quote) {
      console.log("The data object must be of type 'quote'.");
      return;
    }

    const client = await createConnection();
    const db = await getDB(client, process.env.DB_NAME);

    try {
      if (
        await isUniqueAttribute({
          db,
          attribName: "phrase",
          attribValue: quote.phrase,
        })
      ) {
        const insertedData = await insertData(
          db,
          process.env.COLLECTION_QUOTES,
          quote
        );
        return insertedData;
      } else console.log("Quote already generated.");
    } finally {
      await closeConnection(client);
    }
  }),

  getQuoteById: async ({ quoteId }) => {
    const client = await createConnection();
    const db = await getDB(client, process.env.DB_NAME);

    try {
      const quote = await getDocumentById(
        db,
        process.env.COLLECTION_QUOTES,
        quoteId
      );
      return quote;
    } finally {
      await closeConnection(client);
    }
  },

  deleteQuote: async ({ quoteId }) => {
    const client = await createConnection();
    const db = await getDB(client, process.env.DB_NAME);
    const collection = db.collection(process.env.COLLECTION_QUOTES);

    try {
      const result = await collection.deleteOne({
        _id: new ObjectId(quoteId),
      });

      if (result.deletedCount === 1) {
        console.log("Record deleted successfully");
      } else {
        console.log("Record not found");
      }
    } catch (error) {
      console.error("Error deleting record:", error);
    } finally {
      await closeConnection(client);
    }
  },
};
