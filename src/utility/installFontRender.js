const { getOS } = require("./getOS");
const { execSync } = require("child_process");

module.exports = {
  installFontRender: (fontPath) => {
    const platform = getOS();

    if (platform === "linux") {
      try {
        execSync(`fc-cache -f -v ${fontPath}`);
        console.log("Font installed successfully.");
      } catch (error) {
        console.error("Error installing font:", error);
      }
    }
  },
};
