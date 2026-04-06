const request = require('supertest');
const app = require('../index');

// Helper — register donor and get token
const registerUser = async (email, role) => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test User',
      email,
      password: '123456',
      role
    });
  return res.body.token;
};

describe('Blood Request Endpoints', () => {

  // ─── CREATE REQUEST ─────────
  describe('POST /api/requests', () => {

    it('should create a blood request successfully', async () => {
      const token = await registerUser('requester@test.com', 'requester');

      const res = await request(app)
        .post('/api/requests')
        .set('Authorization', `Bearer ${token}`)
        .send({
          patient_name: 'John Doe',
          blood_group: 'A+',
          units_needed: 2,
          city: 'Noida',
          hospital: 'Fortis Hospital',

          urgency: 'Critical'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.request.patient_name).toBe('John Doe');
      expect(res.body.request.status).toBe('Pending');
    });

    it('should return 400 if required fields are missing', async () => {
      const token = await registerUser('requester@test.com', 'requester');

      const res = await request(app)
        .post('/api/requests')
        .set('Authorization', `Bearer ${token}`)
        .send({ patient_name: 'John Doe' });

      expect(res.statusCode).toBe(400);
    });

    it('should return 403 if donor tries to create request', async () => {
      const token = await registerUser('donor@test.com', 'donor');

      const res = await request(app)
        .post('/api/requests')
        .set('Authorization', `Bearer ${token}`)
        .send({
          patient_name: 'John Doe',
          blood_group: 'A+',
          units_needed: 2,
          city: 'Noida'
        });

      expect(res.statusCode).toBe(403);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .post('/api/requests')
        .send({
          patient_name: 'John Doe',
          blood_group: 'A+',
          units_needed: 2,
          city: 'Noida'
        });

      expect(res.statusCode).toBe(401);
    });

  });

  // ─── GET ALL REQUESTS ──────────────────────────────────────────────────────
  describe('GET /api/requests', () => {

    it('should return all blood requests', async () => {
      const token = await registerUser('requester@test.com', 'requester');

      await request(app)
        .post('/api/requests')
        .set('Authorization', `Bearer ${token}`)
        .send({
          patient_name: 'John Doe',
          blood_group: 'A+',
          units_needed: 2,
          city: 'Noida'
        });

      const res = await request(app)
        .get('/api/requests')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(1);
    });

  });

  // ─── UPDATE STATUS ─────────────────────────────────────────────────────────
  describe('PATCH /api/requests/:id/status', () => {

    it('should update request status', async () => {
      const token = await registerUser('requester@test.com', 'requester');

      const createRes = await request(app)
        .post('/api/requests')
        .set('Authorization', `Bearer ${token}`)
        .send({
          patient_name: 'John Doe',
          blood_group: 'A+',
          units_needed: 2,
          city: 'Noida'
        });

      const requestId = createRes.body.request._id;

      const res = await request(app)
        .patch(`/api/requests/${requestId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'Cancelled' });

      expect(res.statusCode).toBe(200);
      expect(res.body.request.status).toBe('Cancelled');
    });

    it('should return 403 if another user tries to update status', async () => {
      const requesterToken = await registerUser('requester@test.com', 'requester');
      const otherToken = await registerUser('other@test.com', 'requester');

      const createRes = await request(app)
        .post('/api/requests')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({
          patient_name: 'John Doe',
          blood_group: 'A+',
          units_needed: 2,
          city: 'Noida'
        });

      const requestId = createRes.body.request._id;

      const res = await request(app)
        .patch(`/api/requests/${requestId}/status`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ status: 'Cancelled' });

      expect(res.statusCode).toBe(403);
    });

  });

});