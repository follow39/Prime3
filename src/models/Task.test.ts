import { describe, it, expect } from 'vitest';
import { Task, TaskStatus } from './Task';

describe('Task Model', () => {
  describe('Task interface', () => {
    it('should create a valid task object', () => {
      const task: Task = {
        id: 1,
        title: 'Test Task',
        description: 'This is a test task',
        status: TaskStatus.Open,
        creation_date: '2024-11-12',
        active: 1
      };

      expect(task.id).toBe(1);
      expect(task.title).toBe('Test Task');
      expect(task.description).toBe('This is a test task');
      expect(task.status).toBe(TaskStatus.Open);
      expect(task.creation_date).toBe('2024-11-12');
      expect(task.active).toBe(1);
    });

    it('should allow empty description', () => {
      const task: Task = {
        id: 2,
        title: 'Task without description',
        description: '',
        status: TaskStatus.Open,
        creation_date: '2024-11-12',
        active: 1
      };

      expect(task.description).toBe('');
    });

    it('should handle all task status types', () => {
      const openTask: Task = {
        id: 1,
        title: 'Open Task',
        description: '',
        status: TaskStatus.Open,
        creation_date: '2024-11-12',
        active: 1
      };

      const doneTask: Task = {
        id: 2,
        title: 'Done Task',
        description: '',
        status: TaskStatus.Done,
        creation_date: '2024-11-12',
        active: 1
      };

      const overdueTask: Task = {
        id: 3,
        title: 'Overdue Task',
        description: '',
        status: TaskStatus.Overdue,
        creation_date: '2024-11-11',
        active: 1
      };

      expect(openTask.status).toBe(TaskStatus.Open);
      expect(doneTask.status).toBe(TaskStatus.Done);
      expect(overdueTask.status).toBe(TaskStatus.Overdue);
    });
  });

  describe('TaskStatus enum', () => {
    it('should have correct enum values', () => {
      expect(TaskStatus.Open).toBe(1);
      expect(TaskStatus.Done).toBe(2);
      expect(TaskStatus.Overdue).toBe(3);
    });

    it('should be usable for status comparison', () => {
      const task: Task = {
        id: 1,
        title: 'Test',
        description: '',
        status: TaskStatus.Done,
        creation_date: '2024-11-12',
        active: 1
      };

      expect(task.status === TaskStatus.Done).toBe(true);
      expect(task.status === TaskStatus.Open).toBe(false);
      expect(task.status === TaskStatus.Overdue).toBe(false);
    });

    it('should allow status to be set using numeric values', () => {
      const task: Task = {
        id: 1,
        title: 'Test',
        description: '',
        status: 2, // Done
        creation_date: '2024-11-12',
        active: 1
      };

      expect(task.status).toBe(TaskStatus.Done);
      expect(task.status).toBe(2);
    });

    it('should support status transitions', () => {
      const task: Task = {
        id: 1,
        title: 'Evolving Task',
        description: '',
        status: TaskStatus.Open,
        creation_date: '2024-11-12',
        active: 1
      };

      expect(task.status).toBe(TaskStatus.Open);

      // Mark as done
      task.status = TaskStatus.Done;
      expect(task.status).toBe(TaskStatus.Done);

      // Mark as overdue (unlikely transition but valid)
      task.status = TaskStatus.Overdue;
      expect(task.status).toBe(TaskStatus.Overdue);
    });
  });

  describe('Task creation scenarios', () => {
    it('should create task with minimal data', () => {
      const task: Task = {
        id: 0,
        title: 'New Task',
        description: '',
        status: TaskStatus.Open,
        creation_date: new Date().toISOString().split('T')[0],
        active: 1
      };

      expect(task.id).toBe(0);
      expect(task.title).toBeTruthy();
      expect(task.status).toBe(TaskStatus.Open);
      expect(task.active).toBe(1);
    });

    it('should handle multi-line descriptions', () => {
      const task: Task = {
        id: 5,
        title: 'Task with long description',
        description: 'Line 1\nLine 2\nLine 3',
        status: TaskStatus.Open,
        creation_date: '2024-11-12',
        active: 1
      };

      expect(task.description).toContain('\n');
      expect(task.description.split('\n')).toHaveLength(3);
    });

    it('should handle special characters in title and description', () => {
      const task: Task = {
        id: 6,
        title: 'Task with émojis 🎯 and spëcial çhars',
        description: 'Test & verify <tags> "quotes" \'apostrophes\'',
        status: TaskStatus.Open,
        creation_date: '2024-11-12',
        active: 1
      };

      expect(task.title).toContain('🎯');
      expect(task.description).toContain('&');
      expect(task.description).toContain('<tags>');
    });
  });

  describe('Task inactive state', () => {
    it('should support inactive tasks', () => {
      const task: Task = {
        id: 10,
        title: 'Inactive Task',
        description: '',
        status: TaskStatus.Open,
        creation_date: '2024-11-12',
        active: 0
      };

      expect(task.active).toBe(0);
    });
  });
});
