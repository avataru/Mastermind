const _ = require('lodash');
const self = module.exports;

exports.config = {
};

exports.help = {
    name: 'help',
    category: 'Misc',
    description: 'Displays available commands, and command help.',
    usage: 'help [command name]'
};

exports.run = (client, message, args) => {
    if (_.isEmpty(args[0])) {
        const commandNames = _.keys(client.commands);
        const longest = _.reduce(commandNames, (long, str) => Math.max(long, str.length), 0);

        const filteredCommands = _.filter(client.commands, function (command) {
                const allowedRoles = command.config.enabledRoles;
                return (_.isEmpty(allowedRoles) || message.member.roles.some(role => allowedRoles.includes(role.name)));
            });

        const groupedCommands = _.groupBy(filteredCommands, 'help.category');

        let text = '';

        _.keys(groupedCommands).forEach(key => {
            text += '\n= ' + key + ' Commands =\n'
            groupedCommands[key].forEach(c => {
                text += `${client.config.prefix}${c.help.name}${' '.repeat(longest - c.help.name.length)} :: ${c.help.description}\n`;
            });
        });

        message.channel.send(`[Use ${client.config.prefix}help [command name] for details]\n${text}`, {code:'asciidoc'});
    } else {
        let command = args[0].replace('!', '');
        if (_.has(client.commands, command)) {
            command = client.commands[command];
            message.channel.send(`= ${command.help.name} =\n\n${command.help.description}\nUsage: ${command.help.usage}`, {code:'asciidoc'});
        } else {
            return message.react(`❔`);
        }
    }
};
