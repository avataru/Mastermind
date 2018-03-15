const _ = require('lodash');
const Table = require('easy-table');
const lib = require('../lib/ws_library');

const self = module.exports;

exports.config = {    
};

exports.help = {
    name: 'ws',
    category: 'White Star',
    description: 'Manage White Star participant draws.',
    usage: '\n' + 
           'To display the current draw:\n' +
           '!ws\n\n' +
           'To make a new random draw:\n' +
           '!ws draw [white star size] [number of teams]\n\n' + 
           'To confirm your place in the next White Star:\n' +
           '!ws confirm [y/n]\n\n' + 
           'To replace a player with a random undrawn player:\n' +
           '!ws redraw [@player]\n\n' +
           'To replace a player with another undrawn player:\n' +
           '!ws replace [@player] with [@player]\n\n' +
           'To finalize the current draw, and set all roles:\n' +
           '!ws finalize'

};

exports.init = (client) => {
    client.db.beginTransaction((error, transaction) => {
        transaction.run(`CREATE TABLE IF NOT EXISTS white_star (
            userId TEXT NOT NULL PRIMARY KEY,
            username TEXT NOT NULL,
            team TEXT,
            confirmed TEXT
        );`);
        transaction.run(`CREATE UNIQUE INDEX IF NOT EXISTS unique_username ON white_star (username);`);
        transaction.commit(error => {
            if (error) {
                return console.log(`Unable to create the white_star table`, error.message);
            }
        });
    });
};

exports.run = (client, message, args) => {

    if (args && args.length > 0) {

        let command = args[0] || '';

        switch (command.toLowerCase()) {
            case "draw": {
                // permission validation
                if (!message.member.roles.some(role => lib.ELEVATED_ROLES.includes(role.name))) {
                    return message.react(`🚫`); 
                }
                
                // white star size validation
                let sizeArg = args[1] || '';

                if (isNaN(sizeArg) || !lib.WS_SIZES.includes(+sizeArg)) {
                    return message.channel.send(`Invalid white star size. Try ${_.join(lib.WS_SIZES, ', ')}`);
                }

                const targetRole = message.guild.roles.find(role => role.name === lib.WS_PLAYER_ROLE);
                const players = targetRole.members || {size:0};

                if (players.size < +sizeArg) {
                    return message.channel.send(`We don't have enough players in the '${lib.WS_PLAYER_ROLE}' role for that.`);
                }

                // team size validation
                let teamsArg = args[2] || '';

                if (isNaN(teamsArg) || +teamsArg <= 0 || +teamsArg > lib.MAX_TEAM_SIZE) {
                    return message.channel.send(`Invalid team size. Try something between 1 and ${lib.MAX_TEAM_SIZE}.`);
                }

                lib.clearDraw(client.db);

                const randomizedPlayers = lib.shuffle(players.array())
                const drawnPlayers = randomizedPlayers.slice(0, +sizeArg)
                const undrawnPlayers = randomizedPlayers.slice(+sizeArg)

                const playersPerTeam = Math.ceil(drawnPlayers.length / +teamsArg);
                
                const teams = _.chunk(drawnPlayers, playersPerTeam);

                // add the randomly drawn players by team
                for (let i = 0; i < teams.length; i++) {
                    const team = teams[i];
                    for (let j = 0; j < team.length; j++) {
                        const player = team[j];
                        
                        lib.addDrawnPlayer(client.db, player.user.id, player.nickname || player.user.username, lib.TEAMS[i], lib.CONFIRM_NO)
                    }
                }

                // add the undrawn players
                for (let j = 0; j < undrawnPlayers.length; j++) {
                    const player = undrawnPlayers[j];
                    
                    lib.addDrawnPlayer(client.db, player.user.id, player.nickname || player.user.username, lib.UNDRAWN_TEAM_NAME, lib.CONFIRM_NO)
                }
            
                lib.displayCurrentDraw(client.db, message);

                break;
            }
            case "confirm": {
                // argument validation
                let confirmed = args[1] || '';
                confirmed = confirmed.toLowerCase();
               
                if (confirmed === '' || (confirmed !== lib.CONFIRM_YES && confirmed !== lib.CONFIRM_NO)) {
                    return message.channel.send(`Invalid confirmation, please use '${lib.CONFIRM_YES}' or '${lib.CONFIRM_NO}'.`)
                }

                lib.confirmPlayerDraw(client.db, message.author.id, confirmed);

                message.react(`👌`)

                break;
            }
            case "redraw": {
                // permission validation
                if (!message.member.roles.some(role => lib.ELEVATED_ROLES.includes(role.name))) {
                    return message.react(`🚫`); 
                }

                // player validation
                let playerArg = args[1] || ''
                
                if (!lib.validatePlayerArg(client, message, playerArg))
                    return;

                var targetID = playerArg.replace("<@","").replace(">","").replace("!", "");
                var targetDB = client.users.get(targetID)
            
                if (!targetDB) {
                    return message.channel.send('Who?! Never heard of them.');
                }                

                lib.getDrawnPlayers(client.db, function(rows) {
                    
                    let drawnPlayerRow = _.find(rows, (row) => {
                        return row.userId == targetDB.id && row.team !== lib.UNDRAWN_TEAM_NAME;
                    });

                    if (!drawnPlayerRow) {
                        return message.channel.send(`Um... that player hasn't been drawn into a team.`);
                    }

                    let undrawnPlayerRows = _.filter(rows, (row) => {
                        return row.team === lib.UNDRAWN_TEAM_NAME;
                    });

                    if (undrawnPlayerRows.length === 0) {
                        return message.channel.send(`We don't seam to have an undrawn players to chose from.`);
                    }

                    let newlyDrawnPlayerRow = _.take(lib.shuffle(undrawnPlayerRows), 1)[0];

                    // set the previously drawn player to undrawn
                    lib.updateDrawnPlayer(client.db, drawnPlayerRow.userId, lib.UNDRAWN_TEAM_NAME, lib.CONFIRM_NO);
                    // set the previously undrawn player to drawn in the appropriate team
                    lib.updateDrawnPlayer(client.db, newlyDrawnPlayerRow.userId, drawnPlayerRow.team, lib.CONFIRM_NO);                   

                    message.react(`👌`)
                });

                break;
            }
            case "replace": {
                // permission validation
                if (!message.member.roles.some(role => lib.ELEVATED_ROLES.includes(role.name))) {
                    return message.react(`🚫`); 
                }

                // player validation
                let playerArg = args[1] || ''
                
                if (!lib.validatePlayerArg(client, message, playerArg))
                    return;

                var targetID = playerArg.replace("<@","").replace(">","").replace("!", "");
                var targetDB = client.users.get(targetID)
            
                if (!targetDB) {
                    return message.channel.send('Who?! Never heard of them.');
                }                

                // new player validation
                let newPlayerArg = args[3] || ''

                if (!lib.validatePlayerArg(client, message, newPlayerArg))
                    return;

                var newTargetID = newPlayerArg.replace("<@","").replace(">","").replace("!", "");
                var newTargetDB = client.users.get(newTargetID)
            
                if (!newTargetDB) {
                    return message.channel.send(`Who?! I don't know who to replace them with.`);
                }                
                
                lib.getDrawnPlayers(client.db, function(rows) {
                    
                    let drawnPlayerRow = _.find(rows, (row) => {
                        return row.userId == targetDB.id && row.team !== lib.UNDRAWN_TEAM_NAME;
                    });

                    if (!drawnPlayerRow) {
                        return message.channel.send(`Um... that player hasn't been drawn into a team.`);
                    }

                    let undrawnPlayerRow = _.find(rows, (row) => {
                        return row.userId == newTargetDB.id && row.team === lib.UNDRAWN_TEAM_NAME;
                    });

                    if (!undrawnPlayerRow) {
                        return message.channel.send(`Um... the new player is not eligble to be drawn.`);
                    }

                    // set the previously drawn player to undrawn
                    lib.updateDrawnPlayer(client.db, drawnPlayerRow.userId, lib.UNDRAWN_TEAM_NAME, lib.CONFIRM_NO);
                    // set the previously undrawn player to drawn in the appropriate team
                    lib.updateDrawnPlayer(client.db, undrawnPlayerRow.userId, drawnPlayerRow.team, lib.CONFIRM_NO);                   

                    message.react(`👌`)
                });

                break;
            }
            case "finalize" : {
                // permission validation
                if (!message.member.roles.some(role => lib.ELEVATED_ROLES.includes(role.name))) {
                    return message.react(`🚫`); 
                }

                lib.getDrawnPlayers(client.db, function(rows) {

                    if (rows.length === 0) {
                        return message.channel.send(`Um... looks like no one is drawn yet boss.`);
                    }

                    const drawnPlayerRows = _.filter(rows, (row) => { 
                        return row.team !== lib.UNDRAWN_TEAM_NAME;
                    });

                    const allConfirmed = _.every(drawnPlayerRows, (row) => {
                        return row.confirmed === lib.CONFIRM_YES;
                    });

                    if (!allConfirmed) {
                        return message.channel.send(`Um... looks like not all players have confirmed yet.`);
                    }
                    
                    const wsPlayers = message.guild.roles
                        .find(role => role.name === lib.WS_PLAYER_ROLE)
                        .members;

                    const teams = _.groupBy(rows, 'team');

                    _.keys(teams).forEach(team => { 
                        
                        teams[team].forEach(drawnPlayer => {
                            const target = wsPlayers.find(wsPlayer => wsPlayer.id === drawnPlayer.userId);

                            if (target) {
                                let existingRoleNames = target.roles.map(role => role.name);
                                let preservedRoleNames = _.difference(existingRoleNames, _.concat(lib.TEAMS, lib.ALERTS));
                                let newRoleNames = team === lib.UNDRAWN_TEAM_NAME 
                                    ? preservedRoleNames
                                    : _.concat(preservedRoleNames, [ team ], lib.ALERTS)

                                let newRoles = message.guild.roles.filter(role => newRoleNames.includes(role.name));

                                target.setRoles(newRoles);
                            }
                        });                                     
                    });
                    
                    return message.channel.send('The draw has been finalized, all team roles are set. Good luck everyone!!!')
                });

                break;
            }
            default : {
                return message.react(`❔`);
            }
        }
    } else {
        lib.displayCurrentDraw(client.db, message);
    }
};
