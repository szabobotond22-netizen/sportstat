const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const teamsRouter = require('./routes/teams');
const playersRouter = require('./routes/players');
const gamesRouter = require('./routes/games');
const { router: authRouter } = require('./routes/auth');


// Import models (automatic loading)
require('./models/User');
require('./models/Team');
require('./models/Player');
require('./models/Game');
require('./models/Coach');
require('./models/Stadium');
require('./models/Season');
require('./models/Contract');
require('./models/Injury');
require('./models/PlayerGameStat');

const app = express();

app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sportstat';

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/teams', teamsRouter);
app.use('/api/players', playersRouter);
app.use('/api/games', gamesRouter);
app.use('/api/auth', authRouter);

app.get('/', (req, res) => res.send('Hello from backend'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
