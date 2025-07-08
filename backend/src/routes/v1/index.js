const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const chatRoute = require('./chat.route');
const therapistRoute = require('./therapist.route');
const communityRoute = require('./community.route');
const ratingRoute = require('./rating.route');
const analyticsRoute = require('./analytics.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/chat',
    route: chatRoute,
  },
  {
    path: '/therapists',
    route: therapistRoute,
  },
  {
    path: '/community',
    route: communityRoute,
  },
  {
    path: '/ratings',
    route: ratingRoute,
  },
  {
    path: '/analytics',
    route: analyticsRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
