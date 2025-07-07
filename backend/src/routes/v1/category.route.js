const express = require('express');
const router = express.Router();
const categoryCtrl = require('../../controllers/category.controller');

router
  .route('/')
  .get(categoryCtrl.getAll)
  .post(categoryCtrl.create);

module.exports = router;
