const { UserInputError } = require('apollo-server')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { validateRegisterInput, validateLoginInput } = require('../../util/validators');
// const { SECRET } = require('../../config');
const User = require('../../models/User');

function generateToken(user) {
  return jwt.sign({
    id: user.id,
    email: user.email,
    username: user.username
  }, SECRET, { expiresIn: '1h' });
};

function secondsToFormat(totalSeconds) {
  if (totalSeconds == '0') {
    return '0';
  } else {
    // getting the total minutes by dividing total seconds by 60 and removing the remainder
    const totalMins = (Math.floor(parseFloat(totalSeconds) / 60));
    // subtracting the total mins in seconds from the total seconds
    const seconds = totalSeconds - (totalMins * 60);
    if(seconds < 10) {
      return `${totalMins}:0${seconds}`;
    } else {
      return `${totalMins}:${seconds}`;
    };
  }
}

module.exports = {
  Mutation: {
    async login(_, { username, password }) {
      const { errors, valid } = validateLoginInput(username, password);

      if(!valid) {
        throw new UserInputError('Errors', { errors });
      }
      const user = await User.findOne({ username });

      if(!user) {
        errors.general = 'User not found';
        throw new UserInputError('User not found', { errors });
      }

      const match = await bcrypt.compare(password, user.password);
      if(!match) {
        errors.general = 'Wrong credentials';
        throw new UserInputError('Wrong credentials', { errors });
      }

      const token = generateToken(user);

      return {
        ...user._doc,
        id: user._id,
        token
      }
    },
    async register(_, { registerInput: { name, username, email, password, confirmPassword, location, avatar }}) {
      // Validate user data (make sure we don't have empty fields (password, email), passwords match)
      const { valid, errors } = validateRegisterInput(name, username, email, password, confirmPassword, location, avatar);
      if(!valid) {
        throw new UserInputError('Errors', { errors });
      }
      // make sure user doesn't already exist
      const user = await User.findOne({ username });
      if (user) {
        throw new UserInputError('Username is taken', {
          errors: {
            username: 'This username is taken'
          }
        });
      }
      // hash password and create an auth token
      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        name,
        username,
        email,
        password,
        location,
        avatar,
        createdAt: new Date().toISOString(),
        runStats: [{
          totalMiles: '0',
          totalTime: '0',
          avgMile: '0',
          longestRunTime: '0',
          longestRunMiles: '0',
          quickestPace: '0',
          postedYet: false
        }]
      });

      const res = await newUser.save();

      const token = generateToken(res);

      return {
        ...res._doc,
        id: res._id,
        token
      };
    }
  },
  Query: {
    async getUserData(_, { username }) {
      try {
        const user = await User.findOne({ username });

        if (user) {
          const userData = { runStats: [{}] };
          userData.name = user.name;
          userData.createdAt = user.createdAt;
          userData.location = user.location;
          userData.avatar = user.avatar;

          // adding total miles to userData obj
          userData.runStats[0].totalMiles = user.runStats[0].totalMiles;
          // adding longest miles run to userData obj
          userData.runStats[0].longestRunMiles = user.runStats[0].longestRunMiles;

          //---- FORMATTING TOTAL TIME TO MM:SS ----//
          const totalSeconds = user.runStats[0].totalTime;
          // converting seconds to MM:SS using secondsToFormat function
          let newTotalTime = secondsToFormat(totalSeconds);
          userData.runStats[0].totalTime = newTotalTime;

          //---- FORMATTING AVG MILE ----//
          const avgSecondsMile = user.runStats[0].avgMile;
          // formatting avgMile seconds to MM:SS using secondsToFormat function
          const avgMileFormatted = secondsToFormat(avgSecondsMile);
          userData.runStats[0].avgMile = avgMileFormatted;

          //---- CALCULATING AVG SPEED IN MPH ----//
          const avgSpeed = (60 / (avgSecondsMile / 60)).toFixed(1);
          userData.runStats[0].avgSpeed = avgSpeed;
          
          //---- FORMATTING LONGEST TIME ----//
          const longestRunTime = user.runStats[0].longestRunTime;
          const newlongestRunTime = secondsToFormat(longestRunTime);
          userData.runStats[0].longestRunTime = newlongestRunTime;

          //---- FORMATTING QUICKEST PACE ----//
          const quickestPace = secondsToFormat(parseFloat(user.runStats[0].quickestPace));
          userData.runStats[0].quickestPace = quickestPace;

          //---- HAS USER POSTED YET ----//
          const postedYet = user.runStats[0].postedYet;
          userData.runStats[0].postedYet = postedYet;

          return userData;
        }
      } catch(err) {
        console.log(err);
      }
    }
  }
}