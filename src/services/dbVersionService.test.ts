import { describe, it, expect, beforeEach } from 'vitest';
import DbVersionService from './dbVersionService';

describe('DbVersionService', () => {
  beforeEach(() => {
    // Clear the version dictionary before each test
    DbVersionService.dbNameVersionDict.clear();
  });

  describe('setDbVersion', () => {
    it('should set database version', () => {
      DbVersionService.setDbVersion('testdb', 1);

      const version = DbVersionService.getDbVersion('testdb');
      expect(version).toBe(1);
    });

    it('should update existing database version', () => {
      DbVersionService.setDbVersion('testdb', 1);
      DbVersionService.setDbVersion('testdb', 2);

      const version = DbVersionService.getDbVersion('testdb');
      expect(version).toBe(2);
    });

    it('should handle multiple databases independently', () => {
      DbVersionService.setDbVersion('db1', 1);
      DbVersionService.setDbVersion('db2', 5);
      DbVersionService.setDbVersion('db3', 10);

      expect(DbVersionService.getDbVersion('db1')).toBe(1);
      expect(DbVersionService.getDbVersion('db2')).toBe(5);
      expect(DbVersionService.getDbVersion('db3')).toBe(10);
    });
  });

  describe('getDbVersion', () => {
    it('should return undefined for non-existent database', () => {
      const version = DbVersionService.getDbVersion('nonexistent');
      expect(version).toBeUndefined();
    });

    it('should retrieve correct version for existing database', () => {
      DbVersionService.setDbVersion('mydb', 42);

      const version = DbVersionService.getDbVersion('mydb');
      expect(version).toBe(42);
    });

    it('should handle version 0', () => {
      DbVersionService.setDbVersion('zeroversion', 0);

      const version = DbVersionService.getDbVersion('zeroversion');
      expect(version).toBe(0);
    });
  });

  describe('Database name handling', () => {
    it('should be case-sensitive for database names', () => {
      DbVersionService.setDbVersion('TestDB', 1);
      DbVersionService.setDbVersion('testdb', 2);

      expect(DbVersionService.getDbVersion('TestDB')).toBe(1);
      expect(DbVersionService.getDbVersion('testdb')).toBe(2);
    });

    it('should handle database names with special characters', () => {
      DbVersionService.setDbVersion('my-database_v2', 3);

      const version = DbVersionService.getDbVersion('my-database_v2');
      expect(version).toBe(3);
    });
  });
});
