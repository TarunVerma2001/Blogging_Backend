const Comment = require('../models/commentModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllComments = catchAsync(async (req, res, next) => {
  let filter = {};

  if (req.params.blogId) filter = { blog: req.params.blogId };

  const comments = await Comment.find(filter);

  res.status(200).json({
    status: 'success',
    data: {
      comments,
    },
  });
});

exports.setBlogAnduserId = (req, res, next) => {
  //allow nested routes

  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.blog) req.body.blog = req.params.blogId;

  next();
};

exports.createComment = catchAsync(async (req, res, next) => {
  const newComment = await Comment.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      newComment,
    },
  });
});
