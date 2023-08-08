module.exports = Object.freeze({
  // DRIVE QUERIES
  QUERY_ONLY_FOLDERS: "mimeType = 'application/vnd.google-apps.folder'",
  QUERY_NON_FOLDERS: "not mimeType = 'application/vnd.google-apps.folder'",
  QUERY_IN_PARENT: (folderId) => {
    return `'${folderId}' in parents`;
  },
  QUERY_NAME_EQUAL: (fileName) => {
    return `name = '${fileName}'`;
  },
  QUERY_NAME_CONTAINS: (fileName) => {
    return `name contains '${fileName}'`;
  },

  // FOLDERS
  DIR_OUTPUT: "output",
  DIR_RESIZED: "resized",
  DIR_VIDEO_TEMP: "test",

  // IG
  MAX_POSTS_PER_DAY: 10,

  // JIMP
  TEXT_WIDTH: 400,
  AUTHOR_IMAGE_OFFSET_X: 176,
  AUTHOR_IMAGE_OFFSET_Y: 175,

  // MEDIA FETCHING PLATFORMS
  PEXEL: "https://www.pexels.com/",
  UNSPLASH: "https://unsplash.com/",

  // MEDIA FORMATS
  MEDIA_FORMAT: {
    JPG: ".jpg",
    MP4: ".mp4",
  },

  // MIME TYPES
  MIME_TYPE: {
    IMAGE: "image/jpg",
    VIDEO: "video/mp4",
  },

  // OPENAI
  TEXT_DA_VINCI: "text-davinci-003",
  PROMPT_PLACEHOLDER: (PROMPT_PLACEHOLDER = "$sentence$"),
  PROMPT_IMAGE_DESCRIPTION: `given a sentence, find an image to attach to it in one word.
    sentence: ${PROMPT_PLACEHOLDER}
    answer:`,

  // POST TYPE
  REEL: "reel",

  // TEMPLATES
  CIRCLE_MASK: "src/templates/circle_mask.png",
  QUOTE_FRAME: "src/templates/quote-template.png",
  VIDEO_QUOTE_FRAME: "src/templates/quote-video-template.png",
  UNKNOWN_AUTHOR: "unknown",
  UNKNOWN_AUTHOR_IMAGE:
    "https://www.maven-infotech.com/wp-content/uploads/2014/11/Iran-Faces-Mehdi-Alizadeh-Fakhrabad.png",
});
