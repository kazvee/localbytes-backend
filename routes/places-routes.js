const express = require('express');

const HttpError = require('../models/http-error');

const router = express.Router();

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

router.get('/:pid', (req, res, next) => {
  const placeId = req.params.pid;

  const place = DUMMY_PLACES.find((p) => {
    return p.id === placeId;
  });

  if (!place) {
    throw new HttpError('Could not find a place for the provided id. ☹️', 404); // could use next error instead
  }

  res.json({ place }); // => { place } => { place: place }
});

router.get('/user/:uid', (req, res, next) => {
  const userId = req.params.uid;

  const place = DUMMY_PLACES.find((p) => {
    return p.creator === userId;
  });

  if (!place) {
    return next(
      // could also use throw error instead. return here will ensure no other code executes if this response is sent.
      new HttpError('Could not find a place for the provided user id. ☹️', 404)
    );
  }

  res.json({ place });
});

module.exports = router;
