const fs = require("fs");
const { addGitignore } = require("./addGitignore");
const { constructJsonVars } = require("./getEnvVars");

module.exports = {
  exportEnvVars: () => {
    const jsonData = constructJsonVars();
    if (!jsonData) return;

    const destFolder = "render";

    if (!fs.existsSync(destFolder)) {
      fs.mkdirSync(destFolder, { recursive: true });
    }

    try {
      fs.writeFileSync(`./${destFolder}/env.json`, jsonData);
      console.log("JSON file written successfully.");
      addGitignore({
        newContent: `# render env backup file\n${destFolder}/env.json`,
      });
    } catch (error) {
      console.error("Error writing JSON file:", error);
    }
  },
};
