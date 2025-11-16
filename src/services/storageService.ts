import { BehaviorSubject } from 'rxjs';
import { ISQLiteService } from '../services/sqliteService';
import { IDbVersionService } from '../services/dbVersionService';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { TaskUpgradeStatements } from '../upgrades/task.upgrade.statements';
import { Task } from '../models/Task';

export interface IStorageService {
    initializeDatabase(): Promise<void>
    getTasks(): Promise<Task[]>
    getTasksByDate(date: string): Promise<Task[]>
    addTask(task: Task): Promise<number>
    updateTask(task: Task): Promise<void>
    getDatabaseName(): string
    getDatabaseVersion(): number
    updateTaskDescriptionById(id: number, description: string): Promise<void>
    deleteAllTasks(): Promise<void>
    deleteTasksByDate(date: string): Promise<void>
    deleteTaskById(id: number): Promise<void>
    getMostRecentDateWithTasks(excludeDate?: string): Promise<string | null>
    copyUndoneTasksFromDateToToday(fromDate: string, todayDate: string): Promise<number>
    copyAllTasksFromDateToToday(fromDate: string, todayDate: string): Promise<number>
    markPreviousIncompleteTasksAsOverdue(beforeDate: string): Promise<number>
    markIncompleteTasksForDateAsOverdue(date: string): Promise<number>
};
class StorageService implements IStorageService {
    versionUpgrades = TaskUpgradeStatements;
    loadToVersion = TaskUpgradeStatements[TaskUpgradeStatements.length - 1].toVersion;
    db!: SQLiteDBConnection;
    database: string = 'mycarddb';
    sqliteServ!: ISQLiteService;
    dbVerServ!: IDbVersionService;
    isInitCompleted = new BehaviorSubject(false);

    constructor(sqliteService: ISQLiteService, dbVersionService: IDbVersionService) {
        this.sqliteServ = sqliteService;
        this.dbVerServ = dbVersionService;
    }

    getDatabaseName(): string {
        return this.database;
    }
    getDatabaseVersion(): number {
        return this.loadToVersion;
    }
    async initializeDatabase(): Promise<void> {
        // create upgrade statements
        try {
            await this.sqliteServ.addUpgradeStatement({
                database: this.database,
                upgrade: this.versionUpgrades
            });
            this.db = await this.sqliteServ.openDatabase(this.database, this.loadToVersion, false);

            // Verify database is properly opened
            if (!this.db) {
                throw new Error('Database connection is null');
            }

            const isData = await this.db.query("select * from sqlite_sequence");
            if (isData.values!.length === 0) {
                // create database initial cards if any

            }

            this.dbVerServ.setDbVersion(this.database, this.loadToVersion);
            this.isInitCompleted.next(true);
        } catch (error: unknown) {
            const errorMessage = (error as Error).message || String(error);
            throw new Error(`storageService.initializeDatabase: ${errorMessage}`);
        }
    }
    async getTasks(): Promise<Task[]> {
        if (!this.db) {
            throw new Error('Database connection not initialized');
        }
        const result = await this.db.query('SELECT * FROM tasks;');
        return (result.values || []) as Task[];
    }
    async getTasksByDate(date: string): Promise<Task[]> {
        if (!this.db) {
            throw new Error('Database connection not initialized');
        }
        const sql = `SELECT * FROM tasks WHERE creation_date = ?;`;
        const result = await this.db.query(sql, [date]);
        return (result.values || []) as Task[];
    }
    async addTask(task: Task): Promise<number> {
        const sql = `INSERT INTO tasks (title, description, status, creation_date, active) VALUES (?, ?, ?, ?, ?);`;
        const res = await this.db.run(sql, [
            task.title,
            task.description || '',
            task.status || 1,
            task.creation_date || '',
            task.active || 1
        ]);
        if (res.changes !== undefined
            && res.changes.lastId !== undefined && res.changes.lastId > 0) {
            return res.changes.lastId;
        } else {
            throw new Error(`storageService.addTask: lastId not returned`);
        }
    }
    async updateTask(task: Task): Promise<void> {
        const sql = `UPDATE tasks SET title=?, description=?, status=? WHERE id=?`;
        await this.db.run(sql, [task.title, task.description || '', task.status, task.id]);
    }
    async updateTaskDescriptionById(id: number, description: string): Promise<void> {
        const sql = `UPDATE tasks SET description=? WHERE id=?`;
        await this.db.run(sql, [description, id]);
    }
    async deleteAllTasks(): Promise<void> {
        const sql = `DELETE FROM tasks`;
        await this.db.run(sql);
    }
    async deleteTasksByDate(date: string): Promise<void> {
        const sql = `DELETE FROM tasks WHERE creation_date = ?`;
        await this.db.run(sql, [date]);
    }
    async deleteTaskById(id: number): Promise<void> {
        const sql = `DELETE FROM tasks WHERE id = ?`;
        await this.db.run(sql, [id]);
    }
    async getMostRecentDateWithTasks(excludeDate?: string): Promise<string | null> {
        try {
            let sql = `SELECT DISTINCT creation_date FROM tasks`;
            const params: any[] = [];

            if (excludeDate) {
                sql += ` WHERE creation_date != ?`;
                params.push(excludeDate);
            }

            sql += ` ORDER BY creation_date DESC LIMIT 1`;

            const result = await this.db.query(sql, params);

            if (result.values && result.values.length > 0) {
                return result.values[0].creation_date;
            }

            return null;
        } catch (error) {
            throw error;
        }
    }

    async copyUndoneTasksFromDateToToday(fromDate: string, todayDate: string): Promise<number> {
        try {
            // Get tasks from the specified date
            const previousTasks = await this.getTasksByDate(fromDate);

            if (previousTasks.length === 0) {
                return 0;
            }

            // Copy only undone tasks (status != Done which is 2)
            let copiedCount = 0;
            for (const task of previousTasks) {
                // Only copy if task is not done (status == 1 is Open)
                if (task.status !== 2) { // TaskStatus.Done = 2
                    const newTask: Task = {
                        id: 0, // Will be auto-generated
                        title: task.title,
                        description: task.description,
                        status: 1, // Reset to Open
                        creation_date: todayDate,
                        active: 1
                    };
                    await this.addTask(newTask);
                    copiedCount++;
                }
            }

            return copiedCount;
        } catch (error) {
            throw error;
        }
    }

    async copyAllTasksFromDateToToday(fromDate: string, todayDate: string): Promise<number> {
        try {
            // Get tasks from the specified date
            const previousTasks = await this.getTasksByDate(fromDate);

            if (previousTasks.length === 0) {
                return 0;
            }

            // Copy all tasks, preserving their status
            let copiedCount = 0;
            for (const task of previousTasks) {
                const newTask: Task = {
                    id: 0, // Will be auto-generated
                    title: task.title,
                    description: task.description,
                    status: task.status, // Preserve original status
                    creation_date: todayDate,
                    active: 1
                };
                await this.addTask(newTask);
                copiedCount++;
            }

            return copiedCount;
        } catch (error) {
            throw error;
        }
    }

    async markPreviousIncompleteTasksAsOverdue(beforeDate: string): Promise<number> {
        try {
            // Update all tasks with creation_date < beforeDate
            // and status != Done (2) to status = Overdue (3)
            const sql = `UPDATE tasks SET status = 3 WHERE creation_date < ? AND status != 2`;
            const result = await this.db.run(sql, [beforeDate]);

            // Return the number of rows updated
            return result.changes?.changes || 0;
        } catch (error) {
            throw error;
        }
    }

    async markIncompleteTasksForDateAsOverdue(date: string): Promise<number> {
        try {
            // Update all tasks with creation_date = date
            // and status != Done (2) to status = Overdue (3)
            const sql = `UPDATE tasks SET status = 3 WHERE creation_date = ? AND status != 2`;
            const result = await this.db.run(sql, [date]);

            // Return the number of rows updated
            return result.changes?.changes || 0;
        } catch (error) {
            throw error;
        }
    }
}
export default StorageService;