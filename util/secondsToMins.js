module.exports.secondsToMins = seconds => {
  if (seconds === '0') {
    return '0';
  }
  const totalMins = Math.floor(parseFloat(seconds) / 60);
  const remainderSecs = seconds - totalMins * 60;
  const formatted =
    remainderSecs < 10
      ? `${totalMins}:0${remainderSecs}`
      : `${totalMins}:${remainderSecs}`;
  return formatted;
};
