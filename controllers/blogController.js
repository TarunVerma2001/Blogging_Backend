const Blog = require('../models/blogModel');
const BlogLikes = require('../models/blogLikesModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const cloudinary = require('../utils/cloudinary');

exports.getAllBlogs = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Blog.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const blog = await features.query.populate({
    path: 'author',
    select: 'name',
  });

  res.status(200).json({
    status: 'success',
    length: blog.length,
    data: {
      blog,
    },
  });
});

exports.getBlog = catchAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id).populate({
    path: 'comments',
  });

  if (!blog) return next(new AppError('No blog found with this ID!', 404));

  res.status(200).json({
    status: 'success',
    data: {
      blog,
    },
  });
});

exports.uploadImage = catchAsync(async (req, res, next) => {
  const result = await cloudinary.uploader.upload(req.file.path);
  res.status(201).json({
    status: 'success',
    url: result.secure_url,
  });
});

exports.createBlog = catchAsync(async (req, res, next) => {
  req.body.author = req.user.id;

  const blog = await Blog.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      blog,
    },
  });
});

exports.updateBlog = catchAsync(async (req, res, next) => {
  const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: false,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedBlog,
    },
  });
});

exports.deleteBlog = catchAsync(async (req, res, next) => {
  await Blog.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});



// // aggregation pipeline

// exports.getLikes = catchAsync(async (req, res, next) => {
//   const stats = await BlogLikes.aggregate([
//     {
//       $group: {
//         _id: '$blog',
//         numLikes: { $sum: 1 },
//       },
//     },
//   ]);


//   res.status(200).json({
//     status: 'success',
//     data: {
//       stats
//     }
//   })
// });
