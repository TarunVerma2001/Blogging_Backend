const mongoose = require('mongoose');

const blogSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A blog must have a title'],
    },
    description: {
      type: String,
      required: [true, 'A blog must have a description!'],
    },
    image: {
      type: String,
      required: [true, 'A blog must have an image!'],
    },
    body: String,
    createAt: {
      type: Date,
      default: Date.now,
    },
    tag: {
      type: String,
      required: [true, 'A blog must have a tag!'],
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A Blog must have an author!'],
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* don't get confuse between virtual populate and normal populate 
 Normal Populate -> Here Just you have to populate the data you defined in your own schema 
                    like author is Here from User database and you want to populate so you
                    just have to call using path : "author (u defined above) and just select what
                    properties you want to expand in your response"
 Virtual Populate -> This is a special type of populate 
                     in which you use one thing here without knowing each other 
                     example -> you have used blogId "xyz" and thus that blog with blogId "xyz" can call out all the comments
                     which used blogId "xyz" and get its all detail as per you want you can use middleware here to filter out properties or if response is not big you can also handle it in front-end part Thanks for visiting
*/

// pre hooks

// blogSchema.pre(/^find/, function (next) {
//   this.populate({ path: 'author', select: 'name' });
//   next();
// });

//virtula populate

blogSchema.virtual('comments', {
  ref: 'Comment',
  foreignField: 'blog',
  localField: '_id',
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
