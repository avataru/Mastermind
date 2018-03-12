const _ = require('lodash');

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

var addDrawnPlayer = function(db, userId, username, team, confirmed) {
    db.run(`INSERT OR IGNORE INTO white_star (userId, username, team, confirmed)
            VALUES ('${userId}', '${username}', '${team}', '${confirmed}')`,
            function(error) {
                if (error) {
                    return console.log(`Unable to add drawn user ${userId}`, error.message);
                }
            });
};

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
                let confirmedText = key !== 'Undrawn' 
                    ? (player.confirmed === 'y' ? (' [Yes]') : ' [No]')
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
    validatePlayerArg: validatePlayerArg,
    shuffle: shuffle,
    addDrawnPlayer: addDrawnPlayer,
    confirmPlayerDraw: confirmPlayerDraw,
    getDrawnPlayers: getDrawnPlayers,
    displayCurrentDraw: displayCurrentDraw
}