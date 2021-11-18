const express = require('express');
const authController = require('../controllers/authController');
const blogController = require('../controllers/blogController');
const blogLikesController = require('../controllers/blogLikesController');
const commentRouter = require('../routes/commentRoutes');
const multer = require('../utils/multer');
const router = express.Router();

router.use('/:blogId/comments', commentRouter);

router.patch(
  '/updateLikes',
  authController.protect,
  blogLikesController.updateLikes
);

router.post(
  '/likedByUser',
  authController.protect,
  blogLikesController.likedByUser
);


router.post(
  '/uploadImage',
  authController.protect,
  multer.single('image'),
  blogController.uploadImage
);

router
  .route('/')
  .get(blogController.getAllBlogs)
  .post(
    authController.protect,
    authController.restrictTo('user', 'admin'),
    blogController.createBlog
  );

router
  .route('/:id')
  .get(blogController.getBlog)
  .patch(blogController.updateBlog);

module.exports = router;
