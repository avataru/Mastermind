const _ = require('lodash');
const Table = require('easy-table');
const lib = require('../lib/tech_library');
const self = module.exports;

let addHeadingRow = function(table, heading) {
    table.cell('Player', heading);
    table.cell('Hold', '');
    table.cell('Module', '');
    table.cell('Trade', '');
    table.newRow();
} 

let addPlayerRow = function(table, row) {
    table.cell('Player', row.username);
    table.cell('Hold', row.hold);
    table.cell('Module', row.module);
    table.cell('Trade', 
        (row.trade1 === '' ? '' : row.trade1) + 
        (row.trade2 === '' ? '' : ', ' + row.trade2) + 
        (row.trade3 === '' ? '' : ', ' + row.trade3) + 
        (row.trade4 === '' ? '' : ', ' + row.trade4) + 
        (row.trade5 === '' ? '' : ', ' + row.trade5));                
    table.newRow();
}

exports.config = {    
};

exports.help = {
    name: 'ttr',
    description: 'Manage player transport information',
    usage: 'ttr [hold] [module] [trade] [trade] [trade] [trade] [trade]\n\n' + 
        lib.moduleHelp + '\n' +
        lib.tradeHelp + '\n\n' + 
        'Example: !ttr 10 twrp3 cbe5 scmp3 trbo3'
};

exports.init = (client) => {
    client.db.beginTransaction((error, transaction) => {
        transaction.run(`CREATE TABLE IF NOT EXISTS tr_tech2 (
            userId TEXT NOT NULL PRIMARY KEY,
            username TEXT NOT NULL,
            hold TEXT,
            module TEXT,
            trade1 TEXT,
            trade2 TEXT,
            trade3 TEXT,
            trade4 TEXT,
            trade5 TEXT
        );`);
        transaction.run(`CREATE UNIQUE INDEX IF NOT EXISTS unique_username ON tr_tech2 (username);`);
        transaction.commit(error => {
            if (error) {
                return console.log(`Unable to create the tr_tech2 table`, error.message);
            }
        });         
    });
};

exports.run = (client, message, args) => {
    
    // display
    if (args === null || args.length === 0) {
        client.db.all(`SELECT userId, username, hold, module, trade1, trade2, trade3, trade4, trade5 FROM tr_tech2 ORDER BY username COLLATE NOCASE ASC`, [], (error, rows) => {
            if (error) {
                return console.log(`Unable to retrieve the transport tech`, error.message);
            }

            let table = new Table;
            let teamARows = [], teamBRows = [], teamCRows = [], noTeamRows = [];

            _.map(rows, row => {                
                if (client.guilds.first().members.find('id', row.userId).roles.some(x => x.name === 'Team A')) {
                    teamARows.push(row)
                } else if (client.guilds.first().members.find('id', row.userId).roles.some(x => x.name === 'Team B')) {
                    teamBRows.push(row)
                } else if (client.guilds.first().members.find('id', row.userId).roles.some(x => x.name === 'Team C')) {
                    teamCRows.push(row)
                } else {
                    noTeamRows.push(row)
                }
            });

            if (teamARows.length) {
                addHeadingRow(table, '*Team A*')
                teamARows.forEach(row => { addPlayerRow(table, row) });
            }

            if (teamBRows.length) {
                addHeadingRow(table, '*Team B*')
                teamBRows.forEach(row => { addPlayerRow(table, row) });
            }

            if (teamCRows.length) {
                addHeadingRow(table, '*Team C*')
                teamCRows.forEach(row => { addPlayerRow(table, row) });
            }

            if (noTeamRows.length) {
                if (teamARows.length || teamBRows.length || teamCRows.length) {
                    addHeadingRow(table, '*Other*')
                }
                
                noTeamRows.forEach(row => { addPlayerRow(table, row) });
            }

            message.channel.send(`= Player Transport Tech =\n\n${table.toString()}`, {code:'asciidoc'});
        });

        return;
    }
    
    const hold = args[0] || ''
    const mod1 = args[1] || '';
    const trade1 = args[2] || '';
    const trade2 = args[3] || '';
    const trade3 = args[4] || '';
    const trade4 = args[5] || '';
    const trade5 = args[6] || '';
    
    if (isNaN(hold) || +hold <= 0 || +hold > 20) {
        message.channel.send(`Invalid cargo hold number **${hold}**\nPlease use a number between 1 and 20.`);
        return;
    }

    if (mod1 !== '' && !lib.moduleRegEx.test(mod1)) {
        message.channel.send(`Invalid module **${mod1}**\n${lib.moduleHelp}`);
        return;
    }

    if (trade1 !== '' && !lib.tradeRegEx.test(trade1)) {
        message.channel.send(`Invalid module **${trade1}**\n${lib.tradeHelp}`);
        return;
    }

    if (trade2 !== '' && !lib.tradeRegEx.test(trade2)) {
        message.channel.send(`Invalid module **${trade2}**\n${lib.tradeHelp}`);
        return;
    }

    if (trade3 !== '' && !lib.tradeRegEx.test(trade3)) {
        message.channel.send(`Invalid module **${trade3}**\n${lib.tradeHelp}`);
        return;
    }

    if (trade4 !== '' && !lib.tradeRegEx.test(trade4)) {
        message.channel.send(`Invalid module **${trade4}**\n${lib.tradeHelp}`);
        return;
    }    

    if (trade5 !== '' && !lib.tradeRegEx.test(trade5)) {
        message.channel.send(`Invalid module **${trade5}**\n${lib.tradeHelp}`);
        return;
    }

    let userId = message.member.user.id;
    let username = message.member.nickname || message.member.user.username;
    
    client.db.run(`REPLACE INTO tr_tech2 (userId, username, hold, module, trade1, trade2, trade3, trade4, trade5) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [userId, username, hold, mod1, trade1, trade2, trade3, trade4, trade5], function(error) {
        if (error) {
            return console.log(`Unable to save transport tech for user ${username} (${userId})`, error.message);
        }
    });

    message.react(`👌`);
};
