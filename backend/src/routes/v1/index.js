const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const chatRoute = require('./chat.route');
const therapistRoute = require('./therapist.route');
const communityRoute = require('./community.route');
const postRoute = require('./post.route');  
const replyRoute = require('./reply.route');
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
    path: '/post',
    route: postRoute,
  },
  {
    path:'/replies',
    route: replyRoute,
  }
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


if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
