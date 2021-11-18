const User = require('../models/userModel');
const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');
const { promisify } = require('util');
//creates json web token

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

//sends token

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1) check if user email and paswword exist
  if (!email || !password) {
    return next(new AppError('Please provide an email and password!', 400));
  }
  //2) chef if user exist && password is correct

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or Password!', 401));
  }

  //3) if everything is ok then send the token

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //1) getting the token && checking if it exist
  let token;
  if (
    (await req.headers.authorization) &&
    (await req.headers.authorization.startsWith('Bearer'))
  ) {
    token = await req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged In!, Please log in to get access!', 401)
    );
  }
  //2) verification token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3) check if user Exist

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('The User beloging to this token does no longer exist!', 401)
    );
  }

  //4) check if user changed the password after token is issued

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'Password recently changed by the User, Please login Again!',
        401
      )
    );
  }

  // GRANT ACCESS to the protected route

  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles is ['admin']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('you do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) get user based on the posted email

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('there is no user with that email address', 404));
  }
  //2) Generate the random reset token

  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false }); // validateBeforeSave: false deactivate all thw validators before saving

  //3)send it to user's email

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot a Password submit a patch request with your new 
  password and your password Confirm to: ${resetURL}.\n If you didn't forgot your password
   please ignore this email!!`;

  try {
    await new sendEmail(user, message).sendPasswordResetMessage();

    res.status(200).json({
      status: 'success',
      message: 'Token Sent to email!!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending back an email, Try again later!'
      ),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) get user based on the token

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2) if token is not expired, user Exist, set the new Password

  if (!user) {
    return next(new AppError('Token is invalid or has expired!', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  //made a new pre 'save' hook

  //3) update the changedPasswordAt property for the user
  await user.save();
  //4) log the user In!
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) get user from the collection
  const user = await User.findById(req.user.id).select('+password');

  if (!user) return next(new AppError('User does not Exist!', 401));

  //2) check if POSTed password is correct

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your Current password is wronge!', 401));
  }

  //3) if So update the password

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  //save the modified results
  await user.save();

  //4) Log In the user send the JWT

  createSendToken(user, 200, res);
});
