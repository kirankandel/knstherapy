const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const requestLogger = require('./middlewares/requestLogger');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');


const app = express();


mongoose.connect(config.mongoose.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// request logging middleware
app.use(requestLogger);

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// v1 api routes
app.use('/v1', routes);

const Post = require('./models/post.model');

app.get('/v1/api/posts/:id', async (req, res, next) => {
  const postId = req.params.id;
  
  try {
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'Post not found' });
    }

    res.status(httpStatus.OK).json(post);
  } catch (error) {
    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving post'));
  }
});

// app.use('/api', postRoutes);
app.use('/v1/categories', require('../src/routes/v1/category.route'));
app.use('/v1/posts', require('./routes/v1/post.route'));
app.use('/v1/replies', require('./routes/v1/reply.route'));
// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
