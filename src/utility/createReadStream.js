const fs = require("fs");

module.exports = {
  createReadStream: async (fileName) => {
    return new Promise((resolve, reject) => {
      try {
        resolve(fs.createReadStream(fileName));
      } catch (err) {
        reject(err);
      }
    });
  },
};
