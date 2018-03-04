const _ = require('lodash');
const lib = require('../lib/achievements_library');
const self = module.exports;

const HELP_TEXT = '!achievements [@player]'

exports.config = {
    enabled: true,
    accent: 0xFFD700
};

exports.help = {
    name: 'achievements',
    description: "Display a player's achievements.",
    usage: HELP_TEXT
};

exports.init = (client) => {
    lib.initDb(client.db);
};

exports.run = (client, message, args) => {
    if (args && args.length == 1) {       

        if (!lib.validatePlayerArg(client, message, args, HELP_TEXT))
            return;

        var targetID = args[0].replace("<@","").replace(">","").replace("!", "");
        var targetDB = client.users.get(targetID)
    
        if (!targetDB) {
            return message.channel.send('Who?! Never heard of them.');
        }
        
        lib.getAchievements(client.db, targetDB.id, function(rows) {
            var text = "";
            rows.forEach(row => {
                
                if (row.num > 0 || row.nom > 0) {
                    var ach = lib.getAchievement(row.achievementId);
                    
                    text += ach.emoji + " x " + row.num + (row.nom ? " (" + row.nom + " of 3)" : "") + "\n"
                }
            });

            if (text != "") {
                return message.channel.send(text);
            } else {
                return message.channel.send("No achievements or nominations yet.");
            }
        });    
    } else {
        message.channel.send(lib.getAchievementsText());
    }
};