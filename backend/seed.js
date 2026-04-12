const mongoose = require('mongoose');
const Team = require('./models/Team');
const Player = require('./models/Player');
const Game = require('./models/Game');

const seedDatabase = async () => {
  try {
    // Clear existing data
    await Team.deleteMany({});
    await Player.deleteMany({});
    await Game.deleteMany({});

    // NB1 Teams
    const teams = [
      { name: 'Győri ETO FC', sport: 'football', city: 'Győr', founded: 1904 },
      { name: 'Ferencvárosi TC', sport: 'football', city: 'Budapest', founded: 1899 },
      { name: 'Zalaegerszegi TE FC', sport: 'football', city: 'Zalaegerszeg', founded: 1920 },
      { name: 'Debreceni VSC', sport: 'football', city: 'Debrecen', founded: 1902 },
      { name: 'Paksi FC', sport: 'football', city: 'Paks', founded: 1952 },
      { name: 'Puskás Akadémia FC', sport: 'football', city: 'Felcsút', founded: 2005 },
      { name: 'Kisvárda FC', sport: 'football', city: 'Kisvárda', founded: 1911 },
      { name: 'Újpest FC', sport: 'football', city: 'Budapest', founded: 1885 },
      { name: 'Nyíregyháza Spartacus FC', sport: 'football', city: 'Nyíregyháza', founded: 1959 },
      { name: 'MTK Budapest', sport: 'football', city: 'Budapest', founded: 1888 },
      { name: 'Diósgyőri VTK', sport: 'football', city: 'Miskolc', founded: 1910 },
      { name: 'Kazincbarcika SC', sport: 'football', city: 'Kazincbarcika', founded: 1950 }
    ];

    const createdTeams = await Team.insertMany(teams);
    console.log('Teams seeded successfully');

    // Sample players for each team (simplified, real NB1 players would be more)
    const players = [
      // Győri ETO
      { name: 'Ádám Lang', position: 'Defender', jerseyNumber: 22, team: createdTeams[0]._id, age: 29, nationality: 'Hungarian', stats: { gamesPlayed: 25, goals: 2, assists: 1, points: 3, faults: 5, yellowCards: 3, redCards: 0, passes: 450, actions: 120, tackles: 15, saves: 0, minutesPlayed: 2100, rating: 7.5 } },
      { name: 'Dániel Tőzsér', position: 'Midfielder', jerseyNumber: 8, team: createdTeams[0]._id, age: 38, nationality: 'Hungarian', stats: { gamesPlayed: 20, goals: 1, assists: 3, points: 4, faults: 8, yellowCards: 2, redCards: 0, passes: 380, actions: 100, tackles: 10, saves: 0, minutesPlayed: 1800, rating: 7.0 } },
      { name: 'Barnabás Varga', position: 'Goalkeeper', jerseyNumber: 1, team: createdTeams[0]._id, age: 28, nationality: 'Hungarian', stats: { gamesPlayed: 25, goals: 0, assists: 0, points: 0, faults: 0, yellowCards: 0, redCards: 0, passes: 50, actions: 5, tackles: 0, saves: 85, minutesPlayed: 2250, rating: 7.8 } },
      { name: 'Róbert Feczesin', position: 'Forward', jerseyNumber: 9, team: createdTeams[0]._id, age: 30, nationality: 'Hungarian', stats: { gamesPlayed: 22, goals: 8, assists: 4, points: 12, faults: 12, yellowCards: 1, redCards: 0, passes: 200, actions: 80, tackles: 5, saves: 0, minutesPlayed: 1800, rating: 8.2 } },

      // Ferencváros
      { name: 'Endre Botka', position: 'Defender', jerseyNumber: 21, team: createdTeams[1]._id, age: 28, nationality: 'Hungarian', stats: { gamesPlayed: 28, goals: 1, assists: 2, points: 3, faults: 10, yellowCards: 4, redCards: 0, passes: 500, actions: 150, tackles: 20, saves: 0, minutesPlayed: 2400, rating: 7.6 } },
      { name: 'Ádám Bogdán', position: 'Goalkeeper', jerseyNumber: 1, team: createdTeams[1]._id, age: 35, nationality: 'Hungarian', stats: { gamesPlayed: 28, goals: 0, assists: 0, points: 0, faults: 0, yellowCards: 0, redCards: 0, passes: 60, actions: 10, tackles: 0, saves: 95, minutesPlayed: 2520, rating: 8.0 } },
      { name: 'Tokmac Nguen', position: 'Midfielder', jerseyNumber: 10, team: createdTeams[1]._id, age: 29, nationality: 'Norwegian', stats: { gamesPlayed: 25, goals: 5, assists: 7, points: 12, faults: 15, yellowCards: 3, redCards: 0, passes: 600, actions: 200, tackles: 12, saves: 0, minutesPlayed: 2100, rating: 8.5 } },
      { name: 'Myrto Uzuni', position: 'Forward', jerseyNumber: 7, team: createdTeams[1]._id, age: 28, nationality: 'Albanian', stats: { gamesPlayed: 26, goals: 12, assists: 5, points: 17, faults: 18, yellowCards: 2, redCards: 0, passes: 250, actions: 100, tackles: 8, saves: 0, minutesPlayed: 2200, rating: 8.8 } },

      // Zalaegerszeg
      { name: 'Bence Bedi', position: 'Midfielder', jerseyNumber: 10, team: createdTeams[2]._id, age: 26, nationality: 'Hungarian', stats: { gamesPlayed: 24, goals: 3, assists: 4, points: 7, faults: 9, yellowCards: 1, redCards: 0, passes: 400, actions: 130, tackles: 18, saves: 0, minutesPlayed: 2000, rating: 7.4 } },
      { name: 'Norbert Szendrei', position: 'Goalkeeper', jerseyNumber: 1, team: createdTeams[2]._id, age: 24, nationality: 'Hungarian', stats: { gamesPlayed: 24, goals: 0, assists: 0, points: 0, faults: 0, yellowCards: 0, redCards: 0, passes: 40, actions: 5, tackles: 0, saves: 78, minutesPlayed: 2160, rating: 7.7 } },
      { name: 'Yohan Croizet', position: 'Midfielder', jerseyNumber: 6, team: createdTeams[2]._id, age: 32, nationality: 'French', stats: { gamesPlayed: 20, goals: 2, assists: 3, points: 5, faults: 7, yellowCards: 2, redCards: 0, passes: 350, actions: 110, tackles: 14, saves: 0, minutesPlayed: 1700, rating: 7.2 } },
      { name: 'Antonio Mance', position: 'Forward', jerseyNumber: 9, team: createdTeams[2]._id, age: 28, nationality: 'Croatian', stats: { gamesPlayed: 22, goals: 6, assists: 2, points: 8, faults: 11, yellowCards: 3, redCards: 0, passes: 180, actions: 70, tackles: 6, saves: 0, minutesPlayed: 1800, rating: 7.8 } },

      // Debrecen
      { name: 'Erik Kusnyír', position: 'Midfielder', jerseyNumber: 6, team: createdTeams[3]._id, age: 23, nationality: 'Hungarian', stats: { gamesPlayed: 26, goals: 4, assists: 5, points: 9, faults: 8, yellowCards: 1, redCards: 0, passes: 420, actions: 140, tackles: 16, saves: 0, minutesPlayed: 2200, rating: 7.9 } },
      { name: 'Balázs Dzsudzsák', position: 'Midfielder', jerseyNumber: 10, team: createdTeams[3]._id, age: 36, nationality: 'Hungarian', stats: { gamesPlayed: 18, goals: 1, assists: 2, points: 3, faults: 6, yellowCards: 0, redCards: 0, passes: 300, actions: 90, tackles: 8, saves: 0, minutesPlayed: 1400, rating: 7.1 } },
      { name: 'Dušan Lagator', position: 'Goalkeeper', jerseyNumber: 12, team: createdTeams[3]._id, age: 29, nationality: 'Montenegrin', stats: { gamesPlayed: 26, goals: 0, assists: 0, points: 0, faults: 0, yellowCards: 0, redCards: 0, passes: 55, actions: 8, tackles: 0, saves: 82, minutesPlayed: 2340, rating: 7.6 } },
      { name: 'José Cortés', position: 'Forward', jerseyNumber: 9, team: createdTeams[3]._id, age: 25, nationality: 'Colombian', stats: { gamesPlayed: 24, goals: 9, assists: 3, points: 12, faults: 14, yellowCards: 2, redCards: 0, passes: 220, actions: 85, tackles: 7, saves: 0, minutesPlayed: 1900, rating: 8.1 } },

      // Paks
      { name: 'János Szabó', position: 'Defender', jerseyNumber: 5, team: createdTeams[4]._id, age: 34, nationality: 'Hungarian', stats: { gamesPlayed: 23, goals: 1, assists: 1, points: 2, faults: 6, yellowCards: 3, redCards: 0, passes: 380, actions: 120, tackles: 22, saves: 0, minutesPlayed: 2000, rating: 7.3 } },
      { name: 'Péter Szappanos', position: 'Goalkeeper', jerseyNumber: 1, team: createdTeams[4]._id, age: 32, nationality: 'Hungarian', stats: { gamesPlayed: 23, goals: 0, assists: 0, points: 0, faults: 0, yellowCards: 0, redCards: 0, passes: 45, actions: 6, tackles: 0, saves: 75, minutesPlayed: 2070, rating: 7.5 } },
      { name: 'László Zsidai', position: 'Midfielder', jerseyNumber: 10, team: createdTeams[4]._id, age: 40, nationality: 'Hungarian', stats: { gamesPlayed: 20, goals: 2, assists: 4, points: 6, faults: 10, yellowCards: 1, redCards: 0, passes: 320, actions: 100, tackles: 11, saves: 0, minutesPlayed: 1600, rating: 7.0 } },
      { name: 'Barnabás Nagy', position: 'Forward', jerseyNumber: 9, team: createdTeams[4]._id, age: 28, nationality: 'Hungarian', stats: { gamesPlayed: 22, goals: 7, assists: 3, points: 10, faults: 13, yellowCards: 2, redCards: 0, passes: 200, actions: 75, tackles: 5, saves: 0, minutesPlayed: 1800, rating: 7.9 } },

      // Puskás Akadémia
      { name: 'Joachim Andersen', position: 'Defender', jerseyNumber: 5, team: createdTeams[5]._id, age: 27, nationality: 'Danish', stats: { gamesPlayed: 27, goals: 2, assists: 1, points: 3, faults: 7, yellowCards: 2, redCards: 0, passes: 480, actions: 140, tackles: 19, saves: 0, minutesPlayed: 2300, rating: 7.7 } },
      { name: 'László Kleinheisler', position: 'Midfielder', jerseyNumber: 10, team: createdTeams[5]._id, age: 29, nationality: 'Hungarian', stats: { gamesPlayed: 25, goals: 3, assists: 6, points: 9, faults: 12, yellowCards: 3, redCards: 0, passes: 550, actions: 180, tackles: 13, saves: 0, minutesPlayed: 2100, rating: 8.0 } },
      { name: 'Péter Gulácsi', position: 'Goalkeeper', jerseyNumber: 1, team: createdTeams[5]._id, age: 34, nationality: 'Hungarian', stats: { gamesPlayed: 27, goals: 0, assists: 0, points: 0, faults: 0, yellowCards: 0, redCards: 0, passes: 65, actions: 10, tackles: 0, saves: 90, minutesPlayed: 2430, rating: 8.1 } },
      { name: 'Urho Nissilä', position: 'Forward', jerseyNumber: 9, team: createdTeams[5]._id, age: 27, nationality: 'Finnish', stats: { gamesPlayed: 24, goals: 10, assists: 4, points: 14, faults: 16, yellowCards: 1, redCards: 0, passes: 240, actions: 90, tackles: 6, saves: 0, minutesPlayed: 2000, rating: 8.3 } },

      // Kisvárda
      { name: 'Bence Ötvös', position: 'Forward', jerseyNumber: 9, team: createdTeams[6]._id, age: 24, nationality: 'Hungarian', stats: { gamesPlayed: 21, goals: 5, assists: 2, points: 7, faults: 9, yellowCards: 1, redCards: 0, passes: 160, actions: 60, tackles: 4, saves: 0, minutesPlayed: 1700, rating: 7.5 } },
      { name: 'Dániel Vadnai', position: 'Defender', jerseyNumber: 23, team: createdTeams[6]._id, age: 35, nationality: 'Hungarian', stats: { gamesPlayed: 20, goals: 0, assists: 1, points: 1, faults: 5, yellowCards: 2, redCards: 0, passes: 350, actions: 110, tackles: 18, saves: 0, minutesPlayed: 1800, rating: 7.2 } },
      { name: 'Árpád Tordai', position: 'Goalkeeper', jerseyNumber: 1, team: createdTeams[6]._id, age: 31, nationality: 'Hungarian', stats: { gamesPlayed: 21, goals: 0, assists: 0, points: 0, faults: 0, yellowCards: 0, redCards: 0, passes: 50, actions: 7, tackles: 0, saves: 70, minutesPlayed: 1890, rating: 7.4 } },
      { name: 'Yevheniy Makarenko', position: 'Midfielder', jerseyNumber: 6, team: createdTeams[6]._id, age: 32, nationality: 'Ukrainian', stats: { gamesPlayed: 19, goals: 1, assists: 3, points: 4, faults: 8, yellowCards: 2, redCards: 0, passes: 300, actions: 95, tackles: 12, saves: 0, minutesPlayed: 1600, rating: 7.1 } },

      // Újpest
      { name: 'Branko Pauljević', position: 'Midfielder', jerseyNumber: 88, team: createdTeams[7]._id, age: 33, nationality: 'Serbian', stats: { gamesPlayed: 22, goals: 2, assists: 4, points: 6, faults: 11, yellowCards: 3, redCards: 0, passes: 380, actions: 120, tackles: 10, saves: 0, minutesPlayed: 1900, rating: 7.6 } },
      { name: 'Krisztián Simon', position: 'Forward', jerseyNumber: 9, team: createdTeams[7]._id, age: 31, nationality: 'Hungarian', stats: { gamesPlayed: 20, goals: 6, assists: 2, points: 8, faults: 10, yellowCards: 1, redCards: 0, passes: 180, actions: 70, tackles: 5, saves: 0, minutesPlayed: 1600, rating: 7.8 } },
      { name: 'Filip Pajović', position: 'Goalkeeper', jerseyNumber: 1, team: createdTeams[7]._id, age: 30, nationality: 'Serbian', stats: { gamesPlayed: 22, goals: 0, assists: 0, points: 0, faults: 0, yellowCards: 0, redCards: 0, passes: 48, actions: 6, tackles: 0, saves: 76, minutesPlayed: 1980, rating: 7.5 } },
      { name: 'Márton Lorentz', position: 'Defender', jerseyNumber: 4, team: createdTeams[7]._id, age: 29, nationality: 'Hungarian', stats: { gamesPlayed: 21, goals: 1, assists: 0, points: 1, faults: 6, yellowCards: 2, redCards: 0, passes: 360, actions: 115, tackles: 17, saves: 0, minutesPlayed: 1800, rating: 7.3 } },

      // Nyíregyháza
      { name: 'Ákos Baki', position: 'Midfielder', jerseyNumber: 8, team: createdTeams[8]._id, age: 29, nationality: 'Hungarian', stats: { gamesPlayed: 23, goals: 3, assists: 5, points: 8, faults: 9, yellowCards: 2, redCards: 0, passes: 400, actions: 130, tackles: 14, saves: 0, minutesPlayed: 2000, rating: 7.7 } },
      { name: 'Barnabás Rácz', position: 'Goalkeeper', jerseyNumber: 1, team: createdTeams[8]._id, age: 28, nationality: 'Hungarian', stats: { gamesPlayed: 23, goals: 0, assists: 0, points: 0, faults: 0, yellowCards: 0, redCards: 0, passes: 52, actions: 8, tackles: 0, saves: 80, minutesPlayed: 2070, rating: 7.6 } },
      { name: 'Zoltán Horváth', position: 'Forward', jerseyNumber: 9, team: createdTeams[8]._id, age: 24, nationality: 'Hungarian', stats: { gamesPlayed: 21, goals: 4, assists: 1, points: 5, faults: 7, yellowCards: 1, redCards: 0, passes: 150, actions: 55, tackles: 3, saves: 0, minutesPlayed: 1700, rating: 7.4 } },
      { name: 'Gábor Vas', position: 'Defender', jerseyNumber: 5, team: createdTeams[8]._id, age: 29, nationality: 'Hungarian', stats: { gamesPlayed: 22, goals: 0, assists: 2, points: 2, faults: 8, yellowCards: 3, redCards: 0, passes: 370, actions: 120, tackles: 20, saves: 0, minutesPlayed: 1900, rating: 7.5 } },

      // MTK
      { name: 'Zsombor Nagy', position: 'Midfielder', jerseyNumber: 7, team: createdTeams[9]._id, age: 29, nationality: 'Hungarian', stats: { gamesPlayed: 24, goals: 4, assists: 6, points: 10, faults: 13, yellowCards: 2, redCards: 0, passes: 450, actions: 150, tackles: 11, saves: 0, minutesPlayed: 2100, rating: 8.0 } },
      { name: 'István Bognár', position: 'Goalkeeper', jerseyNumber: 1, team: createdTeams[9]._id, age: 31, nationality: 'Hungarian', stats: { gamesPlayed: 24, goals: 0, assists: 0, points: 0, faults: 0, yellowCards: 0, redCards: 0, passes: 55, actions: 9, tackles: 0, saves: 85, minutesPlayed: 2160, rating: 7.8 } },
      { name: 'Nemanja Antonov', position: 'Defender', jerseyNumber: 3, team: createdTeams[9]._id, age: 29, nationality: 'Serbian', stats: { gamesPlayed: 23, goals: 1, assists: 1, points: 2, faults: 7, yellowCards: 1, redCards: 0, passes: 400, actions: 125, tackles: 16, saves: 0, minutesPlayed: 2000, rating: 7.4 } },
      { name: 'Dániel Prosser', position: 'Forward', jerseyNumber: 9, team: createdTeams[9]._id, age: 28, nationality: 'Hungarian', stats: { gamesPlayed: 22, goals: 8, assists: 3, points: 11, faults: 12, yellowCards: 2, redCards: 0, passes: 210, actions: 80, tackles: 6, saves: 0, minutesPlayed: 1800, rating: 8.1 } },

      // Diósgyőr
      { name: 'Serhiy Shestakov', position: 'Midfielder', jerseyNumber: 10, team: createdTeams[10]._id, age: 33, nationality: 'Ukrainian', stats: { gamesPlayed: 20, goals: 2, assists: 3, points: 5, faults: 8, yellowCards: 1, redCards: 0, passes: 320, actions: 100, tackles: 9, saves: 0, minutesPlayed: 1700, rating: 7.3 } },
      { name: 'Gábor Jurek', position: 'Goalkeeper', jerseyNumber: 1, team: createdTeams[10]._id, age: 27, nationality: 'Hungarian', stats: { gamesPlayed: 20, goals: 0, assists: 0, points: 0, faults: 0, yellowCards: 0, redCards: 0, passes: 45, actions: 6, tackles: 0, saves: 68, minutesPlayed: 1800, rating: 7.2 } },
      { name: 'Kristóf Korbély', position: 'Defender', jerseyNumber: 4, team: createdTeams[10]._id, age: 26, nationality: 'Hungarian', stats: { gamesPlayed: 19, goals: 0, assists: 1, points: 1, faults: 5, yellowCards: 2, redCards: 0, passes: 300, actions: 95, tackles: 15, saves: 0, minutesPlayed: 1600, rating: 7.1 } },
      { name: 'Bright Edomwonyi', position: 'Forward', jerseyNumber: 9, team: createdTeams[10]._id, age: 27, nationality: 'Nigerian', stats: { gamesPlayed: 18, goals: 5, assists: 1, points: 6, faults: 9, yellowCards: 1, redCards: 0, passes: 140, actions: 50, tackles: 4, saves: 0, minutesPlayed: 1400, rating: 7.6 } },

      // Kazincbarcika
      { name: 'Márk Murai', position: 'Midfielder', jerseyNumber: 8, team: createdTeams[11]._id, age: 25, nationality: 'Hungarian', stats: { gamesPlayed: 22, goals: 3, assists: 4, points: 7, faults: 10, yellowCards: 2, redCards: 0, passes: 380, actions: 120, tackles: 13, saves: 0, minutesPlayed: 1900, rating: 7.5 } },
      { name: 'Ádám Pintér', position: 'Goalkeeper', jerseyNumber: 1, team: createdTeams[11]._id, age: 29, nationality: 'Hungarian', stats: { gamesPlayed: 22, goals: 0, assists: 0, points: 0, faults: 0, yellowCards: 0, redCards: 0, passes: 50, actions: 7, tackles: 0, saves: 72, minutesPlayed: 1980, rating: 7.4 } },
      { name: 'Tamás Szalai', position: 'Defender', jerseyNumber: 5, team: createdTeams[11]._id, age: 32, nationality: 'Hungarian', stats: { gamesPlayed: 21, goals: 1, assists: 0, points: 1, faults: 6, yellowCards: 3, redCards: 0, passes: 340, actions: 110, tackles: 18, saves: 0, minutesPlayed: 1800, rating: 7.2 } },
      { name: 'Norbert Csiki', position: 'Forward', jerseyNumber: 9, team: createdTeams[11]._id, age: 27, nationality: 'Hungarian', stats: { gamesPlayed: 20, goals: 4, assists: 2, points: 6, faults: 11, yellowCards: 1, redCards: 0, passes: 160, actions: 60, tackles: 5, saves: 0, minutesPlayed: 1600, rating: 7.7 } }
    ];

    await Player.insertMany(players);
    console.log('Players seeded successfully');

    // Sample games for the season
    const games = [
      { homeTeam: createdTeams[0]._id, awayTeam: createdTeams[1]._id, homeTeamGoals: 2, awayTeamGoals: 3, date: new Date('2025-08-09'), stadium: 'Győri Audi Arena', referee: 'Sándor Némethy', status: 'finished', sport: 'football' },
      { homeTeam: createdTeams[1]._id, awayTeam: createdTeams[3]._id, homeTeamGoals: 4, awayTeamGoals: 1, date: new Date('2025-08-16'), stadium: 'Groupama Aréna', referee: 'Róbert Ábrahám', status: 'finished', sport: 'football' },
      { homeTeam: createdTeams[4]._id, awayTeam: createdTeams[9]._id, homeTeamGoals: 1, awayTeamGoals: 1, date: new Date('2025-08-23'), stadium: 'Paks Stadion', referee: 'Tamás Kádár', status: 'finished', sport: 'football' },
      { homeTeam: createdTeams[2]._id, awayTeam: createdTeams[5]._id, homeTeamGoals: 2, awayTeamGoals: 0, date: new Date('2025-08-30'), stadium: 'Zalaegerszegi Stadion', referee: 'Péter Bodnár', status: 'finished', sport: 'football' },
      { homeTeam: createdTeams[5]._id, awayTeam: createdTeams[0]._id, homeTeamGoals: 3, awayTeamGoals: 2, date: new Date('2025-09-06'), stadium: 'Felcsúti Stadion', referee: 'István Komjáti', status: 'finished', sport: 'football' },
      { homeTeam: createdTeams[8]._id, awayTeam: createdTeams[1]._id, homeTeamGoals: 0, awayTeamGoals: 2, date: new Date('2025-09-13'), stadium: 'Nyíregyházi Stadion', referee: 'Attila Aranyos', status: 'finished', sport: 'football' },
      { homeTeam: createdTeams[1]._id, awayTeam: createdTeams[7]._id, homeTeamGoals: 5, awayTeamGoals: 2, date: new Date('2025-09-20'), stadium: 'Groupama Aréna', referee: 'Sándor Némethy', status: 'finished', sport: 'football' },
      { homeTeam: createdTeams[10]._id, awayTeam: createdTeams[4]._id, homeTeamGoals: 2, awayTeamGoals: 1, date: new Date('2025-09-27'), stadium: 'Diósgyőri Stadion', referee: 'Róbert Ábrahám', status: 'finished', sport: 'football' },
      { homeTeam: createdTeams[6]._id, awayTeam: createdTeams[11]._id, homeTeamGoals: 1, awayTeamGoals: 2, date: new Date('2025-10-04'), stadium: 'Kisvárda Stadion', referee: 'Tamás Kádár', status: 'finished', sport: 'football' },
      { homeTeam: createdTeams[3]._id, awayTeam: createdTeams[2]._id, homeTeamGoals: 3, awayTeamGoals: 1, date: new Date('2025-10-11'), stadium: 'Debreceni Stadion', referee: 'Péter Bodnár', status: 'finished', sport: 'football' },
      { homeTeam: createdTeams[9]._id, awayTeam: createdTeams[0]._id, homeTeamGoals: 2, awayTeamGoals: 2, date: new Date('2025-10-18'), stadium: 'MTK Stadion', referee: 'István Komjáti', status: 'finished', sport: 'football' },
      { homeTeam: createdTeams[1]._id, awayTeam: createdTeams[5]._id, homeTeamGoals: 1, awayTeamGoals: 0, date: new Date('2025-10-25'), stadium: 'Groupama Aréna', referee: 'Attila Aranyos', status: 'finished', sport: 'football' }
    ];

    await Game.insertMany(games);
    console.log('Games seeded successfully');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Connect to MongoDB and seed
mongoose.connect('mongodb://localhost:27017/sportstat', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected for seeding');
    seedDatabase();
  })
  .catch(err => console.log('MongoDB connection error:', err));