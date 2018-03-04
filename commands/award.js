const _ = require('lodash');
const lib = require('../lib/achievements_library');
const self = module.exports;

const HELP_TEXT = '!award @player achievement'

exports.config = {
    enabled: true,
    setOther: ['First Officer', 'Officer', 'Devs'],
    accent: 0xFFD700
};

exports.help = {
    name: 'award',
    description: 'Award a player with an achievement.',
    usage: HELP_TEXT + '\n\n' + "Use !achievements to see a list of valid achievents."
};

exports.init = (client) => {
    lib.initDb(client.db);
};

exports.run = (client, message, args) => {
    
    if (args && args.length == 2) {       

        if (!lib.validatePlayerArg(client, message, args, HELP_TEXT))
            return;

        var achievement = lib.getAchievement(args[1]);

        if (achievement === null) {
            return message.channel.send('I dont know that achievement, try one of these...\n\n' + lib.getAchievementsText());
        }

        var targetID = args[0].replace("<@","").replace(">","");
        var targetDB = client.users.get(targetID)
    
        if (!targetDB) {
            return message.channel.send('Who?! Never heard of them.');
        }      

        var name = targetDB.nickname || targetDB.username;
        
        const allowedRoles = self.config.setOther;
        if (_.isEmpty(allowedRoles) || message.member.roles.some(role => allowedRoles.includes(role.name))) {
            lib.addAchievement(client.db, targetDB.id, name, achievement.id);

            return message.channel.send(`Achievment awarded!`); 
        } else {
            return message.channel.send(`Sorry, this is for the big bosses only! But you can nominate a player for an award instead.`); 
        }      
    } else {
        message.channel.send('Nope, try again.\n' + HELP_TEXT + '\n\n' + lib.getAchievementsText());
    }
};