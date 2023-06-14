module.exports = {
  Quote: class Quote {
    constructor({ text, back_image, author, author_image } = {}) {
      (this.text = text),
        (this.back_image = back_image),
        (this.author = author),
        (this.author_image = author_image);
    }
  },
};
