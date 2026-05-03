const User = require('../models/User');
const Team = require('../models/Team');
const Player = require('../models/Player');
const bcrypt = require('bcryptjs');

describe('Model Validation & Methods', () => {
  
  describe('User Model', () => {
    test('Should hash password before saving', async () => {
      const user = new User({
        username: 'hashtest',
        email: 'hashtest@example.com',
        password: 'plainpassword'
      });
      
      const plainPassword = user.password;
      await user.save();
      
      expect(user.password).not.toBe(plainPassword);
      expect(user.password.length > 20).toBe(true);
    });

    test('comparePassword should return true for correct password', async () => {
      const user = await User.create({
        username: 'comptest',
        email: 'comptest@example.com',
        password: 'correctpassword'
      });
      
      const isValid = await user.comparePassword('correctpassword');
      expect(isValid).toBe(true);
    });

    test('comparePassword should return false for incorrect password', async () => {
      const user = await User.create({
        username: 'comptest2',
        email: 'comptest2@example.com',
        password: 'correctpassword'
      });
      
      const isValid = await user.comparePassword('wrongpassword');
      expect(isValid).toBe(false);
    });

    test('User email should be lowercase', async () => {
      const user = await User.create({
        username: 'lowertest',
        email: 'TEST@EXAMPLE.COM',
        password: 'password123'
      });
      
      expect(user.email).toBe('test@example.com');
    });

    test('User email validation should reject invalid emails', async () => {
      await expect(User.create({
        username: 'invalidemail',
        email: 'invalid.email',
        password: 'password123'
      })).rejects.toThrow();
    });

    test('Username should be trimmed', async () => {
      const user = await User.create({
        username: '  trimmeduser  ',
        email: 'trimmed@example.com',
        password: 'password123'
      });
      
      expect(user.username).toBe('trimmeduser');
    });

    test('Username minimum length should be 3', async () => {
      await expect(User.create({
        username: 'ab',
        email: 'shortuser@example.com',
        password: 'password123'
      })).rejects.toThrow();
    });

    test('Password minimum length should be 6', async () => {
      await expect(User.create({
        username: 'testuser123',
        email: 'testuser@example.com',
        password: 'short'
      })).rejects.toThrow();
    });

    test('toJSON should exclude password', () => {
      const user = new User({
        username: 'jsontest',
        email: 'jsontest@example.com',
        password: 'password123'
      });
      
      const userJson = user.toJSON();
      expect(userJson.password).toBeUndefined();
    });

    test('favoriteTeams should be array of ObjectIds', async () => {
      const team = await Team.create({
        name: 'Favorite Team',
        sport: 'football',
        city: 'Budapest',
        founded: 2000
      });
      
      const user = await User.create({
        username: 'favtest',
        email: 'favtest@example.com',
        password: 'password123',
        favoriteTeams: [team._id]
      });
      
      expect(user.favoriteTeams.length).toBe(1);
      expect(user.favoriteTeams[0]).toEqual(team._id);
    });

    test('User should allow multiple favorite teams', async () => {
      const team1 = await Team.create({
        name: 'Team 1',
        sport: 'football',
        city: 'Budapest',
        founded: 2000
      });

      const team2 = await Team.create({
        name: 'Team 2',
        sport: 'basketball',
        city: 'Debrecen',
        founded: 2005
      });
      
      const user = await User.create({
        username: 'multifav',
        email: 'multifav@example.com',
        password: 'password123',
        favoriteTeams: [team1._id, team2._id]
      });
      
      expect(user.favoriteTeams.length).toBe(2);
    });

    test('User loginOtpCode should be null by default', async () => {
      const user = await User.create({
        username: 'otptest',
        email: 'otptest@example.com',
        password: 'password123'
      });
      
      expect(user.loginOtpCode).toBeNull();
    });

    test('User loginOtpPending should be false by default', async () => {
      const user = await User.create({
        username: 'pendingtest',
        email: 'pendingtest@example.com',
        password: 'password123'
      });
      
      expect(user.loginOtpPending).toBe(false);
    });
  });

  describe('Team Model', () => {
    test('Team name is required', async () => {
      await expect(Team.create({
        sport: 'football',
        city: 'Budapest',
        founded: 2000
      })).rejects.toThrow();
    });

    test('Team sport is required', async () => {
      await expect(Team.create({
        name: 'Test Team',
        city: 'Budapest',
        founded: 2000
      })).rejects.toThrow();
    });

    test('Team city is required', async () => {
      await expect(Team.create({
        name: 'Test Team',
        sport: 'football',
        founded: 2000
      })).rejects.toThrow();
    });

    test('Team sport should be from valid enum', async () => {
      const validSports = ['football', 'basketball', 'tennis', 'other'];
      
      for (const sport of validSports) {
        const team = await Team.create({
          name: `Test Team ${sport}`,
          sport: sport,
          city: 'Budapest',
          founded: 2000
        });
        
        expect(team.sport).toBe(sport);
      }
    });

    test('Team founded year should be between 1800 and current year', async () => {
      await expect(Team.create({
        name: 'Old Team',
        sport: 'football',
        city: 'Budapest',
        founded: 1700
      })).rejects.toThrow();
    });

    test('Team logo should be optional', async () => {
      const team = await Team.create({
        name: 'Logo Team',
        sport: 'football',
        city: 'Budapest',
        founded: 2010
      });
      
      expect(team.logo).toBeUndefined();
    });
  });

  describe('Player Model', () => {
    test('Player name is required', async () => {
      const team = await Team.create({
        name: 'Test Team',
        sport: 'football',
        city: 'Budapest',
        founded: 2000
      });
      
      await expect(Player.create({
        position: 'Forward',
        team: team._id
      })).rejects.toThrow();
    });

    test('Player position is required', async () => {
      const team = await Team.create({
        name: 'Test Team',
        sport: 'football',
        city: 'Budapest',
        founded: 2000
      });
      
      await expect(Player.create({
        name: 'Test Player',
        team: team._id
      })).rejects.toThrow();
    });

    test('Player stats should have default values', async () => {
      const team = await Team.create({
        name: 'Test Team',
        sport: 'football',
        city: 'Budapest',
        founded: 2000
      });
      
      const player = await Player.create({
        name: 'Test Player',
        position: 'Forward',
        team: team._id
      });
      
      expect(player.stats.gamesPlayed).toBe(0);
      expect(player.stats.goals).toBe(0);
      expect(player.stats.assists).toBe(0);
      expect(player.stats.rating).toBe(0);
    });

    test('Player rating should be between 0 and 10', async () => {
      const team = await Team.create({
        name: 'Test Team',
        sport: 'football',
        city: 'Budapest',
        founded: 2000
      });
      
      await expect(Player.create({
        name: 'Test Player',
        position: 'Forward',
        team: team._id,
        stats: { rating: 11 }
      })).rejects.toThrow();
    });

    test('Player nationality should be optional', async () => {
      const team = await Team.create({
        name: 'Test Team',
        sport: 'football',
        city: 'Budapest',
        founded: 2000
      });
      
      const player = await Player.create({
        name: 'Test Player',
        position: 'Forward',
        team: team._id
      });
      
      expect(player.nationality).toBeUndefined();
    });
  });
});
