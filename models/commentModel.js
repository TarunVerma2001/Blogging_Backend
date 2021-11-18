const mongoose = require('mongoose');

const commentSchema = mongoose.Schema(
  {
    comment: {
      type: String,
      required: [true, 'Comment can not be empty!'],
    },
    blog: {
      type: mongoose.Schema.ObjectId,
      ref: 'Blog',
      required: [true, 'A comment must belongs to a blog!'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A comment must belongs to a user!'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    Likes: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//pre hooks

commentSchema.pre(/^find/, function () {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
