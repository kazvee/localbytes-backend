const uuid = require('uuid').v4; // or const { v4: uuidv4 } = require('uuid')

const HttpError = require('../models/http-error');

const DUMMY_PLACES = [
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

const createPlace = (req, res, next) => {
  const { title, description, coordinates, address, creator } = req.body;
  // shorthand instead of const title = req.body.title for every property (description, coordinates, etc.)
  const createdPlace = {
    id: uuid(),
    title, // title: title
    description,
    location: coordinates,
    address,
    creator,
  };

  DUMMY_PLACES.push(createdPlace); // unshift(createdPlace) to add as the first element

  res.status(201).json({ place: createdPlace });
};

const updatePlace = (req, res, next) => {
  const { title, description } = req.body;
  const placeId = req.params.pid;

  const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) };
  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);
  updatedPlace.title = title;
  updatedPlace.description = description;

  DUMMY_PLACES[placeIndex] = updatedPlace;

  res.status(200).json({ place: updatedPlace });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
