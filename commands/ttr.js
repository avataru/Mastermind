const _ = require('lodash');
const Table = require('easy-table');
const validation = require('../lib/validation');
const self = module.exports;

exports.config = {
    enabled: true,
    setOther: ['First Officer', 'Officer'],
    accent: 0xFFD700
};

exports.help = {
    name: 'ttr',
    description: 'Manage player transport information',
    usage: 'ttr [module] [trade] [trade] [trade] [trade] [trade]\n' + 
    validation.invalidModuleError + '\n' +
    validation.invalidTradeError
};

exports.init = (client) => {
    client.db.beginTransaction((error, transaction) => {
        transaction.run(`CREATE TABLE IF NOT EXISTS tr_tech (
            userId TEXT NOT NULL PRIMARY KEY,
            username TEXT NOT NULL,
            module TEXT,
            trade1 TEXT,
            trade2 TEXT,
            trade3 TEXT,
            trade4 TEXT,
            trade5 TEXT
        );`);
        transaction.run(`CREATE UNIQUE INDEX IF NOT EXISTS unique_username ON tr_tech (username);`);
        transaction.commit(error => {
            if (error) {
                return console.log(`Unable to create the tr_tech table`, error.message);
            }
        });
    });
};

exports.run = (client, message, args) => {
    
    // display
    if (args === null || args.length === 0) {
        client.db.all(`SELECT username, module, trade1, trade2, trade3, trade4, trade5 FROM tr_tech ORDER BY username COLLATE NOCASE ASC`, [], (error, rows) => {
            if (error) {
                return console.log(`Unable to retrieve the transport tech`, error.message);
            }

            let table = new Table;
            _.map(rows, row => {
                table.cell('Player', row.username);
                table.cell('Module', row.module);
                table.cell('Trade', 
                    (row.trade1 === '' ? '' : row.trade1) + 
                    (row.trade2 === '' ? '' : ', ' + row.trade2) + 
                    (row.trade3 === '' ? '' : ', ' + row.trade3) + 
                    (row.trade4 === '' ? '' : ', ' + row.trade4) + 
                    (row.trade5 === '' ? '' : ', ' + row.trade5));                
                table.newRow();
            });

            message.channel.send(`= Player transport tech =\n\n${table.toString()}`, {code:'asciidoc'});
        });

        return;
    }
    
    const mod1 = args[0] || '';
    const trade1 = args[1] || '';
    const trade2 = args[2] || '';
    const trade3 = args[3] || '';
    const trade4 = args[4] || '';
    const trade5 = args[5] || '';
    
    if (mod1 !== '' && !validation.moduleRegEx.test(mod1)) {
        message.channel.send(`Invalid module **${mod1}**. ${validation.invalidModuleError}`);
        return;
    }

    if (trade1 !== '' && !validation.tradeRegEx.test(trade1)) {
        message.channel.send(`Invalid module **${trade1}**. ${validation.invalidTradeError}`);
        return;
    }

    if (trade2 !== '' && !validation.tradeRegEx.test(trade2)) {
        message.channel.send(`Invalid module **${trade2}**. ${validation.invalidTradeError}`);
        return;
    }

    if (trade3 !== '' && !validation.tradeRegEx.test(trade3)) {
        message.channel.send(`Invalid module **${trade3}**. ${validation.invalidTradeError}`);
        return;
    }

    if (trade4 !== '' && !validation.tradeRegEx.test(trade4)) {
        message.channel.send(`Invalid module **${trade4}**. ${validation.invalidTradeError}`);
        return;
    }    

    if (trade5 !== '' && !validation.tradeRegEx.test(trade5)) {
        message.channel.send(`Invalid module **${trade5}**. ${validation.invalidTradeError}`);
        return;
    }

    const allowedRoles = self.config.setOther;
    let userId = message.member.user.id;
    let username = message.member.nickname || message.member.user.username;
    let target;

    if (_.isEmpty(allowedRoles) || message.member.roles.some(role => allowedRoles.includes(role.name))) {
        target = message.mentions.members.first();
        if (!_.isEmpty(target)) {
            userId = target.user.id;
            username = target.user.nickname || target.user.username;
        }
    }

    client.db.run(`REPLACE INTO tr_tech (userId, username, module, trade1, trade2, trade3, trade4, trade5) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [userId, username, mod1, trade1, trade2, trade3, trade4, trade5], function(error) {
        if (error) {
            return console.log(`Unable to save transport tech for user ${username} (${userId})`, error.message);
        }
    });

    if (!_.isEmpty(target)) {
        message.channel.send(`The transport tech for ${target.user} was updated.`);
    } else {
        message.channel.send(`Your transport tech was updated.`);
    }
};
