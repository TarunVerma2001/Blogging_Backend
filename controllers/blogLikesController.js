const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const BlogLikes = require('../models/blogLikesModel');
const Blog = require('../models/blogModel');
const mongoose = require('mongoose');
// exports.updateLike = catchAsync(async (req, res, next) => {
//   if (!req.body.user) req.body.user = req.user.id;
//   if (!req.body.blog) req.body.blog = req.params.blogId;
//   var present = await BlogLikes.findOne(req.body);

//   var response;
//   if (present) {
//     response = await BlogLikes.deleteOne(req.body);
//     res.status(204).json({
//       status: 'success',
//       data: null,
//     });
//   } else {
//     response = await BlogLikes.create(req.body);
//     res.status(201).json({
//       status: 'success',
//       data: {
//         response,
//       },
//     });
//   }
// });

exports.likedByUser = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;

  var present = await BlogLikes.findOne(req.body);

  if (present) {
      res.status(200).json({
        status: 'success',
        data: {
            liked: true
        },
      });
  } else{
    res.status(200).json({
        status: 'success',
        data: {
            liked: false
        },
      });
  }
});

exports.updateLikes = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;

  var present = await BlogLikes.findOne(req.body);

  const session = await mongoose.startSession();

  if (present) {
    await session.withTransaction(async () => {
      await BlogLikes.findOneAndDelete(req.body);
      var blog = await Blog.findById(req.body.blog);
      blog.likes = blog.likes - 1;
      await blog.save({
        runValidators: false,
        new: true,
      });
    });
  } else {
    const response = await session.withTransaction(async () => {
      await BlogLikes.create(req.body);
      var blog = await Blog.findById(req.body.blog);
      blog.likes = blog.likes + 1;
      await blog.save({
        runValidators: false,
        new: true,
      });
    });
  }

  session.endSession();

  res.status(200).json({
    status: 'success',
    data: null,
  });
});
