const _ = require('lodash');

let WS = function (players, debug) {
    this.players = players;
    this.debug = debug || false;

    this.roles = {
        participant: ['WhiteStar Participant'],
        special: ['Rocketeers'],
        team: ['Team A', 'Team B', 'Team C'],
        alert: ['REDALERT', 'YellowAlert', 'PurpleAlert']
    };

    this.allRoles = this.players.first().guild.roles;
    this.participants;
    this.teams;

    // Reset WS roles
    // Disabled for now, see https://anidiotsguide_old.gitbooks.io/discord-js-bot-guide/content/information/understanding-roles.html
    // this.players.map(player => {
    //     console.log(`Removing roles for ${player.user.username}:`);
    //     _.map(_.flattenDeep(_.values(this.roles)), name => {
    //         let role = this.allRoles.find('name', name);
    //         if (debug !== false) {
    //             // player.removeRole(role).catch(console.error);
    //         }
    //         console.log(`Role ${role.name} (${role.id}) removed.`);
    //     });
    // });
};

WS.prototype.drawParticipants = function (numberOfParticipants) {
    const self = this;

    self.participants = self.players.random(numberOfParticipants);

    // Add roles: self.roles.participant, self.roles.alert
};

WS.prototype.makeTeams = function (numberOfTeams) {
    const self = this;

    const playersPerTeam = Math.ceil(_.size(self.participants) / numberOfTeams);

    self.teams = _.chunk(self.participants, playersPerTeam);

    // Add roles: self.roles.team
};

WS.prototype.getEmbed = function (accentColor) {
    const self = this;

    const teams = self.teams.map(function (team, index) {
        return {
            name: `Team ${String.fromCharCode(65 + index)}`,
            value: team.map(player => player.user.username).join(', ')
            // We need to map and only use the username because mentions in embeds are broken on mobile devices
        };
    });

    return {embed: {
        color: accentColor,
        title: 'Next White Star paricipants',
        fields: teams
    }};
};

WS.prototype.getAscii = function () {
    const self = this;

    const teams = self.teams.map(function (team, index) {
        return `Team ${String.fromCharCode(65 + index)} :: ${team.map(player => player.user.username).join(', ')}`;
    });

    return `= Next White Star participants =\n\n${teams.join('\n')}`;
};

exports.WS = WS;
