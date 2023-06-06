module.exports = Object.freeze({
  // OPENAI
  TEXT_DA_VINCI: "text-davinci-003",
  PROMPT_PLACEHOLDER: (PROMPT_PLACEHOLDER = "$sentence$"),
  PROMPT_IMAGE_DESCRIPTION: `given a sentence, find an image to attach to it in one word.
    sentence: ${PROMPT_PLACEHOLDER}
    answer:`,

  // JIMP
  TEXT_WIDTH: 400,

  // TEMPLATES
  CIRCLE_MASK: "templates/circle_mask.png",
  QUOTE_FRAME: "templates/quote-template.png",
  UNKNOWN_AUTHOR:
    "https://www.maven-infotech.com/wp-content/uploads/2014/11/Iran-Faces-Mehdi-Alizadeh-Fakhrabad.png",
});
