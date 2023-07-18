const fonts = require("../constants/fonts");
const { isLinuxOs } = require("../utility/getOS");
const {
  getTextWidth,
  charsPerRow,
  divideTextIntoRows,
  getFirstLineSpacing,
  generateTSpans,
  measureTextWidth,
} = require("../utility/svgImage");

module.exports = {
  generateTSpansFromQuote: async ({ quote }) => {
    const textWidth = isLinuxOs() // handling Windows issue using both Sharp and Canvas
      ? getTextWidth({
          text: quote,
          fontPath: fonts.HELVETICA_BOLD_TTF,
        })
      : await measureTextWidth({
          text: quote,
          fontPath: fonts.HELVETICA_BOLD_TTF,
        });

    const chars_per_row = charsPerRow({
      width: 1080,
      textWidth,
      charCount: quote.length,
    });

    const rowsDividedText = divideTextIntoRows({ text: quote, chars_per_row });

    const first_line_spacing = getFirstLineSpacing({
      rows_number: rowsDividedText.length,
    });

    return generateTSpans({
      rowDividedText: rowsDividedText,
      first_line_spacing,
    });
  },
};
