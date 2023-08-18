const { User } = require("../classes/user");
const { Image } = require("../classes/image");
const { Quote } = require("../classes/quote");
const { Video } = require("../classes/video");
const { Author } = require("../classes/author");
const { getAuthorImage } = require("./getAuthorImage");
const properties = require("../constants/properties");

module.exports = {
  getProperties: ({ quote, image, video, media_description }) => {
    const vid_props = video
      ? video.video_files.find((video) => video.width === 1080)
      : undefined;

    return new Quote({
      phrase: quote.q,
      author: new Author({
        name: quote.a,
        image: getAuthorImage(quote.a),
      }),
      image: image
        ? new Image({
            id: image.id,
            url: image.urls.regular,
            keyword: media_description,
            createdTime: image.created_at,
            user: new User({
              id: image.user.id,
              profile_image: image.user.profile_image.large,
              ig_username: image.user.instagram_username,
              platform: properties.UNSPLASH,
            }),
            tags: image.tags.map((e) => e.title),
          })
        : undefined,
      video: video
        ? new Video({
            id: video.id,
            fps: vid_props?.fps,
            url: vid_props?.link,
            keyword: media_description,
            user: new User({
              id: video.user?.id,
              url: video.user?.url,
              name: video.user?.name,
              platform: properties.PEXEL,
            }),
          })
        : undefined,
    });
  },
};
