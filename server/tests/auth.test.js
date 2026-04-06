const request = require('supertest');
const app = require('../index');

describe('Auth Endpoints', () => {

  // ─── REGISTER ─────────────────────────────────────────────────────────────
  describe('POST /api/auth/register', () => {

    it('should register a new user and return token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@test.com',
          password: '123456',
          role: 'donor'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('test@test.com');
      expect(res.body.user.role).toBe('donor');
    });

    it('should return 409 if email already registered', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@test.com',
          password: '123456',
          role: 'donor'
        });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@test.com',
          password: '123456',
          role: 'donor'
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toBe('Email already registered');
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com' });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 if password is less than 6 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@test.com',
          password: '123',
          role: 'donor'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Password must be at least 6 characters');
    });

  });

  // ─── LOGIN ─────────────────────────────────────────────────────────────────
  describe('POST /api/auth/login', () => {

    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@test.com',
          password: '123456',
          role: 'donor'
        });
    });

    it('should login and return token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: '123456'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('test@test.com');
    });

    it('should return 401 for wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'wrongpass'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('should return 401 for non existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nobody@test.com',
          password: '123456'
        });

      expect(res.statusCode).toBe(401);
    });

    it('should return 400 if fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com' });

      expect(res.statusCode).toBe(400);
    });

  });

  // ─── GET ME ────────────────────────────────────────────────────────────────
  describe('GET /api/auth/me', () => {

    it('should return current user when token is valid', async () => {
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@test.com',
          password: '123456',
          role: 'donor'
        });

      const token = registerRes.body.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user.email).toBe('test@test.com');
    });

    it('should return 401 when no token provided', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });

  });

});