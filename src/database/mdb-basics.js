require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

module.exports = {
  createConnection: (createConnection = async () => {
    try {
      const client = new MongoClient(process.env.MONGODB_URI, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
      });
      await client.connect();

      await client.db().admin().command({ ping: 1 });
      console.log("Connected to MongoDB!\n");

      return client;
    } catch (e) {
      console.log(e);
    }
  }),

  closeConnection: (closeConnection = async (client) => {
    await client.close();
    console.log("Connection closed");
  }),

  getDB: (getDB = async (client, db_name) => {
    const databases = await client.db().admin().listDatabases();

    const databaseExists = databases.databases.some(
      (db) => db.name === db_name
    );

    if (databaseExists) return client.db(db_name);
    else console.log(`The database '${db_name}' does not exists.`);
  }),

  addCollection: (addCollection = async (db, collection_name) => {
    try {
      await db.createCollection(collection_name);
      console.log("Collection created successfully.");
    } catch (err) {
      console.error(err);
    }
  }),

  listAllCollections: (listAllCollections = async (db) => {
    try {
      const collections = [];
      const cursor = db.listCollections();

      await cursor.forEach((collection) => {
        collections.push(collection.name);
      });

      return collections;
    } catch (err) {
      console.error(err);
    }
  }),

  insertData: (insertData = async (db, cl, data) => {
    try {
      const collection = db.collection(cl);

      data.timestamp = new Date();

      const result = Array.isArray(data)
        ? await collection.insertMany(data)
        : await collection.insertOne(data);

      const insertedData = Array.isArray(data)
        ? result.insertedIds.map((e) => String(e))
        : String(result.insertedId);

      console.log("Data inserted successfully:", insertedData);
      return insertedData;
    } catch (err) {
      if (err.code === 11000) {
        console.error("Unique key constraint violation:", err.message);
      } else {
        console.error("Error occurred while inserting data:", err);
      }
    }
  }),

  getDocumentById: async (db, cl, id) => {
    try {
      const collection = db.collection(cl);

      const query = { _id: new ObjectId(id) };
      const document = await collection.findOne(query);

      if (document) {
        console.log("Found document:", document);
        return document;
      } else {
        console.log("Document not found");
      }
    } catch (err) {
      console.log("Error occured while extracting record:", err);
    }
  },

  listRecordForAttribute: async (db, cl, { attribName, attribValue }) => {
    try {
      const query = { [attribName]: attribValue };

      const collection = db.collection(cl);

      const document = await collection.find(query).toArray();

      console.log("Documents:", document);

      return document;
    } catch (e) {
      console.log(e);
    }
  },
};
