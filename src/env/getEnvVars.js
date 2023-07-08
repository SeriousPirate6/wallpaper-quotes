const { default: axios } = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  getEnvVars: (getEnvVars = () => {
    const envFileLocation = path.join(__dirname, "../../.env");

    if (!fs.existsSync(envFileLocation)) {
      console.log("File .env not found in working directory.");
      return;
    }

    const arr_env = fs.readFileSync(envFileLocation, "utf-8");

    const lines = arr_env.match(/^(?!#)(.*=.+)$/gm);
    const map = new Map();

    lines.forEach((e) => {
      const index = e.indexOf("=");
      map.set(
        e.substring(0, index).trim(),
        e
          .substring(index + 1)
          .split("#")[0]
          .trim()
      );
    });

    return map;
  }),

  constructJsonVars: () => {
    const render_vars = [];

    const envVarsMap = getEnvVars();
    if (!envVarsMap) return;

    envVarsMap.forEach((value, key) => {
      render_vars.push({ key, value });
    });

    return JSON.stringify(render_vars, null, 2);
  },
};
