const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

describe('Task API', () => {
  beforeEach(() => {
    taskService._reset();
  });

  describe('POST /tasks', () => {
    test('should create a task', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({
          title: 'Learn Jest',
          description: 'Write API tests',
          priority: 'high',
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Learn Jest');
      expect(response.body.description).toBe('Write API tests');
      expect(response.body.priority).toBe('high');
      expect(response.body.status).toBe('todo');
      expect(response.body.id).toBeDefined();
    });

    test('should return 400 when title is missing', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({
          description: 'No title',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /tasks', () => {
    test('should return all tasks', async () => {
      await request(app)
        .post('/tasks')
        .send({ title: 'Task 1' });

      await request(app)
        .post('/tasks')
        .send({ title: 'Task 2' });

      const response = await request(app).get('/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    test('should filter tasks by status', async () => {
      await request(app)
        .post('/tasks')
        .send({
          title: 'Todo task',
          status: 'todo',
        });

      await request(app)
        .post('/tasks')
        .send({
          title: 'Done task',
          status: 'done',
        });

      const response = await request(app)
        .get('/tasks')
        .query({ status: 'todo' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].status).toBe('todo');
    });

    test('should return paginated tasks', async () => {
      await request(app)
        .post('/tasks')
        .send({ title: 'Task 1' });

      await request(app)
        .post('/tasks')
        .send({ title: 'Task 2' });

      await request(app)
        .post('/tasks')
        .send({ title: 'Task 3' });

      const response = await request(app)
        .get('/tasks')
        .query({
          page: 1,
          limit: 2,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('PUT /tasks/:id', () => {
    test('should update an existing task', async () => {
      const createResponse = await request(app)
        .post('/tasks')
        .send({
          title: 'Old title',
        });

      const id = createResponse.body.id;

      const response = await request(app)
        .put(`/tasks/${id}`)
        .send({
          title: 'New title',
        });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('New title');
    });

    test('should return 404 for a nonexistent task', async () => {
      const response = await request(app)
        .put('/tasks/nonexistent-id')
        .send({
          title: 'New title',
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });
  });

  describe('DELETE /tasks/:id', () => {
    test('should delete an existing task', async () => {
      const createResponse = await request(app)
        .post('/tasks')
        .send({
          title: 'Delete me',
        });

      const id = createResponse.body.id;

      const response = await request(app)
        .delete(`/tasks/${id}`);

      expect(response.status).toBe(204);
    });

    test('should return 404 for a nonexistent task', async () => {
      const response = await request(app)
        .delete('/tasks/nonexistent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });
  });

  describe('PATCH /tasks/:id/complete', () => {
    test('should complete an existing task', async () => {
      const createResponse = await request(app)
        .post('/tasks')
        .send({
          title: 'Complete me',
          priority: 'high',
        });

      const id = createResponse.body.id;

      const response = await request(app)
        .patch(`/tasks/${id}/complete`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('done');
      expect(response.body.completedAt).not.toBeNull();
      expect(response.body.priority).toBe('medium');
    });

    test('should return 404 for a nonexistent task', async () => {
      const response = await request(app)
        .patch('/tasks/nonexistent-id/complete');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });
  });

  describe('PATCH /tasks/:id/assign', () => {
    test('should assign a task to an assignee', async () => {
      const createResponse = await request(app)
        .post('/tasks')
        .send({
          title: 'Assign me',
        });

      const id = createResponse.body.id;

      const response = await request(app)
        .patch(`/tasks/${id}/assign`)
        .send({
          assignee: 'Tanuja',
        });

      expect(response.status).toBe(200);
      expect(response.body.assignee).toBe('Tanuja');
      expect(response.body.id).toBe(id);
    });

    test('should return 404 for a nonexistent task', async () => {
      const response = await request(app)
        .patch('/tasks/nonexistent-id/assign')
        .send({
          assignee: 'Tanuja',
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });

    test('should return 400 when assignee is missing', async () => {
      const createResponse = await request(app)
        .post('/tasks')
        .send({
          title: 'Missing assignee',
        });

      const id = createResponse.body.id;

      const response = await request(app)
        .patch(`/tasks/${id}/assign`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'assignee is required and must be a non-empty string'
      );
    });

    test('should return 400 when assignee is empty', async () => {
      const createResponse = await request(app)
        .post('/tasks')
        .send({
          title: 'Empty assignee',
        });

      const id = createResponse.body.id;

      const response = await request(app)
        .patch(`/tasks/${id}/assign`)
        .send({
          assignee: '   ',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'assignee is required and must be a non-empty string'
      );
    });
  });

  describe('GET /tasks/stats', () => {
    test('should return task statistics', async () => {
      await request(app)
        .post('/tasks')
        .send({
          title: 'Todo',
          status: 'todo',
        });

      await request(app)
        .post('/tasks')
        .send({
          title: 'In progress',
          status: 'in_progress',
        });

      await request(app)
        .post('/tasks')
        .send({
          title: 'Done',
          status: 'done',
        });

      const response = await request(app).get('/tasks/stats');

      expect(response.status).toBe(200);
      expect(response.body.todo).toBe(1);
      expect(response.body.in_progress).toBe(1);
      expect(response.body.done).toBe(1);
      expect(response.body.overdue).toBe(0);
    });

    test('should count overdue tasks', async () => {
      await request(app)
        .post('/tasks')
        .send({
          title: 'Overdue',
          status: 'todo',
          dueDate: '2020-01-01T00:00:00.000Z',
        });

      const response = await request(app).get('/tasks/stats');

      expect(response.status).toBe(200);
      expect(response.body.overdue).toBe(1);
    });
  });
});