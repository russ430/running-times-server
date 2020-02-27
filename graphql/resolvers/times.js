const { AuthenticationError } = require('apollo-server');
const checkAuth = require('../../util/checkAuth');

const Time = require('../../models/Time');
const User = require('../../models/User');

const toSeconds = (time) => {
  const splitNewTime = time.split(':');
  // converting minutes to seconds and adding to seconds
  const totalNewSeconds = (parseFloat(splitNewTime[0]) * 60) + parseFloat(splitNewTime[1]);
  return totalNewSeconds
};

module.exports = {
  Query: {
    async getTimes() {
      try {
        const times = await Time.find().sort({ createdAt: -1 });
        return times;
      } catch(err) {
        throw new Error(err);
      }
    },
    async getTime(_, { timeId }) {
      try {
        const time = await Time.findById(timeId);
        if(time){
          return time;
        } else {
          throw new Error('Time not found')
        }
      } catch (err) {
        throw new Error(err)
      }
    }
  },
  Mutation: {
    async postTime(_, { time, miles, body }, context) {
      const user = checkAuth(context);
      const { username } = user;

      const testRegEx = /^(\d\d||\d):[0-5]\d/;
      if (!testRegEx.test(time)) {
        throw new Error('Time must be numbers only and in MM:SS format');
      }

      if (time.trim() === '' || miles.trim() === '' || body.trim() === '') {
        throw new Error("Time, Mileage and/or How'd it go? must not be empty")
      }

      const foundUser = await User.findOne({ username });

      //----UPDATING TOTAL MILEAGE ----//
      // grabbing the current total mileage
      const oldMiles = foundUser.runStats[0].totalMiles;
      // converting strings to floats and adding the old total to the new total
      const newTotalMiles = (parseFloat(oldMiles) + parseFloat(miles)).toFixed(1);

      //---- UPDATING TOTAL TIME ----//
      // grabbing the current total time
      const oldTotalTime = parseFloat(foundUser.runStats[0].totalTime);
      const postSeconds = toSeconds(time);
      const newTotalSeconds = oldTotalTime + postSeconds;

      //---- UPDATING AVG MILE ----//
      // calculating average mile
      const newAvgMile = (newTotalSeconds/newTotalMiles).toFixed(0);

      //---- UPDATING LONGEST RUN ----//
      const updatedLongestTime = () => {
        // converting new time to seconds
        const newTime = toSeconds(time);
        // if the user has a longest time
        if(foundUser.runStats[0].longestRunTime) {
          // check if the new time is longer than the current longest time
          if(newTime > foundUser.runStats[0].longestRunTime) {
            // if it is, return the new time
            return newTime;
          } else {
            // otherwise kee the old time
            return foundUser.runStats[0].longestRunTime;
          }
        // if the user doesn't have a new longest time, use the new time
        } else {
          return newTime
        }
      }

      //---- UPDATING LONGEST MILEAGE ----//
      const updatedLongestRunMiles = () => {
        if(miles > foundUser.runStats[0].longestRunMiles) {
          return miles;
        } else {
          return foundUser.runStats[0].longestRunMiles;
        }
      };

      //---- CALCULATING QUICKEST PACE ----//
      const oldPace = foundUser.runStats[0].quickestPace;
      const newPace = (toSeconds(time)/parseFloat(miles)).toFixed(0);
      const fastestPace = () => {
        if (newPace < oldPace || oldPace === '0') {
          return newPace;
        } else {
          return oldPace;
        }
      };

      //---- UPDATING USER DATA ----//
      User.findOneAndUpdate({ username: username }, { 
        $set: { runStats: { 
          totalMiles: newTotalMiles, 
          totalTime: newTotalSeconds, 
          avgMile: newAvgMile, 
          longestRunTime: updatedLongestTime(),
          longestRunMiles: updatedLongestRunMiles(),
          quickestPace: fastestPace(),
          postedYet: true
        }}}, 
        { returnOriginal: false }, (err, doc) => {
        if (err) {
          console.log('something went wrong');
        }
        console.log(doc);
      });

      const newTime = new Time({
        username: user.username,
        user: user.id,
        time,
        miles,
        body,
        createdAt: new Date().toISOString()
      });

      const postTime = await newTime.save();

      return postTime;
    },
    async deleteTime(_, { timeId }, context) {
      const user = checkAuth(context);
      const { username } = user;

      try {
        const time = await Time.findById(timeId);
        if(username === time.username) {

          const foundUser = await User.findOne({ username });
          const { runStats } = foundUser;

          //---- UPDATING TOTAL MILES ----//
          const { totalMiles } = runStats[0];
          const updatedTotalMiles = (parseFloat(totalMiles) - parseFloat(time.miles)).toFixed(0);

          if (updatedTotalMiles <= 0) {
            User.findOneAndUpdate({ username }, { 
              $set: { runStats: { 
                totalMiles: '0', 
                totalTime: '0', 
                avgMile: '0', 
                longestRunTime: '0',
                longestRunMiles: '0',
                quickestPace: '0',
                postedYet: false
              }}}, 
              { returnOriginal: false }, (err, doc) => {
              if (err) {
                console.log('something went wrong');
              }
              console.log(doc);
            });
          } else {


            //---- UPDATING TOTAL TIME ----//
            const { totalTime } = runStats[0];
            const updatedTotalTime = parseFloat(totalTime) - parseFloat(toSeconds(time.time));
  
            //---- UPDATED AVG MILE ----//
            const updatedAvgMile = (updatedTotalTime/updatedTotalMiles).toFixed(0);
  
            //---- UPDATING LONGEST RUN TIME ----//
            const times = await Time.find({ username });
            const newTimes = times.filter(time => timeId !== time.id);
            const convTimes = newTimes.map(time => toSeconds(time.time))
            const newLongestTime = Math.max(...convTimes);
  
            //---- UPDATING LONGEST RUN MILES ----//
            const convMiles = newTimes.map(time => parseFloat(time.miles));
            const newLongestMiles = Math.max(...convMiles);
  
            //---- UPDATING QUICKEST PACE ----//
            const avgMilesArr = newTimes.map(time => toSeconds(time.time)/parseFloat(time.miles));
            const quickestPace = Math.min(...avgMilesArr).toFixed(0);
  
            //---- UPDATING USER DATA ----//
            User.findOneAndUpdate({ username }, { 
              $set: { runStats: { 
                totalMiles: updatedTotalMiles, 
                totalTime: updatedTotalTime, 
                avgMile: updatedAvgMile, 
                longestRunTime: newLongestTime,
                longestRunMiles: newLongestMiles,
                quickestPace,
                postedYet: true
              }}}, 
              { returnOriginal: false }, (err, doc) => {
              if (err) {
                console.log('something went wrong');
              }
              console.log(doc);
            });
          }
          
          await time.delete();
          return 'Post deleted successfully';
        } else {
          throw new AuthenticationError('Action not allowed');
        }
      } catch(err) {
        throw new Error(err);
      }
    }
  }
}