const jwt = require('jsonwebtoken');
const { CustomError } = require('./errorHandler');
const User = require('../models/User');
const config = require('../config');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new CustomError('Not authorized to access this route', 401);
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        throw new CustomError('User not found', 404);
      }

      next();
    } catch (error) {
      throw new CustomError('Not authorized to access this route', 401);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { protect };
