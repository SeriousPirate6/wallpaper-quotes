const { writeJSON } = require("../utility/jsonUtils");
const { decryptAndGetCreds } = require("../database/mdb-drive");

module.exports = {
  checkDriveCreds: async () => {
    const driveCreds = await decryptAndGetCreds();

    writeJSON(driveCreds.token, process.env.DRIVE_KEY_FILE);
  },
};
