const { minsToSeconds } = require('./minsToSeconds');

module.exports.updateStatsAfterDeleteTime = (times, time, stats) => {
  const { totalMiles, totalTime } = stats;

  // ---- TOTAL MILES ---- //
  const updatedTotalMiles = parseFloat(totalMiles) - parseFloat(time.miles);

  // ---- TOTAL TIME ----//
  const updatedTotalTime =
    parseFloat(totalTime) - parseFloat(minsToSeconds(time.time));

  // ---- AVG MILE ----//
  const avgMile = (updatedTotalTime / updatedTotalMiles).toFixed(0);

  // ---- LONGEST RUN TIME ----//
  const allRunTimes = times.map(post => minsToSeconds(post.time));
  const longestRunTime = Math.max(...allRunTimes);

  // ---- LONGEST RUN MILES ----//
  const allMilesRun = times.map(post => parseFloat(post.miles));
  const longestRunMiles = Math.max(...allMilesRun);

  // ---- QUICKEST PACE ----//
  const allAvgMiles = times.map(
    post => minsToSeconds(post.time) / parseFloat(post.miles)
  );
  const quickestPace = Math.min(...allAvgMiles).toFixed(0);

  const updated = {
    totalMiles: updatedTotalMiles,
    totalTime: updatedTotalTime,
    avgMile,
    longestRunTime,
    longestRunMiles,
    quickestPace,
    postedYet: true,
  };

  return updated;
};
