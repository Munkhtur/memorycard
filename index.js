const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const middleware = require('./utils/middleware');
const cardsRouter = require('./controllers/cards');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);

app.use('/api/cards', cardsRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`Server started on ${PORT}`));
