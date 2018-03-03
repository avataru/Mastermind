const sqlite3 = require('sqlite3').verbose();
const TransactionDatabase = require("sqlite3-transactions").TransactionDatabase;
let db = new TransactionDatabase(
    new sqlite3.Database('./../db/mastermind.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE)
);

   
db.all(`SELECT username, module, trade1, trade2, trade3, trade4, trade5 FROM tr_tech ORDER BY username COLLATE NOCASE ASC`, [], (error, rows) => {
    if (error) {
        return console.log(`Unable to retrieve the transport tech`, error.message);
    }

    rows.forEach(row => {
        db.run(`REPLACE INTO tr_tech2 (userId, username, hold, module, trade1, trade2, trade3, trade4, trade5) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [row.userId, row.username, '?', row.mod1, row.trade1, row.trade2, row.trade3, row.trade4, row.trade5], function(error) {
            if (error) {
                return console.log(`Unable to save transport tech for user ${row.username} (${row.userId})`, error.message);
            }
        });
    });                
});

db.run('DROP TABLE IF EXISTS tr_tech;')
     