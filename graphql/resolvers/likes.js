const { UserInputError } = require('apollo-server');

const checkAuth = require('../../util/checkAuth');
const Time = require('../../models/Time');

module.exports = {
  Mutation: {
    async likeTime(_, { timeId }, context) {
      // confirm the user is signed in
      const { username } = checkAuth(context);

      const time = await Time.findById(timeId);
      if (time) {
        // check to see if time has been liked by the current user
        if (time.likes.find(like => like.username === username)) {
          // if it has remove the current user's like
          time.likes = time.likes.filter(like => like.username !== username);
        } else {
          // if time hasn't been liked, add like by the current user
          time.likes.push({
            username,
            createdAt: new Date().toISOString(),
          });
        }
        await time.save();
        return time;
      }
      throw new UserInputError('Time not found');
    },
  },
};
