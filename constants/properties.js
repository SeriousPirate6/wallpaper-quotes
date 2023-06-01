module.exports = Object.freeze({
  // OPENAI
  TEXT_DA_VINCI: "text-davinci-003",
  PROMPT_PLACEHOLDER: (PROMPT_PLACEHOLDER = "$sentence$"),
  PROMPT_IMAGE_DESCRIPTION: `given a sentence, find an image to attach to it in one word.
    sentence: ${PROMPT_PLACEHOLDER}
    answer:`,
});
