const _ = require('lodash');
const self = module.exports;

exports.config = {
    enabledRoles: ['First Officer', 'Officer']
};

exports.help = {
    name: 'message',
    category: 'Misc',
    description: 'Sends a predefined message to a player or group.',
    usage: () => { return '!message [welcome|wsdraw|wsfinalized|wsfound] [@player|@role]'; }
};

exports.run = (client, message, args) => {
    
    if (args && args.length == 2) {       

        if (!_.isEmpty(args[1]) && args[1].indexOf("<@") < 0) {
            return message.channel.send('You need to specify a player or role.');
        }  

        let id = args[1].replace("<@","").replace(">","").replace("!", "").replace("&", "");

        let group = null;
        let member = message.guild.members.find((x) => {
            return x.id === id;
        });
    
        if (!member) {
            group = message.guild.roles.find((x) => {
                return x.id === id;
            });
        }

        if (!member && !group) {
            return message.channel.send('You need to specify a player or role.');
        }

        switch(args[0]) {
            case "welcome":
                message.channel.send(`
Welcome ${args[1]} to the corp Discord :smiley:
                    
If you'd like to join Red Star runs, please join the '#red-star-comm-link' channel. Here you can use '@RS6' or '@RS7' etc. to co-ordinate runs with other players. Just let an '@Officer' know which RS you are on, and they will set your role so you get notifications when other players are organising a run too.

We run White Stars back-to-back, and use a random draw to determine who gets to go. Priority is always given to active plyers, i.e. players who can commit to checking in-game and Discord +- every 3 hours.

We also have a corp bot, Mastermind. type !help to see a list of commands to help you with White Star runs, and general gameplay.

If you have any questions, please don't hestite to ask.`
                );
                break;
            case "wsdraw":
                message.channel.send(`
${args[1]}, the new draw has been completed.

If you have been selected, or if you have not been selected but are interested if a spot opens up, please confirm using: !ws confirm y

Remember, you need to be extra active for White Stars, and able to check in-game and Discord at least every 3 hours during the day, or you might let the team down.`
                );
                break;
            case "wsfinalized":
                message.channel.send(`
${args[1]}, the draw has been finalized and the white star search will start shortly... please update your ship tech using the !tbs, !tmn and !ttr commands as soon as possible.`
                );
                break;
            case "wsfound":
                message.channel.send(`
${args[1]}, a new White Star has been found. The day 1 plan will be posted soon.

Remember the golden rules:
1) Plan every move in Time Machine, so you can change them if needed.
2) Small hops when travelling, and set your waypoints as late as possible so you are unpredictable to the enemy.
3) If you are using a time warp, make sure you let everyone know with a '@PurpleAlert'
4) Most importantly, work as a team, kick arse and have fun :smiley:`
                );
                break;
            default:
                return message.react(`❔`);
        }
    } else {
        return message.channel.send('You need to specify a message and a player or role.');
    }
};