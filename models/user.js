const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const crypto = require("crypto");
const config = require("../config");

const User = new Schema({
  username: String,
  password: String,
  admin: { type: Boolean, default: false }
});

// create new User document
User.statics.create = function(username, password) {
  const encrypted = crypto
    .createHmac("sha1", config.secret)
    .update(password)
    .digest("base64");

  const user = new this({
    username,
    password: encrypted
  });

  // return the Promise. 객체 생성하는 save() 가 Promise
  return user.save();
};

// find one user by using username
// exec(), when using mongoose, documents can be retrieved using helpers.
// Every model method that accepts query conditions can be executed by means of a callback
// or the exec method
User.statics.findOneByUsername = function(username) {
  return this.findOne({
    username
  }).exec();
};

// verify the password of the User document
User.methods.verify = function(password) {
  const encrypted = crypto
    .createHmac("sha1", config.secret)
    .update(password)
    .digest("base64");
  return this.password === encrypted;
};

User.methods.assignAdmin = function() {
  console.log("assignAdmin", this.username);
  this.admin = true;
  console.log("assignAdmin admin=", this.admin);
  return this.save();
};

module.exports = mongoose.model("User", User);
