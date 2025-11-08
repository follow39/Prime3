import { ISQLiteService } from '../services/sqliteService';
import { IStorageService } from '../services/storageService';

export interface IInitializeAppService {
    initializeApp(): Promise<boolean>
};

class InitializeAppService implements IInitializeAppService {
    appInit = false;
    sqliteServ!: ISQLiteService;
    storageServ!: IStorageService;

    constructor(sqliteService: ISQLiteService, storageService: IStorageService) {
        this.sqliteServ = sqliteService;
        this.storageServ = storageService;
    }
    async initializeApp(): Promise<boolean> {
        if (!this.appInit) {
            try {
                // Initialize the myuserdb database
                await this.storageServ.initializeDatabase();
                this.appInit = true;
            } catch (error: any) {
                const msg = error.message ? error.message : error;
                throw new Error(`initializeAppError.initializeApp: ${msg}`);
            }
        }
        return this.appInit;
    }
}
export default InitializeAppService;