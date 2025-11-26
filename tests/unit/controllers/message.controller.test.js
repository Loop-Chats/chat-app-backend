const app = require('../../../app.js');
const request = require('supertest');
const Message = require('../../../model/message.model.js').default;

describe('Message Controller', () => {
  const agentA = request.agent(app);
  const agentB = request.agent(app);
  let userAId, userBId, chatId, messageId;

  // Create and authenticate two users once before all tests in this suite
  beforeAll(async () => {
    const a = await agentA.post('/api/auth/register').send({ username: 'msgA', email: 'msgA@test.com', password: 'Test123' });
    const b = await agentB.post('/api/auth/register').send({ username: 'msgB', email: 'msgB@test.com', password: 'Test123' });

    if (a.statusCode !== 201 || b.statusCode !== 201) {
      throw new Error('Failed to create test users');
    }

    userAId = a.body._id;
    userBId = b.body._id;
  });

  it('creates a one-to-one chat between A and B', async () => {
    const res = (await agentA.post('/api/chats').send({ otherUserIds: [userBId] }))
    // .set('set-cookie', agentA.cookies);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    chatId = res.body._id;
  });

  it('A creates a message in the chat', async () => {
    const res = await agentA.post(`/api/messages/chats/${chatId}`).send({ text: 'Hello from A' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.text).toBe('Hello from A');
    messageId = res.body._id;
  });

  it('fetches chat messages', async () => {
    const res = await agentA.get(`/api/messages/chats/${chatId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('A edits their message', async () => {
    const res = await agentA.patch('/api/messages').send({ messageId, newText: 'Edited text' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('text', 'Edited text');
  });

  it('B marks message as read', async () => {
    const res = await agentB.patch(`/api/messages/mark-message/${messageId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('A deletes their message', async () => {
    const res = await agentA.delete('/api/messages').send({ messageId });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');

    const msg = await Message.findById(messageId);
    expect(msg).toBeNull();
  });
});
