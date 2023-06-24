module.exports = {
  cutString: (string, n) => {
    const cut = string.indexOf("_", n);
    if (cut == -1) return string;
    return string.substring(0, cut);
  },

  sanitize: (string) => {
    return string.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
  },
};
