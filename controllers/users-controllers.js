const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const DUMMY_USERS = [
  {
    id: 'u1',
    name: 'Test User1',
    email: 'test1@test.com',
    password: '1testers',
  },
];

const getUsers = (req, res, next) => {
  res.json({ users: DUMMY_USERS });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs provided, please check your data! 🧐', 422)
    );
  }
  const { name, email, password, places } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Signup failed, please try again later. 🧐',
      500
    );

    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      'Signup failed, invalid inputs provided! Please check your data. 🧐',
      422
    );
    return next(error);
  }

  const createdUser = new User({
    name, // name: name
    email,
    image: 'https://picsum.photos/200/300?random=1',
    password,
    places,
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      '❌ Signup failed, please try again later.',
      500
    );
    return next(error);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  const identifiedUser = DUMMY_USERS.find((u) => u.email === email);
  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError(
      'Could not identify user, credentials seem to be wrong! 😕',
      401
    );
  }

  res.json({ message: 'Logged in! 🤠' });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
