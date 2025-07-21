const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) 
      return res.status(401).json({ message: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(id).select('-password');
    if (!req.user) throw new Error();
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = auth;
