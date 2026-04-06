const request = require('supertest');
const app = require('../index');

// Helper — register and login a donor
const registerDonor = async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Donor User',
      email: 'donor@test.com',
      password: '123456',
      role: 'donor'
    });
  return res.body.token;
};

describe('Donor Endpoints', () => {

  // ─── CREATE PROFILE ────────────────────────────────────────────────────────
  describe('POST /api/donors/profile', () => {

    it('should create donor profile successfully', async () => {
      const token = await registerDonor();

      const res = await request(app)
        .post('/api/donors/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          blood_group: 'A+',
          city: 'Noida',
          pincode: '201301',
        contact_no: '9876584475'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.profile.blood_group).toBe('A+');
      expect(res.body.profile.location.city).toBe('Noida');
    });

    it('should return 409 if profile already exists', async () => {
      const token = await registerDonor();

      await request(app)
        .post('/api/donors/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          blood_group: 'A+',
          city: 'Noida',
          pincode: '201301',
          contact_no: '9876584475'
        });

      const res = await request(app)
        .post('/api/donors/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          blood_group: 'A+',
          city: 'Noida',
          pincode: '201301',
          contact_no: '9876584475'
        });

      expect(res.statusCode).toBe(409);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .post('/api/donors/profile')
        .send({
          blood_group: 'A+',
          city: 'Noida',
          pincode: '201301',
          contact_no: '9876584475'
        });

      expect(res.statusCode).toBe(401);
    });

  });

  // ─── GET PROFILE ─────────────────────────────────────────────
  describe('GET /api/donors/profile', () => {

    it('should return donor profile', async () => {
      const token = await registerDonor();

      await request(app)
        .post('/api/donors/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          blood_group: 'A+',
          city: 'Noida',
          pincode: '201301',
          contact_no: '9876584475'
        });

      const res = await request(app)
        .get('/api/donors/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.profile).toBeDefined();
    });

    it('should return 404 if profile does not exist', async () => {
      const token = await registerDonor();

      const res = await request(app)
        .get('/api/donors/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });

  });

  // ─── ELIGIBILITY 
  describe('GET /api/donors/eligibility', () => {

    it('should return eligible true when no donation recorded', async () => {
      const token = await registerDonor();

      await request(app)
        .post('/api/donors/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          blood_group: 'A+',
          city: 'Noida',
          pincode: '201301',
          contact_no: '9876584475'
        });

      const res = await request(app)
        .get('/api/donors/eligibility')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.eligible).toBe(true);
    });

  });

});