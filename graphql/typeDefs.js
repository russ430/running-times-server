const { gql } = require('apollo-server');

module.exports = gql`
  type Time {
    id: ID!
    time: String!
    miles: String!
    body: String!
    createdAt: String!
    username: String!
    comments: [Comment]!
    likes: [Like]!
    likeCount: Int!
    commentCount: Int!
  }
  type Comment {
    id: ID!
    createdAt: String!
    username: String!
    body: String!
  }
  type Like {
    id: ID!
    createdAt: String!
    username: String!
  }
  type Stats {
    totalMiles: String!
    totalTime: String!
    avgMile: String!
    longestRunTime: String!
    longestRunMiles: String!
    avgSpeed: String!
    quickestPace: String!
    postedYet: Boolean!
  }
  type User {
    id: ID!
    name: String!
    email: String!
    token: String!
    username: String!
    createdAt: String!
    location: String!
    avatar: Int!
    runStats: [Stats]
  }
  input RegisterInput {
    name: String!
    username: String!
    password: String!
    confirmPassword: String!
    email: String!
    location: String!
    avatar: String!
  }
  type Query {
    getTimes: [Time]
    getTime(timeId: ID!): Time
    getUserData(username: String!): User!
  }
  type Mutation {
    register(registerInput: RegisterInput): User!
    login(username: String!, password: String!): User!
    postTime(time: String!, miles: String!, body: String!): Time!
    deleteTime(timeId: ID!): String!
    postComment(timeId: ID!, body: String!): Time!
    deleteComment(timeId: ID!, commentId: ID!): Time!
    likeTime(timeId: ID!): Time!
  }
`;
