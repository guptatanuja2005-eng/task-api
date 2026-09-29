const taskService = require('../src/services/taskService');

describe('Task Service', () => {
  beforeEach(() => {
    taskService._reset();
  });

  test('should create a task', () => {
    const task = taskService.create({
      title: 'Learn Jest',
    });

    expect(task.title).toBe('Learn Jest');
    expect(task.status).toBe('todo');
    expect(task.priority).toBe('medium');
    expect(task.description).toBe('');
    expect(task.dueDate).toBeNull();
    expect(task.completedAt).toBeNull();
    expect(task.id).toBeDefined();
    expect(task.createdAt).toBeDefined();
  });

  test('should get all tasks', () => {
    taskService.create({ title: 'Task 1' });
    taskService.create({ title: 'Task 2' });

    const tasks = taskService.getAll();

    expect(tasks).toHaveLength(2);
  });

  test('should find a task by ID', () => {
    const task = taskService.create({
      title: 'Find me',
    });

    const result = taskService.findById(task.id);

    expect(result).toEqual(task);
  });

  test('should return undefined for an invalid ID', () => {
    const result = taskService.findById('invalid-id');

    expect(result).toBeUndefined();
  });

  // This test exposes the status partial-match bug
  test('should not partially match task status', () => {
    taskService.create({
      title: 'Todo task',
      status: 'todo',
    });

    taskService.create({
      title: 'Done task',
      status: 'done',
    });

    const result = taskService.getByStatus('do');

    expect(result).toHaveLength(0);
  });

  test('should update a task', () => {
    const task = taskService.create({
      title: 'Old title',
    });

    const updated = taskService.update(task.id, {
      title: 'New title',
    });

    expect(updated.title).toBe('New title');
    expect(updated.id).toBe(task.id);
  });

  test('should return null when updating a nonexistent task', () => {
    const result = taskService.update('invalid-id', {
      title: 'New title',
    });

    expect(result).toBeNull();
  });

  test('should delete a task', () => {
    const task = taskService.create({
      title: 'Delete me',
    });

    const result = taskService.remove(task.id);

    expect(result).toBe(true);
    expect(taskService.findById(task.id)).toBeUndefined();
  });

  test('should return false when deleting a nonexistent task', () => {
    const result = taskService.remove('invalid-id');

    expect(result).toBe(false);
  });

  test('should complete a task', () => {
    const task = taskService.create({
      title: 'Complete me',
      priority: 'high',
    });

    const completed = taskService.completeTask(task.id);

    expect(completed.status).toBe('done');
    expect(completed.priority).toBe('medium');
    expect(completed.completedAt).not.toBeNull();
  });

  test('should return null when completing a nonexistent task', () => {
    const result = taskService.completeTask('invalid-id');

    expect(result).toBeNull();
  });

  test('should return correct task statistics', () => {
    taskService.create({
      title: 'Todo',
      status: 'todo',
    });

    taskService.create({
      title: 'Progress',
      status: 'in_progress',
    });

    taskService.create({
      title: 'Done',
      status: 'done',
    });

    const stats = taskService.getStats();

    expect(stats.todo).toBe(1);
    expect(stats.in_progress).toBe(1);
    expect(stats.done).toBe(1);
    expect(stats.overdue).toBe(0);
  });

  test('should count overdue tasks', () => {
    taskService.create({
      title: 'Overdue task',
      status: 'todo',
      dueDate: '2020-01-01T00:00:00.000Z',
    });

    const stats = taskService.getStats();

    expect(stats.overdue).toBe(1);
  });

  test('should assign a task to an assignee', () => {
    const task = taskService.create({
      title: 'Assign me',
    });

    const updated = taskService.assignTask(task.id, 'Tanuja');

    expect(updated.assignee).toBe('Tanuja');
    expect(updated.id).toBe(task.id);
  });

  test('should return null when assigning a nonexistent task', () => {
    const result = taskService.assignTask('invalid-id', 'Tanuja');

    expect(result).toBeNull();
  });
});