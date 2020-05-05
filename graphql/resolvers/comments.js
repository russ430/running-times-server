const { AuthenticationError, UserInputError } = require('apollo-server');

const checkAuth = require('../../util/checkAuth');
const Time = require('../../models/Time');

module.exports = {
  Mutation: {
    // ---- POST COMMENT ---- //
    async postComment(_, { timeId, body }, context) {
      const { username } = checkAuth(context);

      // check for empty comment body
      if (body.trim() === '') {
        throw new UserInputError('Empty comment', {
          errors: {
            body: 'Comment body must not be empty',
          },
        });
      }

      // search for time in database
      const time = await Time.findById(timeId);
      if (time) {
        time.comments.unshift({
          username,
          body,
          createdAt: new Date().toISOString(),
        });
        await time.save();
        return time;
      }

      // if the time doesn't exist throw error
      throw new UserInputError('Time not found');
    },

    // ---- DELETE COMMENT ---- //
    async deleteComment(_, { timeId, commentId }, context) {
      // confirm the user is signed in
      const { username } = checkAuth(context);

      // make sure the time exists
      const time = await Time.findById(timeId);
      if (time) {
        const commentIndex = time.comments.findIndex(c => c.id === commentId);

        if (time.comments[commentIndex].username === username) {
          // remove the comment from the comments array
          time.comments.splice(commentIndex, 1);
          await time.save();
          return time;
        }
        // throw error if the user tries to delete a comment that is not theirs
        throw new AuthenticationError('Action not allowed');
      } else {
        throw new UserInputError('Time does not exist');
      }
    },
  },
};
