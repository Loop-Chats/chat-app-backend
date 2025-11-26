const app = require('../../../app.js');
const request = require('supertest');
const { default: User } = require('../../../model/user.model.js');

describe('Auth Controller', () => {
    const agent = request.agent(app);

    it('should return 400 when required fields are missing on register', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ username: 'noemail' });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    it('should register a user with valid data', async () => {
        const response = await agent
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                email: 'testuser123@gmail.com',
                password: 'Test123',
            });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('_id');
        expect(response.body).toHaveProperty('username', 'testuser');
        expect(response.body).toHaveProperty('email', 'testuser123@gmail.com');
        expect(response.headers['set-cookie']).toBeDefined();

        const createdUser = await User.findById(response.body._id);
        expect(createdUser).not.toBeNull();
    });

    it('should not allow registering with duplicate email', async () => {
        // attempt to register same email again
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser2',
                email: 'testuser123@gmail.com',
                password: 'Test123',
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    it('should login with correct credentials and set cookie', async () => {
        const res = await agent
            .post('/api/auth/login')
            .send({ email: 'testuser123@gmail.com', password: 'Test123' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('_id');
        expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should not login with incorrect password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'testuser123@gmail.com', password: 'wrong' });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    it('should return user info on check-auth when authenticated', async () => {
        // agent is authenticated from previous login
        const res = await agent.get('/api/auth/check-auth');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('email', 'testuser123@gmail.com');
    });

    it('should logout and clear the cookie', async () => {
        const res = await agent.post('/api/auth/logout');
        expect(res.statusCode).toBe(200);
        // logout sets cookie with maxAge 0 or empty value
        expect(res.headers['set-cookie']).toBeDefined();
    });
});