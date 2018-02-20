const _ = require('lodash');
const Table = require('easy-table');
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

    if (weapon === '' || /^(Bat[1-9])|(Lzr[1-9])|(MBat[1-9])|(DLzr[1-9])|(Brg[1-9])$/.test(weapon)) {
        message.channel.send(`Invalid weapon **${weapon}**. Valid entries are Bat, Lzr, MBat, DLzr, Brg followed by a level number. e.g. Bat3`);
        return;
    }

    if (shield === '' || /^(Dlt[1-9])|(Psv[1-9])|(Omg[1-9])|(Mrr[1-9])|(Are[1-9])$/.test(shield)) {
        message.channel.send(`Invalid shield **${shield}**. Valid entries are Dlt, Psv, Omg, Mrr, Are followed by a level number. e.g. Omg3`);
        return;
    }

    const validate_module = /^(Emp[1-9])|(Tp[1-9])|(Rep[1-9])|(TWrp[1-9])|(Uni[1-9])|(Sanc)|(Stl[1-9])|(For[1-9])|(Imp[1-9])|(Rkt[1-9])|(Sal[1-9])|(Sup[1-9])|(Dst[1-9])|(Brr[1-9])|(Vng[1-9])|(Lep[1-9])$/;
    const invalid_module_error = 'Valid entries are Emp, Tp, Rep, TWrp, Uni, Sanc, Stl, For, Imp, Rkt, Sal, Sup, Dst, Brr, Vng, Lep followed by a level number. e.g. TWrp3';

    if (mod1 !== '' || validate_module.test(mod1)) {
        message.channel.send(`Invalid module **${mod1}**. ` + invalid_module_error);
        return;
    }

    if (mod2 !== '' || validate_module.test(mod2)) {
        message.channel.send(`Invalid module **${mod2}**. ` + invalid_module_error);
        return;
    }

    if (mod3 !== '' || validate_module.test(mod3)) {
        message.channel.send(`Invalid module **${mod3}**. ` + invalid_module_error);
        return;
    }

    if (mod4 !== '' || validate_module.test(mod4)) {
        message.channel.send(`Invalid module **${mod4}**. ` + invalid_module_error);
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
