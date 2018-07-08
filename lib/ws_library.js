const Table = require('easy-table');
const _ = require('lodash');

const ELEVATED_ROLES = ['First Officer', 'Officer'];
const WS_PLAYER_ROLE = 'WhiteStar Player';
const WS_SIZES = [5, 10, 15, 20];
const MAX_TEAM_SIZE = 3;
const TEAMS = ['Team A', 'Team B', 'Team C'];
const ALERTS = ['REDALERT', 'YellowAlert', 'PurpleAlert', 'WhiteStar Participant'];
const UNDRAWN_TEAM_NAME = 'Undrawn';
const CONFIRM_YES = 'y'
const CONFIRM_NO = 'n'

var validatePlayerArg = function(client, message, arg, isTagged) {
    if (_.isEmpty(arg) || (isTagged && arg.indexOf("<@") < 0)) {
        message.channel.send('You need to specify a player.');
        return false;
    }

    return true;
};

var applyWeights = function (db, players, callback) {

    // Cleanup
    const playerIds = _.map(players, 'user.id').join(',');

    db.query(`DELETE FROM white_star_weights WHERE userId NOT IN (${playerIds})`, function (error) { 

        if (error) { return console.log(`Unable to cleanup the old players from the weights table.`, error.message); }

        // Add entries based on weights 
        db.query(`SELECT userId, weight FROM white_star_weights`, (error, rows) => {
            
            if (error) { return console.log(`Unable to get the player weights`, error.message); }

            let entries = [];

            _.forEach(players, function (player) {
                const userId = player.user.id;
                const username = player.nickname || player.user.username;
                let weight = 1;
        
                if (_.some(rows, ['userId', player.user.id])) {
                    weight = _.find(rows, ['userId', player.user.id]).weight || weight;
                } else {
                    // If we have a new player, then add them with a default weight
                    db.query(`INSERT IGNORE INTO white_star_weights (userId, username, weight) VALUES ('${userId}', '${username}', '${weight}')`,
                        function (error) { if (error) { return console.log(`Unable to add player's weight (${userId})`, error.message); }}
                    );
                }
        
                for (let i = 1; i <= +weight; i++) {
                    entries.push(player);
                }
            });
        
            callback(_.uniqBy(_.shuffle(entries), 'user.id'));
        });
    });
}

var setWeight = function(db, userId, username, weight) {
    db.query(`REPLACE INTO white_star_weights (userId, username, weight) VALUES ('${userId}', '${username}', '${weight}')`,
            function(error) {
                if (error) {
                    return console.log(`Unable to add player's weight (${userId})`, error.message);
                }
            });
}

var getWeights = function(db, callback) {
    db.query(`SELECT userId, username, weight FROM white_star_weights ORDER BY username;`, [], (error, rows) => {
        if (error) {
            return console.log(`Unable to retrieve the white star weights data.`, error.message);
        }

        callback(rows);
    });
}

var clearDraw = function (db) {
    db.query(
        `DELETE FROM white_star`, [], function(error) {
        if (error) {
            return console.log(`Unable to clear the current white star draw.`, error.message);
        }
    });
}

var addDrawnPlayer = function(db, userId, username, team, confirmed) {
    db.query(`INSERT IGNORE INTO white_star (userId, username, team, confirmed)
            VALUES ('${userId}', '${username}', '${team}', '${confirmed}')`,
            function(error) {
                if (error) {
                    return console.log(`Unable to add drawn user ${userId}`, error.message);
                }
            });
};

var updateDrawnPlayer = function(db, userId, team, confirmed) {
    db.query(`UPDATE IGNORE white_star SET team = '${team}', confirmed = '${confirmed}' WHERE userId = '${userId}'`,
            function(error) {
                if (error) {
                    return console.log(`Unable to update drawn user ${userId}`, error.message);
                }
            });
}

var confirmPlayerDraw = function(db, userId, confirmed) {
    db.query(`UPDATE IGNORE white_star SET confirmed = '${confirmed}' WHERE userId = '${userId}'`,
            function(error) {
                if (error) {
                    return console.log(`Unable to update drawn user ${userId}`, error.message);
                }
            });
}

var setPlayerJob = function(db, userId, job) {
    db.query(`UPDATE IGNORE white_star SET job = '${job}' WHERE userId = '${userId}'`,
            function(error) {
                if (error) {
                    return console.log(`Unable to update drawn user ${userId}`, error.message);
                }
            });
}

var getDrawnPlayers = function(db, callBack) {
    db.query(`SELECT userId, username, team, confirmed, job FROM white_star ORDER BY team, username;`, [], (error, rows) => {
        if (error) {
            return console.log(`Unable to retrieve the white star draw data.`, error.message);
        }

        callBack(rows);
    });
};

var addHeadingRow = function(table, heading) {
    table.cell('Player', heading);
    table.cell('Confirmed', '');
    table.cell('Job', '');
    table.newRow();
}

var addPlayerRow = function(table, row, team) {

    let confirmedText = row.confirmed === CONFIRM_YES ? '[Y]' : '[N]';

    table.cell('Player', row.username);
    table.cell('Confirmed', confirmedText);
    table.cell('Job', row.job || '');
    table.newRow();
}

var displayCurrentDraw = function (db, message) {

    getDrawnPlayers(db, function(rows) {

        let table = new Table;

        const longest = _.reduce(_.map(rows, (row) => { return row.username }), (long, str) => Math.max(long, str.length), 0);
        const teams = _.groupBy(rows, 'team');

        _.keys(teams).forEach(team => {
            addHeadingRow(table, '= ' + team + ' =');

            teams[team].forEach(player => {
                addPlayerRow(table, player, team);
            });
        });

        if (rows.length === 0) {
            return message.channel.send('No draw has happened yet, or there are no players to draw from.');
        } else {
            return message.channel.send(table.toString(), {code:'asciidoc'});
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
    applyWeights: applyWeights,
    setWeight: setWeight,
    getWeights: getWeights,
    clearDraw: clearDraw,
    addDrawnPlayer: addDrawnPlayer,
    updateDrawnPlayer: updateDrawnPlayer,
    setPlayerJob: setPlayerJob,
    confirmPlayerDraw: confirmPlayerDraw,
    getDrawnPlayers: getDrawnPlayers,
    displayCurrentDraw: displayCurrentDraw
}
