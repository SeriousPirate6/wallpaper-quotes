require("dotenv").config();
const properties = require("../constants/properties");

module.exports = {
  getAuthorImage: (authorName) => {
    if (authorName.toLowerCase().trim() != properties.UNKNOWN_AUTHOR) {
      return `${process.env.ZENQUOTE_IMAGES}\\${authorName
        .toLowerCase()
        .replaceAll(" ", "-")
        .replaceAll(".", "_")}.jpg`;
    } else return properties.UNKNOWN_AUTHOR;
  },
};
