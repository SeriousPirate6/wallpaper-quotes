module.exports = {
  Quote: class Quote {
    constructor({ phrase, author, image, video } = {}) {
      this.phrase = phrase;
      this.author = author;
      this.image = image;
      this.video = video;
    }
  },
};
