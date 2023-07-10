module.exports = {
  timeFormat: ({ timeInSeconds }) => {
    const totalSeconds = Math.floor(timeInSeconds);
    const milliseconds = Number((timeInSeconds % 1).toFixed(3).substring(2));

    const hours = Math.floor(totalSeconds / 60 / 60);
    const minutes = Math.floor(totalSeconds / 60 - hours * 60);
    const seconds = totalSeconds - minutes * 60 - hours * 60 * 60;

    const formattedTime = { hours, minutes, seconds, milliseconds };

    console.log(formattedTime);
    return formattedTime;
  },
};
