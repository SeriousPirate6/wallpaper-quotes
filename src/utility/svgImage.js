const path = require("path");
const puppeteer = require("puppeteer");
const { isLinuxOs } = require("../utility/getOS");
const { installFontRender } = require("../utility/installFontRender");

pixelsPerChar = ({ textWidth, charCount }) => {
  const pixels_per_char = Math.floor(textWidth / charCount);
  console.log(`${pixels_per_char} - pixels per char`);
  return pixels_per_char;
};

module.exports = {
  getTextWidth: ({ text, fontSize = 70, fontWeight = "Bold", fontPath }) => {
    const { createCanvas } = require("canvas");

    const canvas = createCanvas(200, 100);
    const context = canvas.getContext("2d");

    if (fontPath) installFontRender({ fontPath });

    const fontFamily =
      fontPath && isLinuxOs()
        ? path.basename(fontPath, path.extname(fontPath))
        : "Helvetica";
    context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

    const textWidth = context.measureText(text).width;
    console.log(`${textWidth} - text width`);

    return textWidth;
  },

  measureTextWidth: async ({
    text,
    fontSize = 70,
    fontWeight = "Bold",
    fontPath,
  }) => {
    if (fontPath) installFontRender({ fontPath });

    const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <text x="10" y="50" font-size="${fontSize}" font-family: '${
      fontPath && isLinuxOs()
        ? path.basename(fontPath, path.extname(fontPath))
        : "Helvetica"
    }' font-weight="${fontWeight}">${text}</text>
    </svg>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      defaultArgs: ["--silent"], // suppressing warnings
    });
    const page = await browser.newPage();

    await page.setContent(svgContent);

    const textElement = await page.$("text");
    const { width } = await textElement.boundingBox();

    console.log(`${width} - text width`);
    await browser.close();

    return width;
  },

  charsPerRow: ({ width, textWidth, charCount }) => {
    const chars_per_row = Math.floor(
      // by standard occupying only 55% of the width
      (width * (1 - 0.45)) / pixelsPerChar({ textWidth, charCount })
    );
    console.log(`${chars_per_row} - chars per row`);
    return chars_per_row;
  },

  divideTextIntoRows: ({ text, chars_per_row }) => {
    const words = text.split(" ");

    console.log(`${words.length} - words number`);

    let rows = [];
    let index = 0;

    words.forEach((word) => {
      if ((rows[index] ? rows[index] + word : word).length <= chars_per_row) {
        rows[index] ? (rows[index] += " " + word) : (rows[index] = word);
      } else {
        index++;
        rows[index] = word;
      }
    });

    console.log(rows);
    return rows;
  },

  getFirstLineSpacing: ({ rows_number, default_line_spacing = 1.2 }) => {
    let first_line_spacing;

    if (rows_number % 2 === 0) {
      first_line_spacing =
        -Number(
          ((rows_number / 2) * default_line_spacing).toFixed(2) -
            default_line_spacing / 2
        ) + 0.25;
    } else {
      first_line_spacing =
        -Number((((rows_number - 1) / 2) * default_line_spacing).toFixed(2)) +
        0.25;
    }

    console.log(first_line_spacing);
    return first_line_spacing;
  },

  generateTSpans: ({
    rowDividedText,
    first_line_spacing,
    default_line_spacing = 1.2,
  }) => {
    const t_spans = [];

    rowDividedText.forEach((row, index) => {
      t_spans.push(
        `<tspan x="50%" dy="${
          index === 0 ? first_line_spacing : default_line_spacing
        }em">${row}</tspan>`
      );
    });

    console.log(t_spans);
    return t_spans;
  },
};
