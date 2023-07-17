const os = require("os");

module.exports = {
  getOS: (getOS = (log) => {
    const platform = os.platform();
    if (log) console.log("\nOperating System:", platform, "\n");
    return platform;
  }),

  isLinuxOs: () => {
    return getOS(true) === "linux";
  },
};
