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
    usage: (message) => {

        let text = '\n';

        if (message.member.roles.some(role => lib.ELEVATED_ROLES.includes(role.name))) {
            text +=
            '= Officers =\n\n' +
            'To make a new random draw:\n' +
            '!ws draw [white star size] [number of teams]\n\n' +
            'To replace a player with a random undrawn player:\n' +
            '!ws redraw [@player]\n\n' +
            'To replace a player with another undrawn player:\n' +
            '!ws replace [@player] with [@player]\n\n' +
            'To swap two players\' teams:\n' +
            '!ws swap [@player] with [@player]\n\n' +
            'To set the draw weighting for a player:\n' +
            '!ws setweight [player] [number]\n\n' +
            'To view the draw weighting:\n' +
            '!ws weights\n\n' +
            'To finalize the current draw, and set all roles:\n' +
            '!ws finalize\n\n' +
            '= Everyone =\n\n';
        }

        text +=
        'To display the current draw:\n' +
        '!ws\n\n' +
        'To confirm your place in the next White Star:\n' +
        '!ws confirm [y/n]\n\n' +
        'To specify if you are using your transport:\n' +
        '!ws ttr [y/n]\n\n' +
        'To specify if you are using your miner:\n' +
        '!ws tmn [y/n]\n\n' +
        'To set your BS job in the next White Star:\n' +
        '!ws job [job] [@player]';

        return text;
    }
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

                lib.applyWeights(client.db, players.array(), function(weightedEntries) {
                    const drawnPlayers = weightedEntries.slice(0, +sizeArg);
                    const undrawnPlayers = weightedEntries.slice(+sizeArg);
    
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
                });                

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
            case "weights": {
                // permission validation
                if (!message.member.roles.some(role => lib.ELEVATED_ROLES.includes(role.name))) {
                    return message.react(`🚫`);
                }

                lib.getWeights(client.db, (rows) => {
                    
                    let table = new Table;

                    rows.forEach(row => {
                        table.cell('Player', row.username);
                        table.cell('Weight', row.weight);
                        table.newRow();
                    });

                    return message.channel.send(table.toString(), {code:'asciidoc'});                    
                });

                break;
            }
            case "setweight": {
                // permission validation
                if (!message.member.roles.some(role => lib.ELEVATED_ROLES.includes(role.name))) {
                    return message.react(`🚫`);
                }
                
                // player validation
                let playerArg = args[1] || ''

                if (!lib.validatePlayerArg(client, message, playerArg, true))
                    return;

                var targetID = playerArg.replace("<@","").replace(">","").replace("!", "");
                let member = message.guild.members.find((x) => {
                    return x.id === targetID;
                });

                if (!member) {
                    return message.channel.send('Who?! Never heard of them.');
                }               

                const userId = member.id;
                const username = member.nickname || member.user.username;

                // weight validation
                const weight = args[2] || ''

                if (isNaN(weight) || +weight < 0) {
                    message.channel.send(`Invalid weight number **${weight}**\nPlease use 0 or higher.`);
                    return;
                }

                lib.setWeight(client.db, userId, username, weight);

                message.react(`👌`);

                break;
            }
            case "job": {
                // argument validation
                let job = args[1] || '';
                job = job.toLowerCase();

                let userId = message.author.id;

                let target = message.mentions.members.first();

                if (!_.isEmpty(target)) {
                    if (message.member.roles.some(role => lib.ELEVATED_ROLES.includes(role.name))) {
                        userId = target.user.id;
                    } else {
                        return message.react(`🚫`);
                    }
                }

                lib.setPlayerJob(client.db, userId, job);

                message.react(`👌`)

                break;
            }
            case "ttr" : {
                let confirmed = args[1] || '';
                confirmed = confirmed.toLowerCase();

                let userId = message.author.id;

                if (confirmed === '' || (confirmed !== lib.CONFIRM_YES && confirmed !== lib.CONFIRM_NO)) {
                    return message.channel.send(`Invalid status, please use '${lib.CONFIRM_YES}' or '${lib.CONFIRM_NO}'.`)
                }

                client.db.query(`UPDATE tr_tech SET inWs = '${confirmed}' WHERE userId = '${userId}'`, [], function(error) {
                    if (error) {
                        return console.log(`Unable to save transport tech for user (${userId})`, error.message);
                    }
                });

                client.db.query(`UPDATE mn_tech SET inWs = '${confirmed === lib.CONFIRM_NO ? lib.CONFIRM_YES : lib.CONFIRM_NO}' WHERE userId = '${userId}'`, [], function(error) {
                    if (error) {
                        return console.log(`Unable to save miner tech for user (${userId})`, error.message);
                    }
                });

                message.react(`👌`)

                break;
            }
            case "tmn" : {
                let confirmed = args[1] || '';
                confirmed = confirmed.toLowerCase();

                let userId = message.author.id;

                if (confirmed === '' || (confirmed !== lib.CONFIRM_YES && confirmed !== lib.CONFIRM_NO)) {
                    return message.channel.send(`Invalid status, please use '${lib.CONFIRM_YES}' or '${lib.CONFIRM_NO}'.`)
                }

                client.db.query(`UPDATE mn_tech SET inWs = '${confirmed}' WHERE userId = '${userId}'`, [], function(error) {
                    if (error) {
                        return console.log(`Unable to save miner tech for user (${userId})`, error.message);
                    }
                });

                client.db.query(`UPDATE tr_tech SET inWs = '${confirmed === lib.CONFIRM_NO ? lib.CONFIRM_YES : lib.CONFIRM_NO}' WHERE userId = '${userId}'`, [], function(error) {
                    if (error) {
                        return console.log(`Unable to save transport tech for user (${userId})`, error.message);
                    }
                });

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

                if (!lib.validatePlayerArg(client, message, playerArg, false))
                    return;

                var targetIdOrName = playerArg.replace("<@","").replace(">","").replace("!", "");
                
                lib.getDrawnPlayers(client.db, function(rows) {

                    var targetDB = client.users.get(targetIdOrName)
                    if (!targetDB) {
                        let targetUser = _.find(rows, (row) => {
                            return row.username == targetIdOrName;
                        });

                        if(!targetUser)
                            return message.channel.send('Who?! Never heard of them.');
                        else 
                        targetIdOrName = targetUser.userId
                    } else {
                        targetIdOrName = targetDB.id
                    }
                    
                    let drawnPlayerRow = _.find(rows, (row) => {
                        return row.userId == targetIdOrName && row.team !== lib.UNDRAWN_TEAM_NAME;
                    });

                    if (!drawnPlayerRow) {
                        return message.channel.send(`Um... that player hasn't been drawn into a team.`);
                    }

                    let undrawnPlayerRows = _.filter(rows, (row) => {
                        // first give preference to undrawn players that confirmed their interest
                        return row.team === lib.UNDRAWN_TEAM_NAME && row.confirmed === lib.CONFIRM_YES;
                    });

                    if (undrawnPlayerRows.length === 0) {
                        
                        undrawnPlayerRows = _.filter(rows, (row) => {
                            // then open it up to any undrawn player
                            return row.team === lib.UNDRAWN_TEAM_NAME;
                        });                        
                        
                        if (undrawnPlayerRows.length === 0) {
                            return message.channel.send(`We don't seam to have any undrawn players to chose from.`);
                        }
                    }

                    let newlyDrawnPlayerRow = _.take(_.shuffle(undrawnPlayerRows), 1)[0];

                    // set the previously drawn player to undrawn
                    lib.updateDrawnPlayer(client.db, drawnPlayerRow.userId, lib.UNDRAWN_TEAM_NAME, lib.CONFIRM_NO);
                    // set the previously undrawn player to drawn in the appropriate team
                    lib.updateDrawnPlayer(client.db, newlyDrawnPlayerRow.userId, drawnPlayerRow.team, newlyDrawnPlayerRow.confirmed);

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

                if (!lib.validatePlayerArg(client, message, playerArg, false))
                    return;

                var targetIdOrName = playerArg.replace("<@","").replace(">","").replace("!", "");
                
                // new player validation
                let newPlayerArg = args[3] || ''

                if (!lib.validatePlayerArg(client, message, newPlayerArg, true))
                    return;

                var newTargetID = newPlayerArg.replace("<@","").replace(">","").replace("!", "");
                var newTargetDB = client.users.get(newTargetID)

                if (!newTargetDB) {
                    return message.channel.send(`Who?! I don't know who to replace them with.`);
                }

                lib.getDrawnPlayers(client.db, function(rows) {

                    var targetDB = client.users.get(targetIdOrName);
                    if (!targetDB) {
                        let targetUser = _.find(rows, (row) => {
                            return row.username == targetIdOrName;
                        });

                        if(!targetUser)
                            return message.channel.send('Who?! Never heard of them.');
                        else 
                        targetIdOrName = targetUser.userId
                    } else {
                        targetIdOrName = targetDB.id
                    }

                    let drawnPlayerRow = _.find(rows, (row) => {
                        return row.userId == targetIdOrName && row.team !== lib.UNDRAWN_TEAM_NAME;
                    });

                    if (!drawnPlayerRow) {
                        return message.channel.send(`Um... that player hasn't been drawn into a team.`);
                    }

                    let undrawnPlayerRow = _.find(rows, (row) => {
                        return row.userId == newTargetDB.id && row.team === lib.UNDRAWN_TEAM_NAME;
                    });

                    undrawnPlayerRow = undrawnPlayerRow || {};
                    undrawnPlayerRow.team = undrawnPlayerRow.team || lib.UNDRAWN_TEAM_NAME;
                    undrawnPlayerRow.confirmed = undrawnPlayerRow.confirmed || lib.CONFIRM_NO
                    
                    // set the first player to the second player's team or undrawn
                    lib.updateDrawnPlayer(client.db, targetIdOrName, undrawnPlayerRow.team, drawnPlayerRow.confirmed);
                    // set the second player to the first player's team or undrawn
                    lib.updateDrawnPlayer(client.db, newTargetDB.id, drawnPlayerRow.team, undrawnPlayerRow.confirmed);

                    message.react(`👌`)
                });

                break;
            }
            case "swap": {
                // permission validation
                if (!message.member.roles.some(role => lib.ELEVATED_ROLES.includes(role.name))) {
                    return message.react(`🚫`);
                }

                // player validation
                let playerArg = args[1] || ''

                if (!lib.validatePlayerArg(client, message, playerArg, true))
                    return;

                var targetID = playerArg.replace("<@","").replace(">","").replace("!", "");
                var targetDB = client.users.get(targetID)

                if (!targetDB) {
                    return message.channel.send('Who?! Never heard of them.');
                }

                // new player validation
                let newPlayerArg = args[3] || ''

                if (!lib.validatePlayerArg(client, message, newPlayerArg, true))
                    return;

                var newTargetID = newPlayerArg.replace("<@","").replace(">","").replace("!", "");
                var newTargetDB = client.users.get(newTargetID)

                if (!newTargetDB) {
                    return message.channel.send(`Who?! I don't know who to swap them with.`);
                }

                lib.getDrawnPlayers(client.db, function(rows) {

                    let drawnPlayer1Row = _.find(rows, (row) => {
                        return row.userId == targetDB.id && row.team !== lib.UNDRAWN_TEAM_NAME;
                    });

                    if (!drawnPlayer1Row) {
                        return message.channel.send(`Um... both players need to be drawn into a team.`);
                    }

                    let drawnPlayer2Row = _.find(rows, (row) => {
                        return row.userId == newTargetDB.id && row.team !== lib.UNDRAWN_TEAM_NAME;
                    });

                    if (!drawnPlayer2Row) {
                        return message.channel.send(`Um... both players need to be drawn into a team.`);
                    }

                    // swap the drawn players' teams
                    lib.updateDrawnPlayer(client.db, drawnPlayer1Row.userId, drawnPlayer2Row.team, drawnPlayer1Row.confirmed);
                    lib.updateDrawnPlayer(client.db, drawnPlayer2Row.userId, drawnPlayer1Row.team, drawnPlayer2Row.confirmed);

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
