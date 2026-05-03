const request = require('supertest');
const express = require('express');
const teamsRouter = require('../../routes/teams');
const Team = require('../../models/Team');

const app = express();
app.use(express.json());
app.use('/api/teams', teamsRouter);

describe('Teams API Routes', () => {
  
  describe('GET /api/teams', () => {
    test('Should return all teams with 200 status', async () => {
      await Team.create({
        name: 'Team 1',
        sport: 'football',
        city: 'Budapest',
        founded: 2000
      });
      
      const response = await request(app).get('/api/teams');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
    });

    test('Should return empty array when no teams exist', async () => {
      const response = await request(app).get('/api/teams');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    test('Should return correct team data', async () => {
      const team = await Team.create({
        name: 'Test Team',
        sport: 'basketball',
        city: 'Debrecen',
        founded: 1995
      });
      
      const response = await request(app).get('/api/teams');
      
      expect(response.body[0].name).toBe('Test Team');
      expect(response.body[0].sport).toBe('basketball');
      expect(response.body[0].city).toBe('Debrecen');
    });
  });

  describe('GET /api/teams/:id', () => {
    test('Should return single team by ID with 200 status', async () => {
      const team = await Team.create({
        name: 'Specific Team',
        sport: 'football',
        city: 'Budapest',
        founded: 2005
      });
      
      const response = await request(app).get(`/api/teams/${team._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Specific Team');
    });

    test('Should return 404 for non-existent team', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app).get(`/api/teams/${fakeId}`);
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Team not found');
    });

    test('Should return 500 for invalid ID format', async () => {
      const response = await request(app).get('/api/teams/invalid-id');
      
      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/teams', () => {
    test('Should create team with 201 status', async () => {
      const teamData = {
        name: 'New Team',
        sport: 'football',
        city: 'Budapest',
        founded: 2020
      };
      
      const response = await request(app)
        .post('/api/teams')
        .send(teamData);
      
      expect(response.status).toBe(201);
      expect(response.body.name).toBe('New Team');
      expect(response.body._id).toBeTruthy();
    });

    test('Should return 400 for missing required fields', async () => {
      const invalidData = {
        name: 'Incomplete Team',
        sport: 'football'
      };
      
      const response = await request(app)
        .post('/api/teams')
        .send(invalidData);
      
      expect(response.status).toBe(400);
    });

    test('Should return 400 for invalid sport', async () => {
      const invalidData = {
        name: 'Invalid Sport Team',
        sport: 'invalid',
        city: 'Budapest',
        founded: 2020
      };
      
      const response = await request(app)
        .post('/api/teams')
        .send(invalidData);
      
      expect(response.status).toBe(400);
    });

    test('Should save team with optional logo field', async () => {
      const teamData = {
        name: 'Logo Team',
        sport: 'football',
        city: 'Budapest',
        founded: 2015,
        logo: 'https://example.com/logo.png'
      };
      
      const response = await request(app)
        .post('/api/teams')
        .send(teamData);
      
      expect(response.status).toBe(201);
      expect(response.body.logo).toBe('https://example.com/logo.png');
    });
  });

  describe('PATCH /api/teams/:id', () => {
    test('Should update team with 200 status', async () => {
      const team = await Team.create({
        name: 'Original Name',
        sport: 'football',
        city: 'Budapest',
        founded: 2010
      });
      
      const response = await request(app)
        .patch(`/api/teams/${team._id}`)
        .send({ name: 'Updated Name' });
      
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Name');
    });

    test('Should return 404 when updating non-existent team', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .patch(`/api/teams/${fakeId}`)
        .send({ name: 'Updated' });
      
      expect(response.status).toBe(404);
    });

    test('Should allow partial updates', async () => {
      const team = await Team.create({
        name: 'Original',
        sport: 'football',
        city: 'Budapest',
        founded: 2010
      });
      
      const response = await request(app)
        .patch(`/api/teams/${team._id}`)
        .send({ city: 'Debrecen' });
      
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Original');
      expect(response.body.city).toBe('Debrecen');
    });

    test('Should return 400 for invalid sport in update', async () => {
      const team = await Team.create({
        name: 'Test Team',
        sport: 'football',
        city: 'Budapest',
        founded: 2010
      });
      
      const response = await request(app)
        .patch(`/api/teams/${team._id}`)
        .send({ sport: 'invalid_sport' });
      
      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/teams/:id', () => {
    test('Should delete team with 200 status', async () => {
      const team = await Team.create({
        name: 'Delete Me',
        sport: 'football',
        city: 'Budapest',
        founded: 2020
      });
      
      const response = await request(app).delete(`/api/teams/${team._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Team deleted');
    });

    test('Should return 404 when deleting non-existent team', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app).delete(`/api/teams/${fakeId}`);
      
      expect(response.status).toBe(404);
    });

    test('Should actually remove team from database', async () => {
      const team = await Team.create({
        name: 'To Delete',
        sport: 'football',
        city: 'Budapest',
        founded: 2020
      });
      
      await request(app).delete(`/api/teams/${team._id}`);
      
      const deletedTeam = await Team.findById(team._id);
      expect(deletedTeam).toBeNull();
    });
  });
});
