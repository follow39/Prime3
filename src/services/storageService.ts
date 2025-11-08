import { BehaviorSubject } from 'rxjs';
import { ISQLiteService } from '../services/sqliteService';
import { IDbVersionService } from '../services/dbVersionService';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { CardUpgradeStatements } from '../upgrades/card.upgrade.statements';
import { Card } from '../models/Card';

export interface IStorageService {
    initializeDatabase(): Promise<void>
    getCards(): Promise<Card[]>
    addCard(card: Card): Promise<number>
    // updateCardById(id: string, active: number): Promise<void>
    // deleteCardById(id: string): Promise<void>
    getDatabaseName(): string
    getDatabaseVersion(): number
    updateCardDescriptionById(id: number, description: string): Promise<void>
    deleteAllCards(): Promise<void>
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
    async getCards(): Promise<Card[]> {
        return (await this.db.query('SELECT * FROM cards;')).values as Card[];
    }
    async addCard(card: Card): Promise<number> {
        const sql = `INSERT INTO cards (title) VALUES (?);`;
        const res = await this.db.run(sql, [card.title]);
        if (res.changes !== undefined
            && res.changes.lastId !== undefined && res.changes.lastId > 0) {
            return res.changes.lastId;
        } else {
            throw new Error(`storageService.addCard: lastId not returned`);
        }
    }
    async updateCardDescriptionById(id: number, description: string): Promise<void> {
        const sql = `UPDATE cards SET description=? WHERE id=?`;
        await this.db.run(sql, [description, id]);
    }
    // async updateCardById(id: number, active: number): Promise<void> {
    //     const sql = `UPDATE cards SET active=${active} WHERE id=${id}`;
    //     await this.db.run(sql);
    // }
    // async deleteCardById(id: number): Promise<void> {
    //     const sql = `DELETE FROM cards WHERE id=${id}`;
    //     await this.db.run(sql);
    // }
    async deleteAllCards(): Promise<void> {
        const sql = `DELETE FROM cards`;
        await this.db.run(sql);
    }
}
export default StorageService;