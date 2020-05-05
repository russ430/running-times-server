const { secondsToMins } = require('./secondsToMins');

module.exports.formatRunData = stats => {
  const { totalMiles, longestRunMiles } = stats;

  // ---- FORMATTING TOTAL TIME TO MM:SS ----//
  const totalTime = secondsToMins(stats.totalTime);

  // ---- FORMATTING AVG MILE ----//
  const avgSecondsMile = stats.avgMile;
  const avgMile = secondsToMins(avgSecondsMile);

  // ---- CALCULATING AVG SPEED IN MPH ----//
  const avgSpeed = (60 / (avgSecondsMile / 60)).toFixed(1);

  // ---- FORMATTING LONGEST TIME ----//
  const longestRunTime = secondsToMins(stats.longestRunTime);

  // ---- FORMATTING QUICKEST PACE ----//
  const quickestPace = secondsToMins(parseFloat(stats.quickestPace));

  const { postedYet } = stats;

  const formatted = {
    totalMiles,
    longestRunMiles,
    totalTime,
    avgMile,
    avgSpeed,
    longestRunTime,
    quickestPace,
    postedYet,
  };

  return formatted;
};
