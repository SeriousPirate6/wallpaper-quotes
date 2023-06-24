module.exports = {
  User: class User {
    constructor({ id, ig_username, profile_image } = {}) {
      this.id = id;
      this.ig_username = ig_username;
      this.profile_image = profile_image;
    }
  },
};
