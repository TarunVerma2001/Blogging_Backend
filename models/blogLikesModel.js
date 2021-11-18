const mongoose = require('mongoose');

const blogLikesSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'A Like must have a user!'],
    },
    blog: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'A Like must have a blog!'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const BlogLikes = mongoose.model('BlogLikes', blogLikesSchema);

module.exports = BlogLikes;
