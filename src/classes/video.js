module.exports = {
  Video: class Video {
    constructor({ id, url, keyword, user, resolution, fps } = {}) {
      this.id = id;
      this.url = url;
      this.fps = fps;
      this.user = user;
      this.keyword = keyword;
      this.resolution = resolution;
    }
  },
};
