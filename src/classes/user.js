module.exports = {
  User: class User {
    constructor({ id, name, url, ig_username, profile_image, platform } = {}) {
      this.id = id;
      this.url = url;
      this.name = name;
      this.platform = platform;
      this.ig_username = ig_username;
      this.profile_image = profile_image;
    }
  },
};
