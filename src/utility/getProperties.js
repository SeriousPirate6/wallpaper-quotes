const { User } = require("../classes/user");
const { Image } = require("../classes/Image");
const { Quote } = require("../classes/quote");
const { Author } = require("../classes/author");
const { getAuthorImage } = require("./get-author-image");

module.exports = {
  getProperties: ({ quote, image, image_description }) => {
    return new Quote({
      phrase: quote.q,
      author: new Author({
        name: quote.a,
        image: getAuthorImage(quote.a),
      }),
      image: new Image({
        id: image.id,
        createdTime: image.created_at,
        url: image.urls.regular,
        keyword: image_description,
        user: new User({
          id: image.user.id,
          profile_image: image.user.profile_image.large,
          ig_username: image.user.instagram_username,
        }),
        tags: image.tags.map((e) => e.title),
      }),
    });
  },
};
