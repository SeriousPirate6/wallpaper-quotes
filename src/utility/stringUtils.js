const crypto = require("crypto");

module.exports = {
  shorten: (string, n) => {
    const cut = string.indexOf("_", n);
    if (cut == -1) return string;
    return string.substring(0, cut);
  },

  sanitize: (string) => {
    return string.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
  },

  generateRandom: (length) => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }

    return result;
  },

  getRandomBytes: (keyLength) => {
    return crypto.randomBytes(keyLength);
  },

  fromHexToBytes: (hexString) => {
    return Buffer.from(hexString, "hex");
  },

  fromBytesToHex: (bytes) => {
    return bytes.toString("hex");
  },

  encrypt: (text, secretKey) => {
    const algorithm = "aes-256-cbc";
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    let encrypted = cipher.update(JSON.stringify(text), "utf8", "hex");
    encrypted += cipher.final("hex");
    return {
      iv: iv.toString("hex"),
      encryptedText: encrypted,
    };
  },

  decrypt: (encryptedData, secretKey) => {
    const algorithm = "aes-256-cbc";
    const decipher = crypto.createDecipheriv(
      algorithm,
      secretKey,
      Buffer.from(encryptedData.iv, "hex")
    );
    let decrypted = decipher.update(encryptedData.encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  },

  stringToMap: (inputString) => {
    const keyValuePairs = inputString.split(";");

    const keyValueMap = new Map();

    keyValuePairs.forEach((pair) => {
      const [key, value] = pair.split("=").map((pair) => pair.trim());
      keyValueMap.set(key, value);
    });

    return keyValueMap;
  },
};
