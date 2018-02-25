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
    name: 'tbs',
    description: 'Manage player battleship information',
    usage: 'tbs [weapon] [shield] [module] [module] [module] [module]'
};

exports.init = (client) => {
    client.db.beginTransaction((error, transaction) => {
        transaction.run(`CREATE TABLE IF NOT EXISTS bs_tech (
            userId TEXT NOT NULL PRIMARY KEY,
            username TEXT NOT NULL,
            weapon TEXT,
            shield TEXT,
            mod1 TEXT,
            mod2 TEXT,
            mod3 TEXT,
            mod4 TEXT
        );`);
        transaction.run(`CREATE UNIQUE INDEX IF NOT EXISTS unique_username ON bs_tech (username);`);
        transaction.commit(error => {
            if (error) {
                return console.log(`Unable to create the bs_tech table`, error.message);
            }
        });
    });
};

exports.run = (client, message, args) => {
    
    // display
    if (args === null || args.length === 0) {
        client.db.all(`SELECT username, weapon, shield, mod1, mod2, mod3, mod4 FROM bs_tech ORDER BY username COLLATE NOCASE ASC`, [], (error, rows) => {
            if (error) {
                return console.log(`Unable to retrieve the battleship tech`, error.message);
            }

            let table = new Table;
            _.map(rows, row => {
                table.cell('Player', row.username);
                table.cell('Weapon', row.weapon);
                table.cell('Shield', row.shield);
                table.cell('Modules', 
                    (row.mod1 === '' ? '' : row.mod1) + 
                    (row.mod2 === '' ? '' : ', ' + row.mod2) + 
                    (row.mod3 === '' ? '' : ', ' + row.mod3) + 
                    (row.mod4 === '' ? '' : ', ' + row.mod4));                
                table.newRow();
            });

            message.channel.send(`= Player battleship tech =\n\n${table.toString()}`, {code:'asciidoc'});
        });

        return;
    }
    
    const weapon = args[0] || '';
    const shield = args[1] || '';
    const mod1 = args[2] || '';
    const mod2 = args[3] || '';
    const mod3 = args[4] || '';
    const mod4 = args[5] || '';

    if (weapon === '' || validation.weaponRegEx.test(weapon)) {
        message.channel.send(`Invalid weapon **${weapon}**. ${validation.invalidWeaponError}`);
        return;
    }

    if (shield === '' || validation.shieldRegEx.test(shield)) {
        message.channel.send(`Invalid shield **${shield}**. ${validation.invalidShieldError}`);
        return;
    }
    
    if (mod1 !== '' || validation.moduleRegEx.test(mod1)) {
        message.channel.send(`Invalid module **${mod1}**. ${validation.invalidModuleError}`);
        return;
    }

    if (mod2 !== '' || validation.moduleRegEx.test(mod2)) {
        message.channel.send(`Invalid module **${mod2}**. ${validation.invalidModuleError}`);
        return;
    }

    if (mod3 !== '' || validation.moduleRegEx.test(mod3)) {
        message.channel.send(`Invalid module **${mod3}**. ${validation.invalidModuleError}`);
        return;
    }

    if (mod4 !== '' || validation.moduleRegEx.test(mod4)) {
        message.channel.send(`Invalid module **${mod4}**. ${validation.invalidModuleError}`);
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

    client.db.run(`REPLACE INTO bs_tech (userId, username, weapon, shield, mod1, mod2, mod3, mod4) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [userId, username, weapon, shield, mod1, mod2, mod3, mod4], function(error) {
        if (error) {
            return console.log(`Unable to save battleship tech for user ${username} (${userId})`, error.message);
        }
    });

    if (!_.isEmpty(target)) {
        message.channel.send(`The battleship tech for ${target.user} was updated.`);
    } else {
        message.channel.send(`Your battleship tech was updated.`);
    }
};
