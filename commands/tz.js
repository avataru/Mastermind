const _ = require('lodash');
const moment = require('moment-timezone');
const Table = require('easy-table');
const self = module.exports;

let addHeadingRow = function(table, heading) {
    table.cell('Player', heading);
    table.cell('Timezone', '');
    table.cell('Current time', ''); 
    table.newRow();
  } 
  
  let addPlayerRow = function(table, row) {
    table.cell('Player', row.username);
    table.cell('Timezone', row.timezone);
    table.cell('Current time', moment().tz(row.timezone).format('h:mm a'));  
    table.newRow();
  }

exports.config = {
    setOther: ['First Officer', 'Officer', 'Devs']
};

exports.help = {
    name: 'tz',
    category: 'White Star',
    description: 'Manage player timezone information.',
    usage: 'tz [timezone]'
};

exports.run = (client, message, args) => {
    const timezone = args[0] || '';

    if (_.isEmpty(args[0])) {
        client.db.query(`SELECT userId, username, timezone FROM timezones ORDER BY username ASC`, [], (error, rows) => {
            if (error) {
                return console.log(`Unable to retrieve thge timezones`, error.message);
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

            message.channel.send(`= Player Timezones =\n\n${table.toString()}`, {code:'asciidoc'});
        });

        return;
    }

    if (!!moment.tz.zone(timezone) !== true) {
        message.channel.send(`Invalid imezone **${timezone}**.`);

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
            username = target.nickname || target.user.username;
        }
    }

    client.db.query(`REPLACE INTO timezones (userId, username, timezone) VALUES (?, ?, ?)`, [userId, username, timezone], function(error) {
        if (error) {
            return console.log(`Unable to save timezone "${timezone}" for user ${username} (${userId})`, error.message);
        }
    });

    if (!_.isEmpty(target)) {
        message.channel.send(`The timezone for ${target.user} was set to **${timezone}**.`);
    } else {
        message.channel.send(`Your timezone was set to **${timezone}**.`);
    }
};
