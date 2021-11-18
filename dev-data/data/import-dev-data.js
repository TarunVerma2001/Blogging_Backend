const fs = require('fs');
const mongoose = require('mongoose');

const dotenv = require(`dotenv`);

const User = require('../../models/userModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connection succesful!'));

//READ JSON FILE

const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

//IMPORT DATA IN DB

const importData = async () => {
  try {
    await User.create(users, { validateBeforeSave: false });
    console.log('Data Succesfully Added');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//DELETE DATA FORIM DB

const deleteData = async () => {
  try {
    await User.deleteMany();
    console.log('All Data Succesfully Deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
