// this file is specifically for mapping/configuring our data
// for implementation in the mongodb database
const { model, Schema } = require('mongoose');

const timeSchema = new Schema({
  time: String,
  body: String,
  miles: String,
  username: String,
  createdAt: String,
  comments: [
    {
      body: String,
      username: String,
      createdAt: String
    }
  ],
  likes: [
    {
      username: String,
      createdAt: String
    }
  ],
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  }
});

module.exports = model('Time', timeSchema);