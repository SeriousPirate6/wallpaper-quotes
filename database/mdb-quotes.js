const {
  createConnection,
  getDB,
  insertData,
  closeConnection,
  listRecordForAttribute,
} = require("./mdb-basics");
const { Quote } = require("../classes/Quote");

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
      process.env.COLLECTION_NAME,
      {
        attribName,
        attribValue,
      }
    );

    if (duplicate.length === 0) return true;
  }),

  insertQuote: (insertQuote = async (quote) => {
    if (!quote instanceof Quote) {
      console.log("The data object must be of type 'Quote'.");
      return;
    }

    const client = await createConnection();
    const db = await getDB(client, process.env.DB_NAME);

    try {
      if (
        await isUniqueAttribute({
          db,
          attribName: "text",
          attribValue: quote.text,
        })
      ) {
        await insertData(db, process.env.COLLECTION_NAME, quote);
        return true;
      } else console.log("Quote already generated.");
    } finally {
      await closeConnection(client);
    }
  }),
};
