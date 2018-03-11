const _ = require('lodash');
const Table = require('easy-table');
const self = module.exports;

exports.config = {
    enabledRoles: ['First Officer', 'Officer', 'Devs']
};

exports.help = {
    name: 'mc',    
    category: 'Administration',
    description: 'Adds or removes the ability to use a command in a channel.',
    usage: 'mc [+-][command name]'
};

exports.init = (client) => {
    client.db.beginTransaction((error, transaction) => {
        transaction.run(`CREATE TABLE IF NOT EXISTS disabled_commands (
            command TEXT NOT NULL,
            channel TEXT NOT NULL,
            PRIMARY KEY (command, channel),
            UNIQUE (command, channel)
        );`);        
        transaction.commit(error => {
            if (error) {
                return console.log(`Unable to create the disabled_commands table`, error.message);
            }
        });
    });
};

exports.run = (client, message, args) => {
    if (args && args.length == 1) {
        const toggledCommand = args[0] || '';
        
        if (_.isEmpty(toggledCommand) && toggledCommand.indexOf('+') !== 0 && toggledCommand.indexOf('-') !== 0) {
            return message.channel.send('Please use a "+" or "-" before the command, so I know if you want it enabled or disabled.'); 
        }

        const disable = toggledCommand.indexOf('-') === 0

        const command = toggledCommand
            .replace('+', '')
            .replace('-', '');
        
        if (_.isEmpty(command)) {
            return message.channel.send('Please specify a command to enabled or disabled.'); 
        }

        if (command === self.help.name) {
            return message.channel.send('That would be a bad idea. Think about it.'); 
        }

        if (!client.commands[command]) {
            return message.channel.send(`Invalid command **${command}**.`);
        }  

        if (disable) {
            client.db.run(`INSERT OR IGNORE INTO disabled_commands (command, channel)
                    VALUES ('${command}', '${message.channel.name}')`,
            function(error) {
                if (error) {
                    return console.log(`Unable to add nomination for user ${userId}`, error.message);
                }
            });
        
            return message.react(`👌`);
        } else {
            client.db.run(`DELETE FROM disabled_commands WHERE command = '${command}' AND channel = '${message.channel.name}'`, [], function(error) {
                if (error) {
                    return console.log(`Unable to remove nominations for user ${userId}`, error.message);
                }
            });

            return message.react(`👌`);
        }
    }
    
    client.db.all(`SELECT command, channel FROM disabled_commands ORDER BY command COLLATE NOCASE ASC`, [], (error, rows) => {
        if (error) {
            return console.log(`Unable to retrieve the disabled commands`, error.message);
        }

        let table = new Table;
        _.map(rows, row => {
            table.cell('Command', row.command);
            table.cell('Channel', row.channel);
            table.newRow();
        });

        message.channel.send(`= Disabled Commands =\n\n${table.toString()}`, {code:'asciidoc'});
    });
};
