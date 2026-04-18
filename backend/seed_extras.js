const mongoose = require('mongoose');
const Team = require('./models/Team');
const Player = require('./models/Player');
const Coach = require('./models/Coach');
const Stadium = require('./models/Stadium');
const Injury = require('./models/Injury');

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sportstat';

async function seedExtras() {
  // Minden csapatot lekérünk névsorban (a seed.js-ben rögzített sorrendben)
  const allTeams = await Team.find().sort({ createdAt: 1 }).lean();
  const players = await Player.find().limit(8).lean();

  if (allTeams.length === 0 || players.length === 0) {
    console.log('Nincs elegendő alap adat (Team/Player) a minta feltöltéshez.');
    return;
  }

  // Csapatokat név szerint indexeljük a biztos hivatkozáshoz
  const teamByName = {};
  allTeams.forEach((t) => { teamByName[t.name] = t._id; });

  // Stadionok – minden NB1 csapat saját stadionja
  await Stadium.deleteMany({});
  await Stadium.insertMany([
    {
      name: 'Győri Audi ETO Park',
      city: 'Győr',
      capacity: 12700,
      openedYear: 2011,
      surface: 'grass',
      address: 'Győr, Illyés Gyula út 6.',
      teams: [teamByName['Győri ETO FC']],
      averageAttendance: 5200
    },
    {
      name: 'Groupama Aréna',
      city: 'Budapest',
      capacity: 22000,
      openedYear: 2014,
      surface: 'grass',
      address: 'Budapest XIV., Üllői út 129.',
      teams: [teamByName['Ferencvárosi TC']],
      averageAttendance: 14500
    },
    {
      name: 'ZTE Aréna',
      city: 'Zalaegerszeg',
      capacity: 9800,
      openedYear: 2002,
      surface: 'grass',
      address: 'Zalaegerszeg, Košice u. 2.',
      teams: [teamByName['Zalaegerszegi TE FC']],
      averageAttendance: 4100
    },
    {
      name: 'Nagyerdei Stadion',
      city: 'Debrecen',
      capacity: 20340,
      openedYear: 2014,
      surface: 'grass',
      address: 'Debrecen, Nagyerdei körút 10.',
      teams: [teamByName['Debreceni VSC']],
      averageAttendance: 10200
    },
    {
      name: 'Paksi FC Stadion',
      city: 'Paks',
      capacity: 5000,
      openedYear: 2003,
      surface: 'grass',
      address: 'Paks, Fehérhegyi út 9.',
      teams: [teamByName['Paksi FC']],
      averageAttendance: 3500
    },
    {
      name: 'Pancho Aréna',
      city: 'Felcsút',
      capacity: 3816,
      openedYear: 2014,
      surface: 'grass',
      address: 'Felcsút, Fő utca 176.',
      teams: [teamByName['Puskás Akadémia FC']],
      averageAttendance: 2800
    },
    {
      name: 'Várkerti Stadion',
      city: 'Kisvárda',
      capacity: 5000,
      openedYear: 2019,
      surface: 'grass',
      address: 'Kisvárda, Petőfi utca 4.',
      teams: [teamByName['Kisvárda FC']],
      averageAttendance: 2900
    },
    {
      name: 'Szusza Ferenc Stadion',
      city: 'Budapest',
      capacity: 13501,
      openedYear: 1922,
      surface: 'grass',
      address: 'Budapest IV., Megyeri út 13.',
      teams: [teamByName['Újpest FC']],
      averageAttendance: 6800
    },
    {
      name: 'Városi Stadion Nyíregyháza',
      city: 'Nyíregyháza',
      capacity: 14000,
      openedYear: 2019,
      surface: 'grass',
      address: 'Nyíregyháza, Búza utca 2.',
      teams: [teamByName['Nyíregyháza Spartacus FC']],
      averageAttendance: 4600
    },
    {
      name: 'Hidegkuti Nándor Stadion',
      city: 'Budapest',
      capacity: 8000,
      openedYear: 2016,
      surface: 'grass',
      address: 'Budapest XIV., Salgótarjáni út 12–14.',
      teams: [teamByName['MTK Budapest']],
      averageAttendance: 3900
    },
    {
      name: 'DVTK Stadion',
      city: 'Miskolc',
      capacity: 13500,
      openedYear: 2017,
      surface: 'grass',
      address: 'Miskolc, Kassai út 41.',
      teams: [teamByName['Diósgyőri VTK']],
      averageAttendance: 5700
    },
    {
      name: 'Kazincbarcikai SC Stadion',
      city: 'Kazincbarcika',
      capacity: 3800,
      openedYear: 2020,
      surface: 'grass',
      address: 'Kazincbarcika, Egressy Béni út 1.',
      teams: [teamByName['Kazincbarcika SC']],
      averageAttendance: 1900
    }
  ]);
  console.log('Stadion adatok frissítve (12 NB1 stadion).');

  // Edzők – csak ha még nincsenek
  const coachCount = await Coach.countDocuments();
  if (coachCount === 0) {
    await Coach.insertMany([
      {
        name: 'Horváth Ferenc',
        email: 'horvath.ferenc@sportstat.local',
        nationality: 'Magyar',
        specialization: 'head_coach',
        experience: 12,
        currentTeam: teamByName['Győri ETO FC'],
        joinDate: new Date('2024-07-01'),
        licenses: ['UEFA Pro'],
        isActive: true
      },
      {
        name: 'Szerhij Rebrov',
        email: 'rebrov.szerhij@sportstat.local',
        nationality: 'Ukrán',
        specialization: 'head_coach',
        experience: 15,
        currentTeam: teamByName['Ferencvárosi TC'],
        joinDate: new Date('2023-01-15'),
        licenses: ['UEFA Pro'],
        isActive: true
      },
      {
        name: 'Boér Gábor',
        email: 'boer.gabor@sportstat.local',
        nationality: 'Magyar',
        specialization: 'head_coach',
        experience: 8,
        currentTeam: teamByName['Zalaegerszegi TE FC'],
        joinDate: new Date('2024-02-01'),
        licenses: ['UEFA A'],
        isActive: true
      },
      {
        name: 'Mátyus János',
        email: 'matyus.janos@sportstat.local',
        nationality: 'Magyar',
        specialization: 'head_coach',
        experience: 10,
        currentTeam: teamByName['Debreceni VSC'],
        joinDate: new Date('2023-06-01'),
        licenses: ['UEFA Pro'],
        isActive: true
      },
      {
        name: 'Bognár György',
        email: 'bognar.gyorgy@sportstat.local',
        nationality: 'Magyar',
        specialization: 'head_coach',
        experience: 20,
        currentTeam: teamByName['Paksi FC'],
        joinDate: new Date('2022-07-01'),
        licenses: ['UEFA Pro'],
        isActive: true
      },
      {
        name: 'Horváth Csaba',
        email: 'horvath.csaba@sportstat.local',
        nationality: 'Magyar',
        specialization: 'head_coach',
        experience: 9,
        currentTeam: teamByName['Puskás Akadémia FC'],
        joinDate: new Date('2023-07-01'),
        licenses: ['UEFA A'],
        isActive: true
      }
    ]);
    console.log('Edző minták feltöltve.');
  } else {
    console.log('Edző adatok már léteznek, kihagyva.');
  }

  // Sérülések – csak ha még nincsenek; javított ékezetekkel
  const injuryCount = await Injury.countDocuments();
  if (injuryCount === 0) {
    await Injury.insertMany([
      {
        player: players[0]._id,
        injuryType: 'Combizom-húzódás',
        bodyPart: 'Comb',
        severity: 'moderate',
        startDate: new Date('2026-04-02'),
        expectedReturn: new Date('2026-04-30'),
        isRecovered: false,
        notes: 'Rehabilitáció folyamatban.'
      },
      {
        player: players[1]._id,
        injuryType: 'Bokaficam',
        bodyPart: 'Boka',
        severity: 'severe',
        startDate: new Date('2026-03-18'),
        expectedReturn: new Date('2026-05-20'),
        isRecovered: false,
        notes: 'Terhelés fokozatosan emelhető.'
      },
      {
        player: players[2]._id,
        injuryType: 'Izomfáradás',
        bodyPart: 'Vádli',
        severity: 'minor',
        startDate: new Date('2026-04-10'),
        expectedReturn: new Date('2026-04-19'),
        isRecovered: false
      },
      {
        player: players[3]._id,
        injuryType: 'Térdfájdalom',
        bodyPart: 'Térd',
        severity: 'minor',
        startDate: new Date('2026-02-10'),
        actualReturn: new Date('2026-03-02'),
        isRecovered: true
      }
    ]);
    console.log('Sérülés minták feltöltve.');
  } else {
    console.log('Sérülés adatok már léteznek, kihagyva.');
  }
}

mongoose
  .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('MongoDB connected (extras seeding)');
    await seedExtras();
    process.exit(0);
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });