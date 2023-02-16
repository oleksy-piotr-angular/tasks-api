const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); //Add bcrypt to password encryption
const jwt = require('jsonwebtoken'); // Add JWT to keep information between client and server(token will be save in MongoDB but will be overwrite each time that user will be login [we use it because session are not possible in this API because RESTful API is stateless]) that user is log in
const checkAuth = require('../middleware/check-auth');//we need Authorize if we want to remove user by himself

const User = require('../models/user');

const UsersController = require('../controllers/users');

//create account
router.post('/signup', UsersController.user_signup);

//login
router.post('/login', UsersController.user_login);

//delete
router.delete('/deleteUser', checkAuth, UsersController.user_delete);

module.exports = router;
