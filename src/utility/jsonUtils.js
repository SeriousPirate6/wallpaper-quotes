const fs = require("fs");
const path = require("path");
require("dotenv").config();
const getDirName = require("path").dirname;

module.exports = {
  isJSON: (isJSON = (string) => {
    try {
      JSON.parse(string);
    } catch (e) {
      return false;
    }
    return true;
  }),

  readJSON: (filePath) => {
    try {
      const fileContent = fs.readFileSync(filePath, "utf8");
      return JSON.parse(fileContent);
    } catch (error) {
      console.error("Error reading JSON file:", error);
    }
  },

  writeJSON: (jsonFile, filePath) => {
    if (fs.existsSync(filePath)) {
      if (isJSON(fs.readFileSync(filePath))) {
        if (
          JSON.stringify(JSON.parse(fs.readFileSync(filePath))) ===
          JSON.stringify(jsonFile)
        ) {
          return;
        }
      }
    }
    fs.mkdirSync(getDirName(filePath), { recursive: true });
    console.log(`\nWriting new JSON file: ${path.basename(filePath)}...\n`);
    fs.writeFileSync(filePath, JSON.stringify(jsonFile, null, 2));
  },
};
