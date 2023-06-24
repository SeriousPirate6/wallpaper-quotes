module.exports = {
  Image: class Image {
    constructor({ id, createdTime, url, keyword, user, tags } = {}) {
      this.id = id;
      this.url = url;
      this.user = user;
      this.tags = tags;
      this.keyword = keyword;
      this.createdTime = createdTime;
    }
  },
};
