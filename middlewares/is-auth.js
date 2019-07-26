const jwt = require('jsonwebtoken');
const error = require('../utility')
require('dotenv').config()

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    res.status(401).json({message: 'Not Authenticated'})
    error('Not authenticated.', 401)
  }
  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.secret);
  } catch (err) {
    res.status(500).json({message: 'invalid token'})
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    res.status(401).json({message: 'Not Authenticated'})
    error('Not authenticated.', 401)
  }
  req.userid = decodedToken.userid;
  next();
};
