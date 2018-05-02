const _ = require('lodash');
const Table = require('easy-table');
const lib = require('../lib/tech_library');
const self = module.exports;

let addHeadingRow = function(table, heading) {
    table.cell('Player', heading);
    table.cell('In WS?', '');
    table.cell('Module', '');
    table.cell('Mining', '');         
    table.newRow();
} 

let addPlayerRow = function(table, row) {
    table.cell('Player', row.username);
    table.cell('In WS?', row.inWs === 'y' ? '[Y]' : '[N]');
    table.cell('Module', row.module);
    table.cell('Mining', 
        (row.mining1 === '' ? '' : row.mining1) + 
        (row.mining2 === '' ? '' : ', ' + row.mining2) + 
        (row.mining3 === '' ? '' : ', ' + row.mining3) + 
        (row.mining4 === '' ? '' : ', ' + row.mining4) + 
        (row.mining5 === '' ? '' : ', ' + row.mining5));                
    table.newRow();
}

exports.config = {    
};

exports.help = {
    name: 'tmn',
    category: 'White Star',
    description: 'Manage player miner information.',
    usage: () => { 
        return 'tmn [module] [mining] [mining] [mining] [mining] [mining]\n\n' + 
               lib.moduleHelp + '\n' +
               lib.miningHelp + '\n\n' + 
               'Example: !tmn warp3 remote4 crunch1\n\n' + 
               'You can also specifiy if this ship is in the White Star by using:\n' +
               '!ws tmn y';
    }
};

exports.run = (client, message, args) => {
    
    // display
    if (args === null || args.length === 0) {
        client.db.query(`SELECT userId, username, inWs, module, mining1, mining2, mining3, mining4, mining5 FROM mn_tech ORDER BY username ASC`, [], (error, rows) => {
            if (error) {
                return console.log(`Unable to retrieve the miner tech`, error.message);
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

            message.channel.send(`= Player Miner Tech =\n\n${table.toString()}`, {code:'asciidoc'});
        });

        return;
    }
    
    const mod1 = args[0] || '';
    const mining1 = args[1] || '';
    const mining2 = args[2] || '';
    const mining3 = args[3] || '';
    const mining4 = args[4] || '';
    const mining5 = args[5] || '';
    
    if (mod1 !== '' && !lib.moduleRegEx.test(mod1)) {
        message.channel.send(`Invalid module **${mod1}**\n${lib.moduleHelp}`);
        return;
    }

    if (mining1 !== '' && !lib.miningRegEx.test(mining1)) {
        message.channel.send(`Invalid module **${mining1}**\n${lib.miningHelp}`);
        return;
    }

    if (mining2 !== '' && !lib.miningRegEx.test(mining2)) {
        message.channel.send(`Invalid module **${mining2}**\n${lib.miningHelp}`);
        return;
    }

    if (mining3 !== '' && !lib.miningRegEx.test(mining3)) {
        message.channel.send(`Invalid module **${mining3}**\n${lib.miningHelp}`);
        return;
    }

    if (mining4 !== '' && !lib.miningRegEx.test(mining4)) {
        message.channel.send(`Invalid module **${mining4}**\n${lib.miningHelp}`);
        return;
    }

    if (mining5 !== '' && !lib.miningRegEx.test(mining5)) {
        message.channel.send(`Invalid module **${mining5}**\n${lib.miningHelp}`);
        return;
    }
    
    let userId = message.member.user.id;
    let username = message.member.nickname || message.member.user.username;

    client.db.query(`REPLACE INTO mn_tech (userId, username, module, mining1, mining2, mining3, mining4, mining5) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [userId, username, mod1, mining1, mining2, mining3, mining4, mining5], function(error) {
        if (error) {
            return console.log(`Unable to save miner tech for user ${username} (${userId})`, error.message);
        }
    });

    message.react(`👌`);
};
