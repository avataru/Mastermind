const _ = require('lodash');
const lib = require('../lib/achievements_library');

const HELP_TEXT = '!nominate @player achievement'
const MIN_NOMINATIONS = 3;

exports.config = {
};

exports.help = {
    name: 'nominate',
    category: 'Achievements',
    description: "Nominates a player for an achievement.",
    usage: HELP_TEXT + '\n\n' + 
        "Use !achievements to see a list of valid achievents. It takes " + MIN_NOMINATIONS + " nominations to get an achievement."
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

        let memberId = args[0].replace("<@","").replace(">","").replace("!", "");
        let member = message.guild.members.find((x) => {
            return x.id === memberId;
        });
    
        if (!member) {
            return message.channel.send('Who?! Never heard of them...');
        }
        
        if (member.id === message.member.user.id) {
            return message.channel.send("Hey! You can't nominate yourself.");
        }
        
        var name = member.nickname || member.user.username;
                
        lib.addNomination(client.db, message.author.id, member.id, name, achievement.id, Date.now());

        lib.getNominationCount(client.db, member.id, achievement.id, function(count) {
            if (count >= MIN_NOMINATIONS) {
                lib.addAchievement(db, member.id, name, achievement.id);

                return message.channel.send(`${MIN_NOMINATIONS} reached. Achievent awarded!`);                
            } else {
                return message.react(`👌`);
            }  
        });           
    } else {
        message.channel.send('Nope, try again.\n' + HELP_TEXT + '\n\n' + lib.getAchievementsText());
    }
};