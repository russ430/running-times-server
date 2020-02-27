const { UserInputError } = require('apollo-server');

const checkAuth = require('../../util/checkAuth');
const Time = require('../../models/Time');

module.exports = {
  Mutation: {
    async likeTime(_, { timeId }, context) {
      const { username } = checkAuth(context);

      const time = await Time.findById(timeId);

      if(time) {
        // check to see if time has been liked
        // if it has, unlike it
        if(time.likes.find(like => like.username === username )) {
          time.likes = time.likes.filter(like => like.username !== username);
        } else {
          // if time hasn't been liked, add like
          time.likes.push({
              username,
              createdAt: new Date().toISOString()
            })
        }
        await time.save();
        return time;
      } else {
        throw new UserInputError('Time not found');
      }
    }
  }
}