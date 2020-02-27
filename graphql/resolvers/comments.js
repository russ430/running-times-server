const { AuthenticationError, UserInputError } = require('apollo-server');

const checkAuth = require('../../util/checkAuth');
const Time = require('../../models/Time');

module.exports = {
  Mutation: {
    async postComment(_, { timeId, body }, context){
      const { username } = checkAuth(context);

      if(body.trim() === '') {
        throw new UserInputError('Empty comment', {
          errors: {
            body: 'Comment body must not be empty'
          }
        })
      }
      const time = await Time.findById(timeId);

      if(time) {
        time.comments.unshift({
          username,
          body,
          createdAt: new Date().toISOString()
        });

        await time.save();
        return time;
      } else {
        throw new UserInputError('Time not found')
      }
    },
    async deleteComment(_, { timeId, commentId }, context) {
      const { username } = checkAuth(context);

      const time = await Time.findById(timeId);

      if(time) {
        const commentIndex = time.comments.findIndex(c => c.id === commentId);

        if(time.comments[commentIndex].username === username) {
          time.comments.splice(commentIndex, 1);

          await time.save();
          return time;
        } else {
          throw new AuthenticationError('Action not allowed');
        }
      } else {
        throw new UserInputError('Time does not exist');
      }
    }
  }
}