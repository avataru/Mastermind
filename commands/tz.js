const _ = require('lodash');
const moment = require('moment-timezone');
const Table = require('easy-table');
const self = module.exports;

exports.config = {
    setOther: ['First Officer', 'Officer', 'Devs']
};

exports.help = {
    name: 'tz',
    category: 'White Star',
    description: 'Manage player timezone information.',
    usage: 'tz [timezone]'
};

exports.init = (client) => {
    client.db.beginTransaction((error, transaction) => {
        transaction.run(`CREATE TABLE IF NOT EXISTS timezones (
            userId TEXT NOT NULL PRIMARY KEY,
            username TEXT NOT NULL,
            timezone TEXT
        );`);
        transaction.run(`CREATE UNIQUE INDEX IF NOT EXISTS unique_username ON timezones (username);`);
        transaction.commit(error => {
            if (error) {
                return console.log(`Unable to create the timezones table`, error.message);
            }
        });
    });
};

exports.run = (client, message, args) => {
    const timezone = args[0] || '';

    if (_.isEmpty(args[0])) {
        client.db.all(`SELECT username, timezone FROM timezones ORDER BY username COLLATE NOCASE ASC`, [], (error, rows) => {
            if (error) {
                return console.log(`Unable to retrieve thge timezones`, error.message);
            }

            let table = new Table;
            _.map(rows, row => {
                table.cell('Player', row.username);
                table.cell('Timezone', row.timezone);
                table.cell('Current time', moment().tz(row.timezone).format('h:mm a'));
                table.newRow();
            });

            message.channel.send(`= Player timezones =\n\n${table.toString()}`, {code:'asciidoc'});
        });

        return;
    }

    if (!!moment.tz.zone(timezone) !== true) {
        message.channel.send(`Invalid timezone **${timezone}**.`);

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

    client.db.run(`REPLACE INTO timezones (userId, username, timezone) VALUES (?, ?, ?)`, [userId, username, timezone], function(error) {
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
