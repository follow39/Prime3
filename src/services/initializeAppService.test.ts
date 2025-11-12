import { describe, it, expect, beforeEach, vi } from 'vitest';
import InitializeAppService from './initializeAppService';
import { ISQLiteService } from './sqliteService';
import { IStorageService } from './storageService';

describe('InitializeAppService', () => {
  let mockSqliteService: ISQLiteService;
  let mockStorageService: IStorageService;
  let initializeAppService: InitializeAppService;

  beforeEach(() => {
    // Create mock services
    mockSqliteService = {
      getPlatform: vi.fn(),
      initWebStore: vi.fn(),
      addUpgradeStatement: vi.fn(),
      openDatabase: vi.fn(),
      closeDatabase: vi.fn(),
      saveToStore: vi.fn(),
      saveToLocalDisk: vi.fn(),
      isConnection: vi.fn(),
    } as ISQLiteService;

    mockStorageService = {
      initializeDatabase: vi.fn().mockResolvedValue(undefined),
      getTasks: vi.fn(),
      getTasksByDate: vi.fn(),
      addTask: vi.fn(),
      updateTask: vi.fn(),
      getDatabaseName: vi.fn(),
      getDatabaseVersion: vi.fn(),
      updateTaskDescriptionById: vi.fn(),
      deleteAllTasks: vi.fn(),
      deleteTasksByDate: vi.fn(),
      deleteTaskById: vi.fn(),
      getMostRecentDateWithTasks: vi.fn(),
      copyUndoneTasksFromDateToToday: vi.fn(),
      copyAllTasksFromDateToToday: vi.fn(),
      markPreviousIncompleteTasksAsOverdue: vi.fn(),
      markIncompleteTasksForDateAsOverdue: vi.fn(),
    } as IStorageService;

    initializeAppService = new InitializeAppService(mockSqliteService, mockStorageService);
  });

  describe('initializeApp', () => {
    it('should initialize database on first call', async () => {
      const result = await initializeAppService.initializeApp();

      expect(result).toBe(true);
      expect(mockStorageService.initializeDatabase).toHaveBeenCalledTimes(1);
    });

    it('should set appInit to true after successful initialization', async () => {
      await initializeAppService.initializeApp();

      expect(initializeAppService.appInit).toBe(true);
    });

    it('should not reinitialize on subsequent calls', async () => {
      await initializeAppService.initializeApp();
      await initializeAppService.initializeApp();
      await initializeAppService.initializeApp();

      expect(mockStorageService.initializeDatabase).toHaveBeenCalledTimes(1);
    });

    it('should return true on subsequent calls without reinitializing', async () => {
      await initializeAppService.initializeApp();
      const result = await initializeAppService.initializeApp();

      expect(result).toBe(true);
    });

    it('should throw error when database initialization fails', async () => {
      const errorMessage = 'Database connection failed';
      (mockStorageService.initializeDatabase as any).mockRejectedValue(
        new Error(errorMessage)
      );

      await expect(initializeAppService.initializeApp()).rejects.toThrow(
        `initializeAppError.initializeApp: ${errorMessage}`
      );
    });

    it('should not set appInit to true if initialization fails', async () => {
      (mockStorageService.initializeDatabase as any).mockRejectedValue(
        new Error('Init failed')
      );

      try {
        await initializeAppService.initializeApp();
      } catch (error) {
        // Expected to throw
      }

      expect(initializeAppService.appInit).toBe(false);
    });

    it('should retry initialization after a previous failure', async () => {
      // First attempt fails
      (mockStorageService.initializeDatabase as any).mockRejectedValueOnce(
        new Error('First attempt failed')
      );

      try {
        await initializeAppService.initializeApp();
      } catch (error) {
        // Expected
      }

      expect(initializeAppService.appInit).toBe(false);

      // Second attempt succeeds
      (mockStorageService.initializeDatabase as any).mockResolvedValueOnce(undefined);

      const result = await initializeAppService.initializeApp();

      expect(result).toBe(true);
      expect(initializeAppService.appInit).toBe(true);
      expect(mockStorageService.initializeDatabase).toHaveBeenCalledTimes(2);
    });

    it('should handle non-Error objects thrown during initialization', async () => {
      (mockStorageService.initializeDatabase as any).mockRejectedValue(
        'String error'
      );

      await expect(initializeAppService.initializeApp()).rejects.toThrow(
        'initializeAppError.initializeApp: String error'
      );
    });
  });

  describe('Service injection', () => {
    it('should correctly inject SQLiteService', () => {
      expect(initializeAppService.sqliteServ).toBe(mockSqliteService);
    });

    it('should correctly inject StorageService', () => {
      expect(initializeAppService.storageServ).toBe(mockStorageService);
    });
  });
});
