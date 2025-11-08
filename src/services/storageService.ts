import { BehaviorSubject } from 'rxjs';
import { ISQLiteService } from '../services/sqliteService';
import { IDbVersionService } from '../services/dbVersionService';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { CardUpgradeStatements } from '../upgrades/card.upgrade.statements';
import { Objective } from '../models/Objective';

export interface IStorageService {
    initializeDatabase(): Promise<void>
    getObjectives(): Promise<Objective[]>
    getObjectivesByDate(date: string): Promise<Objective[]>
    addObjective(objective: Objective): Promise<number>
    updateObjective(objective: Objective): Promise<void>
    getDatabaseName(): string
    getDatabaseVersion(): number
    updateObjectiveDescriptionById(id: number, description: string): Promise<void>
    deleteAllObjectives(): Promise<void>
    deleteObjectivesByDate(date: string): Promise<void>
    getMostRecentDateWithObjectives(excludeDate?: string): Promise<string | null>
    copyUndoneObjectivesFromDateToToday(fromDate: string, todayDate: string): Promise<number>
};
class StorageService implements IStorageService {
    versionUpgrades = CardUpgradeStatements;
    loadToVersion = CardUpgradeStatements[CardUpgradeStatements.length - 1].toVersion;
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
        } catch (error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`storageService.initializeDatabase: ${msg}`);
        }
    }
    async getObjectives(): Promise<Objective[]> {
        return (await this.db.query('SELECT * FROM objectives;')).values as Objective[];
    }
    async getObjectivesByDate(date: string): Promise<Objective[]> {
        const sql = `SELECT * FROM objectives WHERE creation_date = ?;`;
        const result = await this.db.query(sql, [date]);
        return result.values as Objective[];
    }
    async addObjective(objective: Objective): Promise<number> {
        const sql = `INSERT INTO objectives (title, description, status, creation_date, active) VALUES (?, ?, ?, ?, ?);`;
        const res = await this.db.run(sql, [
            objective.title,
            objective.description || '',
            objective.status || 1,
            objective.creation_date || '',
            objective.active || 1
        ]);
        if (res.changes !== undefined
            && res.changes.lastId !== undefined && res.changes.lastId > 0) {
            return res.changes.lastId;
        } else {
            throw new Error(`storageService.addObjective: lastId not returned`);
        }
    }
    async updateObjective(objective: Objective): Promise<void> {
        const sql = `UPDATE objectives SET title=?, description=?, status=? WHERE id=?`;
        await this.db.run(sql, [objective.title, objective.description || '', objective.status, objective.id]);
    }
    async updateObjectiveDescriptionById(id: number, description: string): Promise<void> {
        const sql = `UPDATE objectives SET description=? WHERE id=?`;
        await this.db.run(sql, [description, id]);
    }
    async deleteAllObjectives(): Promise<void> {
        const sql = `DELETE FROM objectives`;
        await this.db.run(sql);
    }
    async deleteObjectivesByDate(date: string): Promise<void> {
        const sql = `DELETE FROM objectives WHERE creation_date = ?`;
        await this.db.run(sql, [date]);
    }
    async getMostRecentDateWithObjectives(excludeDate?: string): Promise<string | null> {
        try {
            let sql = `SELECT DISTINCT creation_date FROM objectives`;
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
            console.error('Error getting most recent date with objectives:', error);
            throw error;
        }
    }

    async copyUndoneObjectivesFromDateToToday(fromDate: string, todayDate: string): Promise<number> {
        try {
            // Get objectives from the specified date
            const previousObjectives = await this.getObjectivesByDate(fromDate);

            if (previousObjectives.length === 0) {
                return 0;
            }

            // Copy only undone objectives (status != Done which is 2)
            let copiedCount = 0;
            for (const objective of previousObjectives) {
                // Only copy if objective is not done (status == 1 is Open)
                if (objective.status !== 2) { // ObjectiveStatus.Done = 2
                    const newObjective: Objective = {
                        id: 0, // Will be auto-generated
                        title: objective.title,
                        description: objective.description,
                        status: 1, // Reset to Open
                        creation_date: todayDate,
                        active: 1
                    };
                    await this.addObjective(newObjective);
                    copiedCount++;
                }
            }

            return copiedCount;
        } catch (error) {
            console.error('Error copying undone objectives:', error);
            throw error;
        }
    }
}
export default StorageService;