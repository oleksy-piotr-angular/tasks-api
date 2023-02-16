const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); //Add bcrypt to password encryption
const jwt = require('jsonwebtoken'); // Add JWT to keep information between client and server(token will be save in MongoDB but will be overwrite each time that user will be login [we use it because session are not possible in this API because RESTful API is stateless]) that user is log in

const User = require('../models/user');

exports.user_signup = (req, res, next) => {
  const saltRound = 10; // cost factor.(more hashing more rounds)

  User.find({ email: req.body.email }) /* check if email not exist in storage */
    .exec() /* thanks this method we can use Promise methods */
    .then((user) => {
      //we always get an array but we need to check if it's empty
      if (user.length >= 1) {
        return res.status(422).json({
          message: 'Cannot create - email account exists in storage',
        });
      } else {
        //email not found - can create new Account
        bcrypt.hash(req.body.password, saltRound, (err, hash) => {
          if (err) {
            //Some kind of Internal Server Error happen
            return res.status(500).json({
              //HTTP Status means "Internal Server Error"
              error: err,
            });
          } else {
            //hash done properly => create new User
            const user = new User({
              _id: mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash,
            });
            //save User account below
            user
              .save()
              .then((result) => {
                //No Error (Resolved)
                console.log(result);
                res.status(201).json({
                  //HTTP Status means "Created"
                  message: 'User created',
                });
              })
              .catch((err) => {
                //some error happen when we try to create an 'Account'(Rejected)
                console.log(err);
                res.status(500).json({
                  //HTTP Status means "Internal Server Error"
                  error: err,
                });
              });
          }
        });
      }
    });
};

exports.user_login = (req, res, next) => {
  User.find({ email: req.body.email })
    .exec() /* thanks this method we can use Promise methods */
    .then((user) => {
      if (user.length < 1) {
        //we received array so we check if it's empty
        return res.status(401).json({
          //HTTP Status means  "Unauthorized response status code indicates that the client request has not been completed because it lacks valid authentication credentials for the requested resource."
          message: 'Auth fails',
        });
      } else {
        //check if taken password from body and hash from storage compare each other
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
          if (err) {
            // we get if comparison generally fails | if it was not compared  we not receive this error
            return res.status(401).json({
              //HTTP Status means  "Unauthorized response"
              message: 'Auth failed',
            });
          }
          if (result) {
            //if we not have an error and hash was compered successfully we log in
            const token = jwt.sign(
              {
                email: user[0].email,
                userId: user[0]._id,
              },
              process.env.JWT_KEY,
              { expiresIn: '1h' }
            );
            /**
             *above JWT will store encrypted information about Log In Session | create Token
             * process.env.JWT_KEY - is stored in "nodemon.json" file
             */
            return res.status(200).json({
              message: 'Auth successful',
              sessionToken: token,
            });
          }
          res.status(401).json({
            // we respond if password was incorrect
            message: 'Auth failed',
          });
        });
      }
    })
    .catch((err) => {
      //catch an error when we try to find Id to Log In
      message: 'Auth failed';
    });
};

exports.user_delete = (req, res, next) => {
  User.find({ _id: req.userData.userId })
    .exec() /* thanks this method we can use Promise methods */
    .then((user) => {
      if (user.length >= 1) {
        User.deleteOne({
          _id: req.userData.userId,
        })
          .exec() // Return a promise to use then(), catch() methods
          .then((result) => {
            res.status(200).json({
              message: 'User deleted successfully',
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({
              //HTTP Status means "Internal Server Error"
              error: err,
            });
          });
      } else {
        return res.status(404).json({
          //HTTP Status means "Not Found"
          message: 'Cannot remove - User not found',
        });
      }
    })
    .catch((err) => {
      //some error happen when we try to find Id to remove an 'Account'(Rejected)
      console.log(err);
      res.status(500).json({
        //HTTP Status means "Internal Server Error"
        error: err,
      });
    });
};