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

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password'); // could also use 'email name' instead of -password, to include email and name
  } catch (err) {
    const error = new HttpError(
      'Failed to retrieve users, please try again later. ☹️',
      500
    );
    return next(error);
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
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

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Login failed, please try again later. 🧐',
      500
    );

    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError(
      'Login failed! Invalid credentials provided. Please check your inputs and try again! 🧐',
      401
    );
    return next(error);
  }

  res.json({ message: 'Logged in! 🤠' });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
