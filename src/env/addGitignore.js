const fs = require("fs");
const path = require("path");

module.exports = {
  addGitignore: ({ newContent }) => {
    const gitignorePath = path.join(__dirname, "../../.gitignore");

    try {
      const gitignore = fs.readFileSync(gitignorePath, "utf8");

      if (
        newContent
          .match(/[^\r\n]+/g)
          .every((element) => gitignore.match(/[^\r\n]+/g).includes(element))
      ) {
        console.log("File already present in .gitignore.");
        return;
      }

      const modifiedContent = gitignore + "\n\n" + newContent;
      try {
        fs.writeFileSync(gitignorePath, modifiedContent, "utf8");
      } catch (err) {
        console.error("Error writing .gitignore:", err);
      }
      console.log("Exception appended to .gitignore.");
    } catch (err) {
      console.error("Error reading .gitignore:", err);
    }
  },
};
