const _ = require('lodash');
const Table = require('easy-table');
const lib = require('../lib/tech_library');
const self = module.exports;

let addHeadingRow = function(table, heading) {
    table.cell('Player', heading);
    table.cell('Weapon', '');
    table.cell('Shield', '');
    table.cell('Modules', '');                
    table.newRow();
} 

let addPlayerRow = function(table, row) {
    table.cell('Player', row.username);
    table.cell('Weapon', row.weapon);
    table.cell('Shield', row.shield);
    table.cell('Modules', 
        (row.mod1 === '' ? '' : row.mod1) + 
        (row.mod2 === '' ? '' : ', ' + row.mod2) + 
        (row.mod3 === '' ? '' : ', ' + row.mod3) + 
        (row.mod4 === '' ? '' : ', ' + row.mod4));                
    table.newRow();
}

exports.config = {    
};

exports.help = {
    name: 'tbs',
    category: 'White Star',
    description: 'Manage player battleship information.',
    usage: 'tbs [weapon] [shield] [module] [module] [module] [module]\n\n' + 
        lib.weaponHelp + '\n' +
        lib.shieldHelp + '\n' +
        lib.moduleHelp + '\n\n' + 
        'Example: !tbs dlzr6 omg1 dst2 tlp5 sanc'
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
    
    // display all
    if (args === null || args.length === 0) {
        client.db.all(`SELECT userId, username, weapon, shield, mod1, mod2, mod3, mod4 FROM bs_tech ORDER BY username COLLATE NOCASE ASC`, [], (error, rows) => {
            if (error) {
                return console.log(`Unable to retrieve the battleship tech`, error.message);
            }

            let table = new Table;
            let teamARows = [], teamBRows = [], teamCRows = [], noTeamRows = [];
    
            _.map(rows, row => {
                let member = message.guild.members.find('id', row.userId);
    
                if (member) {
                    if (member.roles.some(x => x.name === 'Team A')) {
                        teamARows.push(row)
                    } else if (member.roles.some(x => x.name === 'Team B')) {
                        teamBRows.push(row)
                    } else if (member.roles.some(x => x.name === 'Team C')) {
                        teamCRows.push(row)
                    } else {
                        noTeamRows.push(row)
                    }
                }            
            });
    
            if (teamARows.length) {
                addHeadingRow(table, '= Team A =')
                teamARows.forEach(row => { addPlayerRow(table, row) });
            }
    
            if (teamBRows.length) {
                addHeadingRow(table, '= Team B =')
                teamBRows.forEach(row => { addPlayerRow(table, row) });
            }
    
            if (teamCRows.length) {
                addHeadingRow(table, '= Team C =')
                teamCRows.forEach(row => { addPlayerRow(table, row) });
            }
    
            if (noTeamRows.length) {
                if (teamARows.length || teamBRows.length || teamCRows.length) {
                    addHeadingRow(table, '= Other =')
                }
                
                noTeamRows.forEach(row => { addPlayerRow(table, row) });
            }

            message.channel.send(`= Player Battleship Tech =\n\n${table.toString()}`, {code:'asciidoc'});
        });

        return;
    }
    
    const weapon = args[0] || '';
    const shield = args[1] || '';
    const mod1 = args[2] || '';
    const mod2 = args[3] || '';
    const mod3 = args[4] || '';
    const mod4 = args[5] || '';

    if (weapon === '' || !lib.weaponRegEx.test(weapon)) {
        message.channel.send(`Invalid weapon **${weapon}**\n${lib.weaponHelp}`);
        return;
    }

    if (shield === '' || !lib.shieldRegEx.test(shield)) {
        message.channel.send(`Invalid shield **${shield}**\n${lib.shieldHelp}`);
        return;
    }
    
    if (mod1 !== '' && !lib.moduleRegEx.test(mod1)) {
        message.channel.send(`Invalid module **${mod1}**\n${lib.moduleHelp}`);
        return;
    }

    if (mod2 !== '' && !lib.moduleRegEx.test(mod2)) {
        message.channel.send(`Invalid module **${mod2}**\n${lib.moduleHelp}`);
        return;
    }

    if (mod3 !== '' && !lib.moduleRegEx.test(mod3)) {
        message.channel.send(`Invalid module **${mod3}**\n${lib.moduleHelp}`);
        return;
    }

    if (mod4 !== '' && !lib.moduleRegEx.test(mod4)) {
        message.channel.send(`Invalid module **${mod4}**\n${lib.moduleHelp}`);
        return;
    }

    let userId = message.member.user.id;
    let username = message.member.nickname || message.member.user.username;

    client.db.run(`REPLACE INTO bs_tech (userId, username, weapon, shield, mod1, mod2, mod3, mod4) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [userId, username, weapon, shield, mod1, mod2, mod3, mod4], function(error) {
        if (error) {
            return console.log(`Unable to save battleship tech for user ${username} (${userId})`, error.message);
        }
    });

    message.react(`👌`);
};
