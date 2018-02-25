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
    name: 'tmn',
    description: 'Manage player miner information',
    usage: 'tmn [module] [mining] [mining] [mining] [mining] [mining]\n' + 
    validation.invalidModuleError + '\n' +
    validation.invalidMiningError
};

exports.init = (client) => {
    client.db.beginTransaction((error, transaction) => {
        transaction.run(`CREATE TABLE IF NOT EXISTS mn_tech (
            userId TEXT NOT NULL PRIMARY KEY,
            username TEXT NOT NULL,
            module TEXT,
            mining1 TEXT,
            mining2 TEXT,
            mining3 TEXT,
            mining4 TEXT,
            mining5 TEXT
        );`);
        transaction.run(`CREATE UNIQUE INDEX IF NOT EXISTS unique_username ON mn_tech (username);`);
        transaction.commit(error => {
            if (error) {
                return console.log(`Unable to create the mn_tech table`, error.message);
            }
        });
    });
};

exports.run = (client, message, args) => {
    
    // display
    if (args === null || args.length === 0) {
        client.db.all(`SELECT username, module, mining1, mining2, mining3, mining4, mining5 FROM mn_tech ORDER BY username COLLATE NOCASE ASC`, [], (error, rows) => {
            if (error) {
                return console.log(`Unable to retrieve the miner tech`, error.message);
            }

            let table = new Table;
            _.map(rows, row => {
                table.cell('Player', row.username);
                table.cell('Module', row.module);
                table.cell('Mining', 
                    (row.mining1 === '' ? '' : row.mining1) + 
                    (row.mining2 === '' ? '' : ', ' + row.mining2) + 
                    (row.mining3 === '' ? '' : ', ' + row.mining3) + 
                    (row.mining4 === '' ? '' : ', ' + row.mining4) + 
                    (row.mining5 === '' ? '' : ', ' + row.mining5));                
                table.newRow();
            });

            message.channel.send(`= Player miner tech =\n\n${table.toString()}`, {code:'asciidoc'});
        });

        return;
    }
    
    const mod1 = args[0] || '';
    const mining1 = args[1] || '';
    const mining2 = args[2] || '';
    const mining3 = args[3] || '';
    const mining4 = args[4] || '';
    const mining5 = args[5] || '';
    
    if (mod1 !== '' && !validation.moduleRegEx.test(mod1)) {
        message.channel.send(`Invalid module **${mod1}**. ${validation.invalidModuleError}`);
        return;
    }

    if (mining1 !== '' && !validation.miningRegEx.test(mining1)) {
        message.channel.send(`Invalid module **${mining1}**. ${validation.invalidMiningError}`);
        return;
    }

    if (mining2 !== '' && !validation.miningRegEx.test(mining2)) {
        message.channel.send(`Invalid module **${mining2}**. ${validation.invalidMiningError}`);
        return;
    }

    if (mining3 !== '' && !validation.miningRegEx.test(mining3)) {
        message.channel.send(`Invalid module **${mining3}**. ${validation.invalidMiningError}`);
        return;
    }

    if (mining4 !== '' && !validation.miningRegEx.test(mining4)) {
        message.channel.send(`Invalid module **${mining4}**. ${validation.invalidMiningError}`);
        return;
    }

    if (mining5 !== '' && !validation.miningRegEx.test(mining5)) {
        message.channel.send(`Invalid module **${mining5}**. ${validation.invalidMiningError}`);
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

    client.db.run(`REPLACE INTO mn_tech (userId, username, module, mining1, mining2, mining3, mining4, mining5) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [userId, username, mod1, mining1, mining2, mining3, mining4, mining5], function(error) {
        if (error) {
            return console.log(`Unable to save miner tech for user ${username} (${userId})`, error.message);
        }
    });

    if (!_.isEmpty(target)) {
        message.channel.send(`The miner tech for ${target.user} was updated.`);
    } else {
        message.channel.send(`Your miner tech was updated.`);
    }
};
