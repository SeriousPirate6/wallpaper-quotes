const fs = require("fs");

module.exports = {
  halveFrameRate: (halveFrameRate = ({ frames, framerate }) => {
    const parentFolder = frames[1].substring(0, frames[1].lastIndexOf("/"));
    if (framerate >= 50) {
      const remainedFrames = [];
      const ext = frames[1].substring(frames[1].lastIndexOf(".") + 1);

      // extracting the index of the first element of the array
      let previous = frames.indexOf(
        frames.find(
          (element) =>
            Number(
              element
                ?.substring(`${ext}.`, "")
                .substring(`${parentFolder}/`, "")
            ) >= 0
        )
      );

      frames.forEach((frame, index) => {
        if (index % 2 === 0) {
          try {
            console.log(`Deleting frame ${index}`);
            fs.unlinkSync(frame);
          } catch (error) {
            console.log(error);
          }
        } else {
          if (previous !== index) {
            try {
              fs.renameSync(frame, `${parentFolder}/${previous}.${ext}`);
              console.log(`Renaming frame ${index}`);
            } catch (error) {
              console.log(error);
            }
          }
          remainedFrames.push(`${parentFolder}/${previous}.${ext}`);
          previous += 1;
        }
      });

      return { frames: remainedFrames, framerate: (framerate / 2).toFixed() };
    } else {
      console.log(`Framerate: ${framerate} FPS, no need for reduction.`);
      return {
        frames,
        framerate,
      };
    }
  }),

  extractFramesFromDuration: (extractFramesFromDuration = ({
    frames,
    framerate,
    start,
    duration,
  }) => {
    const frame_start = framerate * start;
    const frame_end =
      framerate * (start + duration) < frames.length
        ? framerate * (start + duration)
        : frames.length;

    const parentFolder = frames[1].substring(0, frames[1].lastIndexOf("/"));
    const ext = frames[1].substring(frames[1].lastIndexOf(".") + 1);

    // extracting the index of the first element of the array
    let previous = frames.indexOf(
      frames.find(
        (element) =>
          Number(
            element?.substring(`${ext}.`, "").substring(`${parentFolder}/`, "")
          ) >= 0
      )
    );

    return frames.reduce((frames_remaining, frame, index) => {
      if (index >= frame_start && index <= frame_end) {
        if (previous !== index) {
          try {
            fs.renameSync(frame, `${parentFolder}/${previous}.${ext}`);
            console.log(`Renaming frame ${index}`);
          } catch (error) {
            console.log(error);
          }
        }
        frames_remaining.push(`${previous}.${ext}`);
        previous += 1;
      } else {
        fs.unlinkSync(frame);
      }
      return frames_remaining;
    }, []); // passing a custom param at the beginning of the function
  }),
};
