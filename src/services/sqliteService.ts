import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection, capSQLiteUpgradeOptions } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

export interface ISQLiteService {
    getPlatform(): string
    initWebStore(): Promise<void>
    addUpgradeStatement(options: capSQLiteUpgradeOptions): Promise<void>
    openDatabase(dbName: string, loadToVersion: number, readOnly: boolean): Promise<SQLiteDBConnection>
    closeDatabase(dbName: string, readOnly: boolean): Promise<void>
    saveToStore(dbName: string): Promise<void>
    saveToLocalDisk(dbName: string): Promise<void>
    isConnection(dbName: string, readOnly: boolean): Promise<boolean>
};

class SQLiteService implements ISQLiteService {
    platform = Capacitor.getPlatform();
    sqlitePlugin = CapacitorSQLite;
    sqliteConnection = new SQLiteConnection(CapacitorSQLite);
    dbNameVersionDict: Map<string, number> = new Map();

    getPlatform(): string {
        return this.platform;
    }
    async initWebStore(): Promise<void> {
        // Not needed for native platforms
        return;
    }
    async addUpgradeStatement(options: capSQLiteUpgradeOptions): Promise<void> {
        try {
            await this.sqlitePlugin.addUpgradeStatement(options);
        } catch (error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`sqliteService.addUpgradeStatement: ${msg}`);
        }
        return;
    }
    async openDatabase(dbName: string, loadToVersion: number,
        readOnly: boolean): Promise<SQLiteDBConnection> {
        this.dbNameVersionDict.set(dbName, loadToVersion);
        const encrypted = true;
        const mode = encrypted ? "secret" : "no-encryption";
        try {
            let db: SQLiteDBConnection;
            const retCC = (await this.sqliteConnection.checkConnectionsConsistency()).result;
            const isConn = (await this.sqliteConnection.isConnection(dbName, readOnly)).result;
            
            if (retCC && isConn) {
                // Connection exists and is consistent, retrieve it
                db = await this.sqliteConnection.retrieveConnection(dbName, readOnly);
                // Verify the connection is actually open
                const isOpen = await db.isDBOpen();
                if (!isOpen.result) {
                    // Connection exists but is closed, open it
                    await db.open();
                }
            } else {
                // Connection doesn't exist or is inconsistent, create new one
                // If connection exists but is inconsistent, close it first
                if (isConn) {
                    try {
                        await this.sqliteConnection.closeConnection(dbName, readOnly);
                    } catch (closeError) {
                        // Ignore errors when closing inconsistent connection
                    }
                }
                db = await this.sqliteConnection
                    .createConnection(dbName, encrypted, mode, loadToVersion, readOnly);
                await db.open();
            }

            // Verify database is open
            const isOpen = await db.isDBOpen();
            if (!isOpen.result) {
                throw new Error(`Database ${dbName} failed to open`);
            }

            return db;

        } catch (error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`sqliteService.openDatabase: ${msg}`);
        }

    }
    async isConnection(dbName: string, readOnly: boolean): Promise<boolean> {
        try {
            const isConn = (await this.sqliteConnection.isConnection(dbName, readOnly)).result;
            if (isConn != undefined) {
                return isConn
            } else {
                throw new Error(`sqliteService.isConnection undefined`);
            }

        } catch (error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`sqliteService.isConnection: ${msg}`);
        }
    }
    async closeDatabase(dbName: string, readOnly: boolean): Promise<void> {
        try {
            const isConn = (await this.sqliteConnection.isConnection(dbName, readOnly)).result;
            if (isConn) {
                await this.sqliteConnection.closeConnection(dbName, readOnly);
            }
            return;
        } catch (error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`sqliteService.closeDatabase: ${msg}`);
        }
    }
    async saveToStore(dbName: string): Promise<void> {
        try {
            await this.sqliteConnection.saveToStore(dbName);
            return;
        } catch (error: any) {
            const msg = error.message ? error.message : error;
            throw new Error(`sqliteService.saveToStore: ${msg}`);
        }
    }
    async saveToLocalDisk(dbName: string): Promise<void> {
        try {
            await this.sqliteConnection.saveToLocalDisk(dbName);
            return;
        } catch (err: any) {
            const msg = err.message ? err.message : err;
            throw new Error(`sqliteService.saveToLocalDisk: ${msg}`);
        }
    }
}
export default new SQLiteService();