module.exports.validateRegisterInput = (
  name,
  username,
  email,
  password,
  confirmPassword,
  location,
  avatar
) => {
  const errors = {};
  if (name.trim() === '') {
    errors.name = 'Name must not be empty';
  }
  if (name.length > 20) {
    errors.nameLength = 'Name must not be longer than 20 characters';
  }
  if (username.trim() === '') {
    errors.username = 'Username must not be empty';
  }
  if (username.length > 10) {
    errors.usernameLength = 'Username must not be longer than 10 characters';
  }
  if (email.trim() === '') {
    errors.email = 'Email must not be empty';
  } else {
    const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
    if (!email.match(regEx)) {
      errors.email = 'Email must be a valid email address';
    }
  }
  if (password === '') {
    errors.password = 'Password must not be empty';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords must match';
  }
  if (location === '') {
    errors.location = 'Location must not be empty';
  }
  if (location.length > 20) {
    errors.locationLength = 'Location must not be longer than 20 characters';
  }
  if (avatar === '') {
    errors.avatar = 'An avatar must be selected';
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateLoginInput = (username, password) => {
  const errors = {};
  if (username.trim() === '') {
    errors.username = 'Username must not be empty';
  }
  if (password.trim() === '') {
    errors.password = 'Password must not be empty';
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};
