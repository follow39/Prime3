import { BehaviorSubject } from 'rxjs';
import { ISQLiteService } from '../services/sqliteService';
import { IDbVersionService } from '../services/dbVersionService';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { CardUpgradeStatements } from '../upgrades/card.upgrade.statements';
import { Card } from '../models/Card';

export interface IStorageService {
    initializeDatabase(): Promise<void>
    getCards(): Promise<Card[]>
    getCardsByDate(date: string): Promise<Card[]>
    addCard(card: Card): Promise<number>
    updateCard(card: Card): Promise<void>
    getDatabaseName(): string
    getDatabaseVersion(): number
    updateCardDescriptionById(id: number, description: string): Promise<void>
    deleteAllCards(): Promise<void>
    deleteCardsByDate(date: string): Promise<void>
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
    async getCardsByDate(date: string): Promise<Card[]> {
        const sql = `SELECT * FROM cards WHERE creation_date = ?;`;
        const result = await this.db.query(sql, [date]);
        return result.values as Card[];
    }
    async addCard(card: Card): Promise<number> {
        const sql = `INSERT INTO cards (title, description, status, creation_date, active) VALUES (?, ?, ?, ?, ?);`;
        const res = await this.db.run(sql, [
            card.title,
            card.description || '',
            card.status || 1,
            card.creation_date || '',
            card.active || 1
        ]);
        if (res.changes !== undefined
            && res.changes.lastId !== undefined && res.changes.lastId > 0) {
            return res.changes.lastId;
        } else {
            throw new Error(`storageService.addCard: lastId not returned`);
        }
    }
    async updateCard(card: Card): Promise<void> {
        const sql = `UPDATE cards SET title=?, description=?, status=? WHERE id=?`;
        await this.db.run(sql, [card.title, card.description || '', card.status, card.id]);
    }
    async updateCardDescriptionById(id: number, description: string): Promise<void> {
        const sql = `UPDATE cards SET description=? WHERE id=?`;
        await this.db.run(sql, [description, id]);
    }
    async deleteAllCards(): Promise<void> {
        const sql = `DELETE FROM cards`;
        await this.db.run(sql);
    }
    async deleteCardsByDate(date: string): Promise<void> {
        const sql = `DELETE FROM cards WHERE creation_date = ?`;
        await this.db.run(sql, [date]);
    }
}
export default StorageService;