const _ = require('lodash');
const Table = require('easy-table');
const lib = require('../lib/ws_library');

const self = module.exports;

const ELEVATED_ROLES = ['First Officer', 'Officer', 'Devs'];
const WS_PLAYER_ROLE = 'WhiteStar Player';
const WS_SIZES = [2, 5, 10, 15, 20];
const MAX_TEAM_SIZE = 3;
const TEAMS = ['Team A', 'Team B', 'Team C']

exports.config = {    
};

exports.help = {
    name: 'ws',
    category: 'White Star',
    description: 'Manage White Star participants.',
    usage: '\n' + 
           'To display the current draw:\n' +
           'ws\n\n' +
           'To make a new random draw:\n' +
           'ws draw [white star size] [number of teams]\n\n' + 
           'To confirm your place in the next White Star:\n' +
           'ws confirm [y/n]\n\n' + 
           'To replace a player with a random undrawn player:\n' +
           'ws redraw [@player]\n\n' +
           'To replace a player with another undrawn player:\n' +
           'ws replace [@player] with [@player]\n\n' +
           'To finalise the current draw, and set all roles:\n' +
           'ws finalize'

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
                if (!message.member.roles.some(role => ELEVATED_ROLES.includes(role.name))) {
                    return message.react(`🚫`); 
                }
                
                // white star size validation
                let sizeArg = args[1] || '';

                if (isNaN(sizeArg) || !WS_SIZES.includes(+sizeArg)) {
                    return message.channel.send(`Invalid white star size. Try ${_.join(WS_SIZES, ', ')}`);
                }

                const targetRole = message.guild.roles.find(role => role.name === WS_PLAYER_ROLE);
                const players = targetRole.members || {size:0};

                if (players.size < +sizeArg) {
                    return message.channel.send(`We don't have enough players in '${WS_PLAYER_ROLE}' for that.`);
                }

                // team size validation
                let teamsArg = args[2] || '';

                if (isNaN(teamsArg) || +teamsArg <= 0 || +teamsArg > MAX_TEAM_SIZE) {
                    return message.channel.send(`Invalid team size. Try something between 1 and ${MAX_TEAM_SIZE}.`);
                }

                client.db.run(`DELETE FROM white_star`, [], function(error) {
                    if (error) {
                        return console.log(`Unable to clear the current white star draw.`, error.message);
                    }

                    let randomizedPlayers = lib.shuffle(players.array())
                    let drawnPlayers = randomizedPlayers.slice(0, +sizeArg)
                    let undrawnPlayers = randomizedPlayers.slice(+sizeArg)

                    const playersPerTeam = Math.ceil(drawnPlayers.length / +teamsArg);
                    
                    let teams = _.chunk(drawnPlayers, playersPerTeam);

                    // add the randomly drawn players by team
                    for (let i = 0; i < teams.length; i++) {
                        const team = teams[i];
                        for (let j = 0; j < team.length; j++) {
                            const player = team[j];
                            
                            lib.addDrawnPlayer(client.db, player.user.id, player.user.nickname || player.user.username, TEAMS[i], 'n')
                        }
                    }

                    // add the undrawn players
                    for (let j = 0; j < undrawnPlayers.length; j++) {
                        const player = undrawnPlayers[j];
                        
                        lib.addDrawnPlayer(client.db, player.user.id, player.user.nickname || player.user.username, 'Undrawn', 'n')
                    }
                
                    lib.displayCurrentDraw(client.db, message);
                });

                break;
            }
            case "confirm": {
                // argument validation
                let confirmed = args[1] || '';
                confirmed = confirmed.toLowerCase();
               
                if (confirmed === '' || (confirmed !== 'y' && confirmed !== 'n')) {
                    return message.channel.send(`Invalid confirmation, please use 'y' or 'n'.`)
                }

                lib.confirmPlayerDraw(client.db, message.author.id, confirmed);

                message.react(`👌`)

                break;
            }
            case "redraw": {
                // permission validation
                if (!message.member.roles.some(role => ELEVATED_ROLES.includes(role.name))) {
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
                
                message.channel.send('TODO')

                // TODO: get the player to be removed so we know his team
                //       get all undrawn players, and randomly select one (if there are none, bail with an error message)
                //       remove the origional player
                //       insert the new player 

                break;
            }
            case "replace": {
                // permission validation
                if (!message.member.roles.some(role => ELEVATED_ROLES.includes(role.name))) {
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

                // TODO: check that the player is currently in a drawn team

                // new player validation
                let newPlayerArg = args[3] || ''

                if (!lib.validatePlayerArg(client, message, newPlayerArg))
                    return;

                var newTargetID = newPlayerArg.replace("<@","").replace(">","").replace("!", "");
                var newTargetDB = client.users.get(newTargetID)
            
                if (!newTargetDB) {
                    return message.channel.send(`Who?! I don't know who to replace them with.`);
                }

                // TODO: check that new player is in the undrawn team
                
                message.channel.send('TODO')

                // TODO: swap the two players teams

                break;
            }
            case "finalize" : {
                // permission validation
                if (!message.member.roles.some(role => ELEVATED_ROLES.includes(role.name))) {
                    return message.react(`🚫`); 
                }

                // TODO: check that there are drawn players
                //       check that all drawn players are confirmed

                message.channel.send('TODO')

                // TODO: clear all team roles
                //       set new team roles based on the draw

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
