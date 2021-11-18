const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const filterObj = (Obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(Obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = Obj[el];
    }
  });
  return newObj;
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This Route is not yet defined, Please Use SignUp insted!',
  });
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //1) create Error if user try to update password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This Route is not for password update, Please use /updatePassword instead!',
        400
      )
    );
  }

  //2) Filter uot unwanted fields name that are not allowed to be update
  const filteredBody = filterObj(req.body, 'name', 'email');

  //3) Update the current User

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  // user.name = 'Jonas';
  // await user.save();
  //cant use it this time because it require more argument such as password etc.
  //we use findByIdAndUpdate this time as it does not require password and gives no error
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

//if user again signUp with his email his active will be set to true
//yet to be implemented
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  //Send Responces

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestedTime,
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate({ path: 'blogs' });

  if (!user) {
    return next(new AppError('No User found with that Id!', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError('No User Found with this Id!', 404));
  }

  res.status(200).json({
    status: 'success',
    body: {
      user,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) return next(new AppError('No User found with that Id!', 404));

  res.status(204).json({
    status: 'success',
    message: null,
  });
});
