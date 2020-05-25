const usersRouter = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

usersRouter.post('/', async (req, res) => {
  const { username, password } = req.body;
  const salt = 10;
  const passwordHash = await bcrypt.hash(password, salt);

  const user = new User({
    username,
    passwordHash,
  });

  try {
    const savedUser = await user.save();
    const userForToken = {
      username: savedUser.username,
      id: savedUser._id,
    };
    const token = jwt.sign(userForToken, process.env.SECRET);
    res.status(200).send({ token, username: user.username, id: savedUser._id });
  } catch (error) {
    res.status(400).json({
      error: 'Something is wrong',
    });
  }
});

usersRouter.get('/', async (req, res) => {
  const decodedToken = jwt.verify(req.token, process.env.SECRET);
  const user = await User.findById(decodedToken.id).populate('cards', {
    question: 1,
    answer: 1,
  });
  console.log(user);
  res.json(user.toJSON());
});

module.exports = usersRouter;
