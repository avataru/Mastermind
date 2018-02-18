const _ = require('lodash');
const self = module.exports;

exports.config = {
    enabled: true
};

exports.help = {
    name: 'help',
    description: 'Displays all the available commands for your permission level.',
    usage: 'help [command name]'
};

exports.run = (client, message, args) => {
    if (_.isEmpty(args[0])) {
        const commandNames = _.keys(client.commands);
        const longest = _.reduce(commandNames, (long, str) => Math.max(long, str.length), 0);

        const commands = _.filter(client.commands, function (command) {
                const allowedRoles = command.config.roles;
                return (_.isEmpty(allowedRoles) || message.member.roles.some(role => allowedRoles.includes(role.name)));
            })
            .map(c => `${client.config.prefix}${c.help.name}${' '.repeat(longest - c.help.name.length)} :: ${c.help.description}`);

        message.channel.send(`= Command List =\n\n[Use ${client.config.prefix}help [command name] for details]\n\n${commands.join('\n')}`, {code:'asciidoc'});
    } else {
        let command = args[0];
        if (_.has(client.commands, command)) {
            command = client.commands[command];
            message.channel.send(`= ${command.help.name} =\n\n${command.help.description}\nUsage: ${command.help.usage}`, {code:'asciidoc'});
        }
    }
};
