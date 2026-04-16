const team = await Team.findById(teamId)
  .populate('manager')
  .populate('stadium');

const player = await Player.findById(playerId)
  .populate('team');

const team = await Team.findById(teamId)
  .populate('manager')
  .populate('coaches')
  .populate('players')
  .populate('stadium');

const game = await Game.findById(gameId)
  .populate('homeTeam')
  .populate('awayTeam')
  .populate('stadium')
  .populate('season')
  .populate('playerStats');

 const game = await Game.findById(gameId)
  .populate({
    path: 'playerStats',
    populate: { 
      path: 'playerId',
      select: 'name position jerseyNumber stats'
    }
  })
  .populate('homeTeam')
  .populate('awayTeam');

  const player = await Player.findById(playerId)
  .populate({
    path: 'team',
    populate: { 
      path: 'stadium',
      select: 'name capacity city'
    }
  });

  const team = await Team.findById(teamId)
  .populate({
    path: 'players',
    select: 'name position jerseyNumber stats'
  });

const team = await Team.findById(teamId)
  .populate({
    path: 'coaches',
    select: 'name specialization -biography'
  });

const team = await Team.findById(teamId)
  .populate({
    path: 'players',
    options: { sort: { jerseyNumber: 1 } }
  });

 const season = await Season.findById(seasonId);
const games = await Game.find({ season: season._id })
  .populate('homeTeam')
  .populate('awayTeam')
  .sort({ date: -1 });

 const player = await Player.findById(playerId);
const activeContract = await Contract.findOne({
  playerId: player._id,
  isActive: true
}).populate('teamId');

const player = await Player.findById(playerId);
const activeInjury = await Injury.findOne({
  playerId: player._id,
  status: 'active'
});

if (activeInjury) {
  console.log(`${player.name} sérült: ${activeInjury.injuryName}`);
} else {
  console.log(`${player.name} egészséges`);
}

const team = await Team.findById(teamId);
const recentGames = await Game.find({
  $or: [{ homeTeam: team._id }, { awayTeam: team._id }],
  status: 'finished'
})
  .populate(['homeTeam', 'awayTeam'])
  .sort({ date: -1 })
  .limit(10);

 const playerId = "507f1f77bcf86cd799439011";

const [player, contracts, injuries, recentStats] = await Promise.all([
  Player.findById(playerId).populate('team'),
  Contract.find({ playerId }).populate('teamId'),
  Injury.find({ playerId }).sort({ injuryDate: -1 }),
  PlayerGameStat.find({ playerId }).sort({ createdAt: -1 }).limit(10)
]);

console.log(`Játékos: ${player.name}`);
console.log(`Jelenlegi csapat: ${player.team.name}`);
console.log(`Szerződések száma: ${contracts.length}`);
console.log(`Aktív sérülések: ${injuries.filter(i => i.status === 'active').length}`);

const avgRating = recentStats.reduce((sum, stat) => sum + stat.rating, 0) / recentStats.length;
console.log(`Átlagos rating: ${avgRating.toFixed(2)}`);

const teamId = "507f1f77bcf86cd799439012";

const [team, recentGames, playerStats] = await Promise.all([
  Team.findById(teamId)
    .populate('manager')
    .populate('coaches')
    .populate('players')
    .populate('stadium'),
  Game.find({ $or: [{ homeTeam: teamId }, { awayTeam: teamId }], status: 'finished' })
    .populate(['homeTeam', 'awayTeam'])
    .sort({ date: -1 })
    .limit(10),
  PlayerGameStat.find({ teamId })
    .sort({ createdAt: -1 })
    .limit(50)
]);

console.log(`Csapat: ${team.name}`);
console.log(`Főedző: ${team.manager.name}`);
console.log(`Játékosok száma: ${team.players.length}`);
console.log(`Stadion: ${team.stadium.name}`);

let goalsFor = 0, goalsAgainst = 0;
recentGames.forEach(game => {
  if (game.homeTeam._id.equals(teamId)) {
    goalsFor += game.homeTeamGoals;
    goalsAgainst += game.awayTeamGoals;
  } else {
    goalsFor += game.awayTeamGoals;
    goalsAgainst += game.homeTeamGoals;
  }
});

console.log(`Szerzett gólok (utolsó 10): ${goalsFor}`);
console.log(`Kapott gólok (utolsó 10): ${goalsAgainst}`);

app.get('/api/games/:gameId', async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId)
      .populate({
        path: 'homeTeam',
        populate: { path: 'manager stadium' }
      })
      .populate({
        path: 'awayTeam',
        populate: { path: 'manager stadium' }
      })
      .populate({
        path: 'playerStats',
        populate: [
          { path: 'playerId', select: 'name position jerseyNumber stats' },
          { path: 'teamId', select: 'name' }
        ]
      })
      .populate('season')
      .populate('stadium');

    if (!game) {
      return res.status(404).json({ error: 'Mérkőzés nem található' });
    }

    res.json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/teams/:teamId', async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId)
      .populate('manager')
      .populate('coaches')
      .populate({
        path: 'players',
        select: 'name position jerseyNumber stats injuryStatus',
        options: { sort: { jerseyNumber: 1 } }
      })
      .populate('stadium');

    if (!team) {
      return res.status(404).json({ error: 'Csapat nem található' });
    }

    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/players/:playerId', async (req, res) => {
  try {
    const player = await Player.findById(req.params.playerId)
      .populate('team');

    if (!player) {
      return res.status(404).json({ error: 'Játékos nem található' });
    }

    const activeContract = await Contract.findOne({
      playerId: req.params.playerId,
      isActive: true
    }).populate('teamId');

    const injuries = await Injury.find({ playerId: req.params.playerId })
      .sort({ injuryDate: -1 });

    const recentStats = await PlayerGameStat.find({ playerId: req.params.playerId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      player,
      activeContract,
      injuries,
      recentStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/seasons/:seasonId', async (req, res) => {
  try {
    const season = await Season.findById(req.params.seasonId);

    if (!season) {
      return res.status(404).json({ error: 'Szezon nem található' });
    }

    const games = await Game.find({ season: req.params.seasonId })
      .populate(['homeTeam', 'awayTeam'])
      .sort({ date: 1 });

    const standings = await Game.aggregate([
      { $match: { season: ObjectId(req.params.seasonId), status: 'finished' } },
      {
        $group: {
          _id: '$homeTeam',
          wins: { $sum: { $cond: [{ $gt: ['$homeTeamGoals', '$awayTeamGoals'] }, 1, 0] } },
          losses: { $sum: { $cond: [{ $lt: ['$homeTeamGoals', '$awayTeamGoals'] }, 1, 0] } },
          goalsFor: { $sum: '$homeTeamGoals' },
          goalsAgainst: { $sum: '$awayTeamGoals' }
        }
      },
      { $sort: { wins: -1 } }
    ]);

    const standings_with_teams = await Team.populate(standings, { path: '_id' });

    res.json({
      season,
      games,
      standings: standings_with_teams
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Csak szükséges mezőket betölteni
await Team.findById(id).populate({
  path: 'players',
  select: 'name position jerseyNumber'
});

//Rendezés a populate-ben
await Team.findById(id).populate({
  path: 'players',
  options: { sort: { jerseyNumber: 1 } }
});

//Limit a populate-ben
await Team.findById(id).populate({
  path: 'players',
  options: { limit: 10 }
});

//Indexek használata
db.players.createIndex({ team: 1 });
db.games.createIndex({ homeTeam: 1, awayTeam: 1 });

//Párhuzamos lekérdezések
await Promise.all([
  Player.findById(id),
  Contract.find({ playerId: id }),
  Injury.find({ playerId: id })
]);
  
