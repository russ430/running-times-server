const { model, Schema } = require('mongoose');

const userSchema = new Schema({
  name: String,
  username: String,
  password: String,
  email: String,
  createdAt: String,
  location: String,
  avatar: String,
  runStats: [
    {
      totalMiles: String,
      totalTime: String,
      longestRunTime: String,
      longestRunMiles: String,
      avgMile: String,
      quickestPace: String,
      postedYet: Boolean
    }
  ]
});

module.exports = model('User', userSchema);