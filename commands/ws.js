const _ = require('lodash');
const WhiteStar = require('../lib/WhiteStar').WhiteStar;
const self = module.exports;

exports.config = {
    enabledRoles: ['First Officer', 'Officer', 'Devs'],
    playerRole: 'WhiteStar Player',
    availableFormats: [5, 10, 15, 20],
    accent: 0xFFD700
};

exports.help = {
    name: 'xws',
    category: 'White Star',
    description: 'Draws the next White Star participants and set-up their roles.',
    usage: 'xws [number of players] [number of teams (optional)]'
};

exports.run = (client, message, args) => {
    const roleName = self.config.playerRole;

    let formats = self.config.availableFormats;
    const numberOfParticipants = parseInt(args[0], 10);
    const numberOfTeams = parseInt(args[1], 10) || 2;

    const players = message.guild.roles
        .find(role => role.name === roleName)
        .members;

    formats = _.filter(formats, function (format) {
        return format <= _.size(players);
    });

    if (!formats.includes(numberOfParticipants)) {
        return message.reply(`Please provide a valid number of participants (${_.join(formats, ', ')}).`);
    }

    const ws = new WhiteStar(players, true);
    ws.drawParticipants(numberOfParticipants);
    ws.makeTeams(numberOfTeams);

    return message.channel.send(ws.getEmbed(self.config.accent));
    // return message.channel.send(ws.getAscii(), {code:'asciidoc'});
};
