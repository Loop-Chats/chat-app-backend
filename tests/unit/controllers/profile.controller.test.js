const app = require('../../../app.js');
const request = require('supertest');
const { default: User } = require('../../../model/user.model.js');

describe('Profile Controller', () => {
  const agent = request.agent(app);

  it('updates username successfully', async () => {
    // register and login a user
    await agent
      .post('/api/auth/register')
      .send({ username: 'profileuser', email: 'profileuser@test.com', password: 'Test123' });

    // update username
    const res = await agent
      .patch('/api/auth/update-profile')
      .send({ username: 'updateduser' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('username', 'updateduser');

    const user = await User.findOne({ email: 'profileuser@test.com' });
    expect(user).toBeTruthy();
    expect(user.username).toBe('updateduser');
  });

  it('returns 400 when no fields provided', async () => {
    const res = await agent.patch('/api/auth/update-profile').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});
