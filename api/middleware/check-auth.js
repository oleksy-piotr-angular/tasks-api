const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    /* First we need to get our token from the Header below | we need to set the token with 'Bearer' (some kind of convention)*/
    const token = req.headers.authorization.split(' ')[1];
    //console.log(token);
    /* below we use verify() method | jwt.verify(token, secretOrPublicKey, [options, callback])
     *### this method do both verified and return decoded token if will succeeds ###*/
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.userData = decoded;// add new field to request after verify user token
    //console.log(decoded);
    next(); // Continue whole process after authorization
  } catch (err) {
    return res.status(401).json({
      //HTTP Status means  "Unauthorized response status code indicates that the client request has not been completed because it lacks valid authentication credentials for the requested resource."
      message: 'Auth failed',
    });
  }
};
