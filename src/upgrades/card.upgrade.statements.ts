export const CardUpgradeStatements = [
    {
    toVersion: 1,
    statements: [
        `CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status INTEGER DEFAULT 1,
        end_time TEXT,
        creation_date TEXT,
        active INTEGER DEFAULT 1
        );`
    ]
    },
    /* add new statements below for next database version when required*/
]