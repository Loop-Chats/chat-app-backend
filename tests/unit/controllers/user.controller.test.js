const app = require('../../../app.js');
const request = require('supertest');
const User = require('../../../model/user.model.js').default;

describe('User Controller (friend flows)', () => {
  const agentA = request.agent(app);
  const agentB = request.agent(app);
  let userAId, userBId, friendRequestId;

  it('registers two users', async () => {
    const a = await agentA.post('/api/auth/register').send({ username: 'userA', email: 'userA@test.com', password: 'Test123' });
    const b = await agentB.post('/api/auth/register').send({ username: 'userB', email: 'userB@test.com', password: 'Test123' });

    expect(a.statusCode).toBe(201);
    expect(b.statusCode).toBe(201);

    userAId = a.body._id;
    userBId = b.body._id;
  });

  it('sends a friend request from A to B', async () => {
    const res = await agentA.post('/api/users/send-friend-request').send({ receiverId: userBId });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('sender');
    friendRequestId = res.body._id;
  });

  it('B can fetch pending friend requests', async () => {
    const res = await agentB.get('/api/users/friend-requests');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('B accepts the friend request', async () => {
    const res = await agentB.patch(`/api/users/respond-friend-request/${friendRequestId}`).send({ action: 'accept' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toBe('accepted');
  });

  it('A sees B in friends list for sidebar', async () => {
    const res = await agentA.get('/api/users/friends');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const usernames = res.body.map(u => u.username);
    expect(usernames).toContain('userB');
  });
});
