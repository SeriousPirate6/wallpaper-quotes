require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");
const properties = require("./constants/properties");

module.exports = {
  getCompletion: (getCompletion = async (prompt) => {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const openai = new OpenAIApi(configuration);

    const response = await openai.createCompletion({
      model: properties.TEXT_DA_VINCI,
      prompt: properties.PROMPT_IMAGE_DESCRIPTION.replace("$sentene$", prompt),
      max_tokens: 7,
      temperature: 0,
    });

    console.log(response.data);
    return response.data;
  }),
};

// getCompletion(properties.PROMPT_IMAGE_DESCRIPTION);
