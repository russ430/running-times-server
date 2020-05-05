const { AuthenticationError } = require('apollo-server');

// ---- HELPER FUNCTIONS ---- //
const checkAuth = require('../../util/checkAuth');
const { resetRunStats } = require('../../util/resetRunStats');
const { updateStatsAfterPost } = require('../../util/updateStatsAfterPost');
const {
  updateStatsAfterDeleteTime,
} = require('../../util/updateStatsAfterDelete');

// ---- DATABASE SCHEMAS ---- //
const Time = require('../../models/Time');
const User = require('../../models/User');

module.exports = {
  Query: {
    // ---- GET ALL TIMES ---- //
    async getTimes() {
      try {
        // get all the times in order by most recent time
        const times = await Time.find().sort({ createdAt: -1 });
        return times;
      } catch (err) {
        throw new Error(err);
      }
    },

    // ---- GET ONE TIME ---- //
    async getTime(_, { timeId }) {
      try {
        const time = await Time.findById(timeId);
        if (time) {
          return time;
        }
        throw new Error('Time not found');
      } catch (err) {
        throw new Error(err);
      }
    },
  },

  // ---- MUTATIONS ---- //
  Mutation: {
    // ---- POST TIME ---- //
    async postTime(_, { time, miles, body }, context) {
      // confirm the user is signed in
      const user = checkAuth(context);
      const { username } = user;

      // check time format
      const testRegEx = /^(\d\d||\d):[0-5]\d/;
      if (!testRegEx.test(time)) {
        throw new Error('Time must be numbers only and in MM:SS format');
      }

      // check inputs are non-empty
      if (time.trim() === '' || miles.trim() === '' || body.trim() === '') {
        throw new Error("Time, Mileage and/or How'd it go? must not be empty");
      }

      const foundUser = await User.findOne({ username });

      const updatedUserStats = updateStatsAfterPost(foundUser, time, miles);

      // ---- UPDATING USER DATA ----//
      User.findOneAndUpdate(
        { username },
        {
          $set: {
            runStats: {
              ...updatedUserStats,
            },
          },
        },
        { returnOriginal: false },
        (err, doc) => {
          if (err) {
            console.log('something went wrong');
          }
          console.log(doc);
        }
      );

      // create a new time to post to the feed
      const newTime = new Time({
        username: user.username,
        user: user.id,
        time,
        miles,
        body,
        createdAt: new Date().toISOString(),
      });

      // save the new post to the feed
      const postTime = await newTime.save();

      return postTime;
    },

    // ---- DELETE TIME ---- //
    async deleteTime(_, { timeId }, context) {
      // confirm the user is signed in
      const user = checkAuth(context);
      const { username } = user;

      try {
        const time = await Time.findById(timeId);
        if (username === time.username) {
          const foundUser = await User.findOne({ username });
          const stats = foundUser.runStats[0];

          const updatedTotalMiles = (
            parseFloat(stats.totalMiles) - parseFloat(time.miles)
          ).toFixed(0);

          let updatedUserStats;
          if (updatedTotalMiles <= 0) {
            updatedUserStats = resetRunStats;
          } else {
            // find all the times posted by current user
            const times = await Time.find({ username });
            updatedUserStats = updateStatsAfterDeleteTime(times, time, stats);
          }

          User.findOneAndUpdate(
            { username },
            {
              $set: {
                runStats: {
                  ...updatedUserStats,
                },
              },
            },
            { returnOriginal: false },
            (err, doc) => {
              if (err) {
                console.log('something went wrong');
              }
              console.log(doc);
            }
          );

          await time.delete();
          return 'Post deleted successfully';
        }
        // times can only be deleted by the user who posted it
        throw new AuthenticationError('Action not allowed');
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};
