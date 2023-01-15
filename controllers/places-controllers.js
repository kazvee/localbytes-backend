const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../utils/location');
const Place = require('../models/place');

let DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Empire State Building',
    description: 'World-famous skyscraper!',
    imageUrl: 'https://picsum.photos/200/300?random=1',
    address: '20 W 34th St., New York, NY 10001, USA',
    location: {
      lat: 44.4878108,
      lng: -111.9415355,
    },
    creator: 'u1',
  },
];

const getPlaceById = (req, res, next) => {
  // could also use
  // function getPlaceById() { ... }
  // or
  // const getPlaceById = function() { ... }
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => {
    return p.id === placeId;
  });

  if (!place) {
    throw new HttpError('Could not find a place for the provided id. ☹️', 404);
  }

  res.json({ place }); // => { place } => { place: place }
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter((p) => {
    return p.creator === userId;
  });

  if (!places || places.length === 0) {
    return next(
      // could also use throw error instead. return here will ensure no other code executes if this response is sent.
      new HttpError('Could not find places for the provided user id. ☹️', 404)
    );
  }

  res.json({ places });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Error(s) found on createPlace:', errors);
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
    image: 'https://picsum.photos/200/300?random=1',
    creator,
  });

  try {
    await createdPlace.save();
  } catch (err) {
    const error = new HttpError(
      '❌ Failed to create a place, please try again.',
      500
    );
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Error(s) found on updatePlace:', errors);
    throw new HttpError(
      'Invalid inputs provided, please check your data! 🧐',
      422
    );
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) };
  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);
  updatedPlace.title = title;
  updatedPlace.description = description;

  DUMMY_PLACES[placeIndex] = updatedPlace;

  res.status(200).json({ place: updatedPlace });
};

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;
  if (!DUMMY_PLACES.find((p) => p.id === placeId)) {
    throw new HttpError('Could not find a place for the provided id. ☹️', 404);
  }

  DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId);
  res.status(200).json({ message: 'Deleted place! 🫥' });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
