const _ = require('lodash');

const ELEVATED_ROLES = ['First Officer', 'Officer', 'Devs'];
const WS_PLAYER_ROLE = 'WhiteStar Player';
const WS_SIZES = [5, 10, 15, 20];
const MAX_TEAM_SIZE = 3;
const TEAMS = ['Team A', 'Team B', 'Team C'];
const ALERTS = ['REDALERT', 'YellowAlert', 'PurpleAlert'];
const UNDRAWN_TEAM_NAME = 'Undrawn';
const CONFIRM_YES = 'y'
const CONFIRM_NO = 'n'

var validatePlayerArg = function(client, message, arg) {
    if (!_.isEmpty(arg) && arg.indexOf("<@") < 0) {
        message.channel.send('You need to specify a player.');
        return false;
    }  

    return true;
};

var shuffle = function (arr) {    
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}

var clearDraw = function (db) {
    db.run(`DELETE FROM white_star`, [], function(error) {
        if (error) {
            return console.log(`Unable to clear the current white star draw.`, error.message);
        }
    });
}

var addDrawnPlayer = function(db, userId, username, team, confirmed) {
    db.run(`INSERT OR IGNORE INTO white_star (userId, username, team, confirmed)
            VALUES ('${userId}', '${username}', '${team}', '${confirmed}')`,
            function(error) {
                if (error) {
                    return console.log(`Unable to add drawn user ${userId}`, error.message);
                }
            });
};

var updateDrawnPlayer = function(db, userId, team, confirmed) {
    db.run(`UPDATE OR IGNORE white_star SET team = '${team}', confirmed = '${confirmed}' WHERE userId = '${userId}'`,
            function(error) {
                if (error) {
                    return console.log(`Unable to update drawn user ${userId}`, error.message);
                }
            });
}

var confirmPlayerDraw = function(db, userId, confirmed) {
    db.run(`UPDATE OR IGNORE white_star SET confirmed = '${confirmed}' WHERE userId = '${userId}'`,
            function(error) {
                if (error) {
                    return console.log(`Unable to update drawn user ${userId}`, error.message);
                }
            });
}

var getDrawnPlayers = function(db, callBack) {    
    db.all(`SELECT userId, username, team, confirmed FROM white_star ORDER BY team, username;`, [], (error, rows) => {
        if (error) {
            return console.log(`Unable to retrieve the white star draw data.`, error.message);
        }
        
        callBack(rows);
    });
};

var displayCurrentDraw = function (db, message) {

    getDrawnPlayers(db, function(rows) {
        var text = "";

        const longest = _.reduce(_.map(rows, (row) => { return row.username }), (long, str) => Math.max(long, str.length), 0);
        const teams = _.groupBy(rows, 'team');

        _.keys(teams).forEach(key => { 
            text += '= ' + key + ' =\n'
            teams[key].forEach(player => {
                let confirmedText = key !== UNDRAWN_TEAM_NAME 
                    ? (player.confirmed === CONFIRM_YES ? ' [Yes]' : ' [No]')
                    : '';
                text += `${player.username}${' '.repeat(longest - player.username.length)} ${confirmedText}\n`
            });
        });
        
        if (text === '') {
            return message.channel.send('No draw has happened yet, or there are no players to draw from.');
        } else {
            return message.channel.send(text, {code:'asciidoc'});
        }
    });
}

module.exports = { 
    ELEVATED_ROLES: ELEVATED_ROLES,
    WS_PLAYER_ROLE: WS_PLAYER_ROLE,
    WS_SIZES: WS_SIZES,
    MAX_TEAM_SIZE: MAX_TEAM_SIZE,
    TEAMS: TEAMS,
    ALERTS: ALERTS,
    UNDRAWN_TEAM_NAME: UNDRAWN_TEAM_NAME,
    CONFIRM_YES: CONFIRM_YES,
    CONFIRM_NO:CONFIRM_NO,

    validatePlayerArg: validatePlayerArg,
    shuffle: shuffle,
    clearDraw: clearDraw,
    addDrawnPlayer: addDrawnPlayer,
    updateDrawnPlayer: updateDrawnPlayer,
    confirmPlayerDraw: confirmPlayerDraw,
    getDrawnPlayers: getDrawnPlayers,
    displayCurrentDraw: displayCurrentDraw
}