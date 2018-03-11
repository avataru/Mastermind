const _ = require('lodash');
const lib = require('../lib/achievements_library');
const self = module.exports;

const HELP_TEXT = '!revoke @player achievement'

exports.config = {
    enabledRoles: ['First Officer', 'Officer', 'Devs']
};

exports.help = {
    name: 'revoke',
    category: 'White Star',
    description: "Revokes a player's achievement.",
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

        var targetID = args[0].replace("<@","").replace(">","").replace("!", "");
        var targetDB = client.users.get(targetID)
    
        if (!targetDB) {
            return message.channel.send('Who?! Never heard of them.');
        }  

        lib.removeAchievement(client.db, targetDB.id, achievement.id);

        return message.react(`👌`);
    } else {
        message.channel.send('Nope, try again.\n' + HELP_TEXT + '\n\n' + lib.getAchievementsText());
    }
};