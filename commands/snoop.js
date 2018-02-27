const table = require('easy-table');

exports.config = {
    enabled: true
  };
  
exports.help = {
    name: "snoop",
    description: "When is the last time a player messaged?",
    usage: "snoop [@user]."
};

exports.run = (client, message, args) => { 

    var hasData=false,
        scoreTable = new table,
        searchObj = message.guild,
        targetID = message.author.id;
  
    if (args.length === 0) {
      searchObj.members.forEach(function (target, targetID, mapObj) {
        
        if (targetID != process.env.DISCORD_BOT_ID) {
          var targetDB = client.users.get(targetID) || {username: `<@${targetID}>`}
          
          if (targetDB.lastMessage && !targetDB.bot) {
            
            hasData = true;
            var timeDiff = Math.round((Date.now() - targetDB.lastMessage.createdTimestamp) / 3600000);
            scoreTable.cell('User', targetDB.username);
            var lastSeen = timeDiff ? `${timeDiff} hours ago.` : "just now...";
            
            scoreTable.cell('Last messaged', lastSeen);
            scoreTable.newRow();
          }
        }
      });

      if (!hasData) {
        message.channel.send("No data found! Either no one is talking, or I just rebooted :|");
        return;
      }
      else {
        message.channel.send(`Last time everyone messaged...` + "```" + scoreTable.sort('User|des').toString()+"```"); 
        return;
      }
    }

    if (args.length === 1 && args[0].indexOf("<@") >= 0 ) {
        targetID = args[0].replace("<@","").replace(">","");
        var targetDB = client.users.get(targetID) || {username: args[0]}

        if (!targetDB.lastMessage) {
            message.channel.send(`I haven't seen ${targetDB.username} message anything yet.`);
            return;
        }
    
        var timeDiff = Math.round((Date.now() - targetDB.lastMessage.createdTimestamp) / 3600000);
        message.channel.send(`${targetDB.username} last messaged ${timeDiff} hours ago`);
    }    
  };