const { minsToSeconds } = require('./minsToSeconds');

module.exports.updateStatsAfterPost = (user, time, miles) => {
  const stats = user.runStats[0];
  const newPostSeconds = minsToSeconds(time);

  // ----UPDATING TOTAL MILEAGE ----//
  const prevTotalMiles = stats.totalMiles;
  const updatedTotalMiles = (
    parseFloat(prevTotalMiles) + parseFloat(miles)
  ).toFixed(1);

  // ---- UPDATING TOTAL TIME ----//
  const prevTotalTime = parseFloat(stats.totalTime);
  const updatedTotalSeconds = prevTotalTime + newPostSeconds;

  // ---- UPDATING AVG MILE ----//
  const avgMile = (updatedTotalSeconds / updatedTotalMiles).toFixed(0);

  // ---- UPDATING LONGEST RUN ----//
  const prevLongSeconds = stats.longestRunTime;
  const longestRunTime = Math.max(newPostSeconds, prevLongSeconds);

  // ---- UPDATING LONGEST MILEAGE ----//
  const prevLongMiles = stats.longestRunMiles;
  const longestRunMiles = Math.max(miles, prevLongMiles);

  // ---- CALCULATING QUICKEST PACE ----//
  const prevPace = stats.quickestPace;
  const newPace = (newPostSeconds / parseFloat(miles)).toFixed(0);
  const quickestPace = prevPace === '0' ? newPace : Math.min(newPace, prevPace);

  const updated = {
    totalMiles: updatedTotalMiles,
    totalTime: updatedTotalSeconds,
    avgMile,
    longestRunTime,
    longestRunMiles,
    quickestPace,
    postedYet: true,
  };

  return updated;
};
