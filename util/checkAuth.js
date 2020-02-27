const { AuthenticationError } = require('apollo-server');

const jwt = require('jsonwebtoken');
// const { SECRET } = require('../config');

module.exports = (context) => {
  // inside the context will have authentication headers
  const authHeader = context.req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split('Bearer ')[1]; // remember: 'split' returns an array with 2 items, in this case we want the second item (the auth token which is listed after 'Bearer ')
    if(token) {
      try {
        const user = jwt.verify(token, SECRET);
        return user
      } catch(err) {
        throw new AuthenticationError('Invalid/Expired token');
      }
    } 
    throw new Error('Authentication token must be \'Bearer [token]');
  }
  throw new Error('Authentication header must be provided');
};