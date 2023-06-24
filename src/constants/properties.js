module.exports = Object.freeze({
  // FOLDERS
  DIR_OUTPUT: "output",
  DIR_RESIZED: "resized",

  // G-DRIVE folders
  FOLDER_QUOTES: "W-Quotes",

  // JIMP
  TEXT_WIDTH: 400,
  AUTHOR_IMAGE_OFFSET_X: 176,
  AUTHOR_IMAGE_OFFSET_Y: 175,

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

  // TEMPLATES
  CIRCLE_MASK: "src/templates/circle_mask.png",
  QUOTE_FRAME: "src/templates/quote-template.png",
  UNKNOWN_AUTHOR: "unknown",
  UNKNOWN_AUTHOR_IMAGE:
    "https://www.maven-infotech.com/wp-content/uploads/2014/11/Iran-Faces-Mehdi-Alizadeh-Fakhrabad.png",
});
