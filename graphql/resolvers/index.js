const timesResolvers = require('./times');
const usersResolvers = require('./users');
const commentsResolvers = require('./comments');
const likesResolvers = require('./likes');

module.exports = {
  Time: {
    likeCount: (parent) => parent.likes.length,
    commentCount: (parent) => parent.comments.length
  },
  Query: {
    ...timesResolvers.Query,
    ...usersResolvers.Query
  },
  Mutation: {
    ...timesResolvers.Mutation,
    ...usersResolvers.Mutation,
    ...commentsResolvers.Mutation,
    ...likesResolvers.Mutation
  }
}