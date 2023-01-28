const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../utils/location');
const Place = require('../models/place');
const User = require('../models/user');

const getPlaceById = async (req, res, next) => {
  // could also use
  // function getPlaceById() { ... }
  // or
  // const getPlaceById = function() { ... }
  const placeId = req.params.pid;
  let place;

  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a place! 😕',
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      'Could not find a place for the provided id. ☹️',
      404
    );
    return next(error);
  }

  res.json({ place: place.toObject({ getters: true }) }); // => { place } => { place: place }
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  // let places;
  let userWithPlaces;
  try {
    // places = await Place.find({ creator: userId });
    userWithPlaces = await User.findById(userId).populate('places');
  } catch (err) {
    const error = new HttpError(
      'Fetching places failed, please try again later.😕',
      500
    );
    return next(error);
  }

  // if (!places || places.length === 0) {
  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(
      // could also use throw error instead. return here will ensure no other code executes if this response is sent.
      new HttpError('Could not find places for the provided user id. ☹️', 404)
    );
  }

  res.json({
    // places: places.map((place) => place.toObject({ getters: true })),
    places: userWithPlaces.places.map((place) =>
      place.toObject({ getters: true })
    ),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs provided, please check your data! 🧐', 422)
    );
  }
  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  // shorthand instead of const title = req.body.title for every property (description, coordinates, etc.)
  const createdPlace = new Place({
    title, // title: title
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator,
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError(
      'Failed to create a place, please try again later. 😕',
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      'Could not find a user for the provided id. ☹️',
      404
    );
    return next(error);
  }
  console.log('👉 ', user);

  try {
    const sesh = await mongoose.startSession();
    sesh.startTransaction();
    await createdPlace.save({ session: sesh });
    user.places.push(createdPlace);
    await user.save({ session: sesh });
    await sesh.commitTransaction(); // if all tasks are successful, changes are saved in the DB
  } catch (err) {
    const error = new HttpError(
      'Failed to create a place, please try again later. 😕',
      500
    );
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs provided, please check your data! 🧐', 422)
    );
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place! 😕',
      500
    );
    return next(error);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place! 😕',
      500
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place! 😕',
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      'Could not find a place for the provided id. ☹️',
      404
    );
    return next(error);
  }

  try {
    const sesh = await mongoose.startSession();
    sesh.startTransaction();
    await place.remove({ session: sesh });
    place.creator.places.pull(place);
    await place.creator.save({ session: sesh });
    await sesh.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place! 😕',
      500
    );
    return next(error);
  }

  res.status(200).json({ message: 'Deleted place! 🫥' });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
