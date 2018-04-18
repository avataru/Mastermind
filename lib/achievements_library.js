const _ = require('lodash');
const Table = require('easy-table');

var validatePlayerArg = function(client, message, args, HELP_TEXT) {
    if (!_.isEmpty(args[0]) && args[0].indexOf("<@") < 0) {
        message.channel.send('You need to specify a player.\n' + HELP_TEXT);
        return false;
    }  

    return true;
};

var addNomination = function(db, nominatorUserId, userId, username, achievementId, timestamp) {
    db.query(`INSERT IGNORE INTO nominations (nominatorUserId, userId, username, achievementId, timestamp)
            VALUES ('${nominatorUserId}', '${userId}', '${username}', '${achievementId}', '${timestamp}')`,
            function(error) {
                if (error) {
                    return console.log(`Unable to add nomination for user ${userId}`, error.message);
                }
            });
};

var removeNominations = function(db, userId, achievementId) {
    db.query(`DELETE FROM nominations WHERE userId = '${userId}' AND achievementId = '${achievementId}'`, [], function(error) {
        if (error) {
            return console.log(`Unable to remove nominations for user ${userId}`, error.message);
        }
    });
};

var getNominationCount = function(db, userId, achievementId, callBack) {    
    db.query(`SELECT * FROM nominations WHERE userId = '${userId}' AND achievementId = '${achievementId}'`, [], (error, rows) => {
        if (error) {
            return console.log(`Unable to retrieve nominations data.`, error.message);
        }
        
        callBack(rows.length);
    });
};

var addAchievement = function(db, userId, username, achievementId) {
    db.beginTransaction((error) => {
        if (error) {
            return console.log(`Unable to add achievement for user ${userId}`, error.message);
        }

        db.query(`INSERT IGNORE INTO achievements (userId, username, achievementId, num) VALUES ('${userId}', '${username}', '${achievementId}', 0);`, function(error) {
            if (error) {
                return console.log(`Unable to add achievement for user ${userId}`, error.message);
            }

            db.query(`UPDATE achievements SET num = num + 1 WHERE userId = '${userId}' AND achievementId = '${achievementId}';`, [], function(error) {
                if (error) {
                    return console.log(`Unable to update achievement for user ${userId}`, error.message);
                }

                db.query(`DELETE FROM nominations WHERE userId = '${userId}' AND achievementId = '${achievementId}'`, [], function(error) {
                    if (error) {
                        return console.log(`Unable to remove nominations for user ${userId}`, error.message);
                    }

                    db.commit(error => {
                        if (error) {
                            return console.log(`Unable to update achievement for user ${userId}`, error.message);
                        }
                    });
                });
            });
        });
    });    
};

var removeAchievement = function(db, userId, achievementId) {
    db.query(`UPDATE achievements SET num = num - 1 WHERE userId = '${userId}' AND achievementId = '${achievementId}' AND num > 0`, [], function(error) {
        if (error) {
            return console.log(`Unable to remove achievement for user ${userId}`, error.message);
        }
    });
};

var getAchievements = function(db, userId, callBack) {    
    db.query(`SELECT username, achievementId, SUM(num) AS num, SUM(nom) AS nom 
              FROM (
                SELECT a.userId, a.username, a.achievementId, a.num, 0 as nom
                FROM achievements a
                WHERE a.userId = "${userId}"
                UNION ALL
                SELECT n.userId, n.username, n.achievementId, 0 as num, COUNT(n.achievementId) as nom
                FROM nominations n
                WHERE n.userId = "${userId}"
                GROUP BY n.userId, n.username, n.achievementId
            ) AS T
            GROUP BY username, achievementId;`, [], (error, rows) => {
        if (error) {
            return console.log(`Unable to retrieve achievements data.`, error.message);
        }
        
        callBack(rows);
    });
};

var getAchievement = function(text) {
    var result = null;
    achievements.forEach(achievement => { 
        if (achievement.id === text || achievement.emoji === text || achievement.icon === text) {
            result = achievement;
            return;         
        }
    });

    return result;
};

var getAchievementsText = function() {
    var text = "";
    achievements.forEach(achievement => {
        text += achievement.emoji + " [" + achievement.id + "] " + achievement.description + "\n"
    });
    
    return text;
};

var achievements = [
    {
        id: 'bacon',
        icon: '🥓',
        emoji: ':bacon:',
        description: "Saved the Bacon: Swooped in to save another player's ship from certain death."
    },
    {
        id: 'glory',
        icon: '✝',
        emoji: ':cross:',
        description: "Glorious Death: Died in a spectacular setup to help the team. A strategic sacrifice."
    },
    {
        id: 'emp',
        icon: '⚡',
        emoji: ':zap:',
        description: "EMP Overlord: EMPing 4 or more enemy ships, and no allies."
    },
    {
        id: 'survivor',
        icon: '🤕',
        emoji: ':head_bandage:',
        description: "Survivor: Survive an enemy engagement with less than 100 hull."
    },
    {
        id: 'rocket',
        icon: '🚀',
        emoji: ':rocket:',
        description: "Rocket Sniper: A particularly well timed, well setup, or effective bit of rocketry."
    },
    {
        id: 'champ',
        icon: '👏',
        emoji: ':clap:',
        description: "Champ: General recognition for a good job, or well executed play. High five!"
    },
    {
        id: 'lucky',
        icon: '🍀',
        emoji: ':four_leaf_clover:',
        description: "Lucky Mother F**ker: Pulled off an unbelievably lucky move, or escaped certain death through nothing but dumn luck."
    },
    {
        id: 'wall',
        icon: '🛑',
        emoji: ':octagonal_sign:',
        description: "The Wall: Stop 3 or more enemy ships at once with barrier."
    },
    {
        id: 'hulk',
        icon: '😡',
        emoji: ':rage:',
        description: "Hulk: Kill 4 or more enemy ships at once with destiny or vengeance."
    },
    {
        id: 'guardian',
        icon: '🛡',
        emoji: ':shield:',
        description: "Guardian: Recognition for exceptional effort in protecting a transport or miner. Also for long periods of boring planet camping duty."
    },
    {
        id: 'tactician',
        icon: '🎖',
        emoji: ':military_medal:',
        description: "Tactician: Orchestrating a killer set of moves, or being a top class team leader."
    },
];

module.exports = { 
    validatePlayerArg: validatePlayerArg,

    achievements: achievements,
    
    getAchievement: getAchievement,
    getAchievements: getAchievements,
    getAchievementsText: getAchievementsText,

    addNomination: addNomination,
    removeNominations: removeNominations,
    getNominationCount: getNominationCount,

    addAchievement: addAchievement,
    removeAchievement: removeAchievement
}