const cardsRouter = require('express').Router();
const Card = require('../models/card');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

cardsRouter.get('/', async (req, res) => {
  const cards = await Card.find({}).populate('user', { username: 1 });
  res.json(cards.map((card) => card.toJSON()));
});

cardsRouter.post('/', async (req, res) => {
  const { question, answer } = req.body;
  const decodedToken = jwt.verify(req.token, process.env.SECRET);
  if (!req.token || !decodedToken.id) {
    return res.status(401).json({ error: 'Login to add cards' });
  }
  const user = await User.findById(decodedToken.id);
  if (!question || !answer) {
    return res.status(400).json({ error: 'Fields are missing' });
  } else if (question.length > 20 || answer.length > 200) {
    return res.status(400).json({ error: 'Character limit reached' });
  } else {
    const card = new Card({
      question,
      answer,
      user: user._id,
    });
    const savedCard = await card.save();
    user.cards = user.cards.concat(savedCard._id);
    await user.save();
    res.json(savedCard.toJSON());
  }
});

cardsRouter.delete('/:id', async (req, res) => {
  const decodedToken = jwt.verify(req.token, process.env.SECRET);
  const id = req.params.id;
  const card = await Card.findById(id);
  console.log(card);
  const user = await User.findById(decodedToken.id);
  if (card.user.toString() !== decodedToken.id) {
    return res.status(401).json({ error: 'only the creator can delete blogs' });
  }
  try {
    await card.remove();
    user.cards = user.cards.filter((card) => card.id.toString() !== id);
    await user.save();
    res.status(204).end();
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: 'Must be authorized' });
  }
});

module.exports = cardsRouter;
