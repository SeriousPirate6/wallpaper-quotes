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

    const keys = arr_env.match(/^[A-Za-z0-9_]+/gm);
    const values = arr_env
      .match(/=\s*([^#\r\n]*)/g)
      .map((match) => match.replace(/^=\s*/, "").trim());

    const map = new Map();
    keys.forEach((e, index) => map.set(e, values[index]));

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
