const { UserInputError } = require('apollo-server');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ---- HELPER FUNCTIONS ---- //
const {
  validateRegisterInput,
  validateLoginInput,
} = require('../../util/validators');
const { formatRunData } = require('../../util/formatRunData');
const { resetRunStats } = require('../../util/resetRunStats');

// ---- ENV VARIABLES ---- //
// const { SECRET } = require('../../config');

// ---- SCHEMAS ---- //
const User = require('../../models/User');

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    process.env.SECRET,
    { expiresIn: '1h' }
  );
}

module.exports = {
  Mutation: {
    async login(_, { username, password }) {
      const { errors, valid } = validateLoginInput(username, password);

      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }
      const user = await User.findOne({ username });

      if (!user) {
        errors.general = 'User not found';
        throw new UserInputError('User not found', { errors });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = 'Wrong credentials';
        throw new UserInputError('Wrong credentials', { errors });
      }

      const token = generateToken(user);

      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },
    async register(
      _,
      {
        registerInput: {
          name,
          username,
          email,
          password,
          confirmPassword,
          location,
          avatar,
        },
      }
    ) {
      const { valid, errors } = validateRegisterInput(
        name,
        username,
        email,
        password,
        confirmPassword,
        location,
        avatar
      );
      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }
      // confirm username isn't taken
      const user = await User.findOne({ username });
      if (user) {
        throw new UserInputError('Username is taken', {
          errors: {
            username: 'This username is taken',
          },
        });
      }
      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = new User({
        name,
        username,
        email,
        hashedPassword,
        location,
        avatar,
        createdAt: new Date().toISOString(),
        runStats: [
          {
            ...resetRunStats,
          },
        ],
      });

      const res = await newUser.save();

      const token = generateToken(res);

      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
  },
  Query: {
    async getUserData(_, { username }) {
      try {
        const user = await User.findOne({ username });

        if (user) {
          const { name, createdAt, location, avatar, runStats } = user;
          const formattedData = formatRunData(runStats[0]);
          const userData = {
            name,
            location,
            createdAt,
            avatar,
            runStats: [formattedData],
          };

          return userData;
        }
      } catch (err) {
        console.log(err);
      }
    },
  },
};
