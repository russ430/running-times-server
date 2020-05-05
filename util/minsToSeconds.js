module.exports.minsToSeconds = time => {
  const timeSplit = time.split(':');
  const minutesToSeconds = parseFloat(timeSplit[0]) * 60;
  const totalSeconds = minutesToSeconds + parseFloat(timeSplit[1]);
  return totalSeconds;
};
