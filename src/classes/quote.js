module.exports = {
  Quote: class Quote {
    constructor({ phrase, author, image } = {}) {
      this.phrase = phrase;
      this.author = author;
      this.image = image;
    }
  },
};
