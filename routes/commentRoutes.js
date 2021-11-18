const express = require('express');

const authController = require('../controllers/authController');
const commentController = require('../controllers/commentController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(commentController.getAllComments)
  .post(
    authController.protect,
    commentController.setBlogAnduserId,
    commentController.createComment
  );

router.route('/:id')

module.exports = router;
