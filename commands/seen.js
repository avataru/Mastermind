const _ = require('lodash');
const Table = require('easy-table');

var updateEntry = function(db, userId, username, timestamp, messaged) {
  db.run(`REPLACE INTO last_seen (userId, username, timestamp, messaged) VALUES (?, ?, ?, ?)`, [userId, username, timestamp, messaged], function(error) {
    if (error) {
        return console.log(`Unable to save last seen data for user ${username} (${userId})`, error.message);
    }
  });
}

var buildMessage = function(timestamp) {  
  var hours = Math.round((Date.now() - timestamp) / 3600000);
  return hours ? `${hours} hours ago.` : "just now...";
}

exports.config = {
    enabled: true
};
  
exports.help = {
    name: "seen",
    description: "When was the last time a player messaged?",
    usage: "seen [@user]."
};

exports.init = (client) => {
  client.db.beginTransaction((error, transaction) => {

      // table creation for storing last seen data
      transaction.run(`CREATE TABLE IF NOT EXISTS last_seen (
          userId TEXT NOT NULL PRIMARY KEY,
          username TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          messaged TEXT NOT NULL
      );`);
      transaction.run(`CREATE UNIQUE INDEX IF NOT EXISTS unique_username ON last_seen (username);`);
      /* table creation for storing last init timestamp
      transaction.run(`CREATE TABLE IF NOT EXISTS last_seen_init (
        id TEXT NOT NULL PRIMARY KEY,
        timestamp TEXT NOT NULL
      );`);
      transaction.run(`CREATE UNIQUE INDEX IF NOT EXISTS unique_id ON last_seen_init (id);`);
      */
      transaction.commit(error => {
          if (error) {
              return console.log(`Unable to create the last_seen table`, error.message);
          }
      });
  });

  /*
  var lastSeenOffset = 0;

  client.db.all(`SELECT timestamp FROM last_seen_init COLLATE NOCASE ASC`, [], (error, rows) => {
    if (error) {
        return console.log(`Unable to retrieve the last init timestamp`, error.message);
    }

    // work out the time difference between when init last ran and now
    lastSeenOffset = Date.now() - row.timestamp
  });

  if (lastSeenOffset) {
    // update all entries timestamps with the "gap" since the last init was
    client.db.all(`SELECT userId, username, timestamp, messaged FROM last_seen ORDER BY username COLLATE NOCASE ASC`, [], (error, rows) => {
      if (error) {
          return console.log(`Unable to retrieve last seen data.`, error.message);
      }

      var newTimestamp = row.timestamp + lastSeenOffset;

      updateEntry(db, row.userId, row.username, newTimestamp, buildMessage(newTimestamp))      
    });
  }

  // update the init timestamp for next time
  client.db.run(`REPLACE INTO last_seen_init (id, timestamp) VALUES (?, ?)`, ['last', Date.now()], function(error) {
    if (error) {
        return console.log(`Unable to save last_seen_init timestamp`, error.message);
    }
  });  
  */
};

exports.run = (client, message, args) => { 

    var searchObj = message.guild,
        targetID = message.author.id;
  
    if (args.length === 0) {
      searchObj.members.forEach(function (target, targetID, mapObj) {
        
        if (targetID != process.env.DISCORD_BOT_ID) {
          var targetDB = client.users.get(targetID) || {username: `<@${targetID}>`}
          
          if (targetDB.lastMessage && !targetDB.bot) {            
            var name = targetDB.nickname || targetDB.username;
            var messaged = buildMessage(targetDB.lastMessage.createdTimestamp);

            updateEntry(client.db, targetDB.id, name, targetDB.lastMessage.createdTimestamp, messaged)            
          }
        }
      });      

      client.db.all(`SELECT username, messaged FROM last_seen ORDER BY username COLLATE NOCASE ASC`, [], (error, rows) => {
        if (error) {
            return console.log(`Unable to retrieve last seen data.`, error.message);
        }
        
        var table = new Table;

        _.map(rows, row => {
            table.cell('Player', row.username);
            table.cell('Last messaged', row.messaged);
            table.newRow();
        });

        message.channel.send("```" + table.sort('Player|des').toString() + "```"); 
        return;   
      });
    }

    // do we have a player param?
    if (args.length === 1 && args[0].indexOf("<@") >= 0 ) {
      targetID = args[0].replace("<@","").replace(">","");
      var targetDB = client.users.get(targetID) || {username: args[0]}      

      // if this connection has a last messaged for the speciied user, then update the DB
      if (targetDB.lastMessage) {
        var name = targetDB.nickname || targetDB.username;
        var messaged = buildMessage(targetDB.lastMessage.createdTimestamp);

        updateEntry(client.db, targetDB.id, name, targetDB.lastMessage.createdTimestamp, messaged)
      }

      // read from DB and display for user, else display a "not seen" message
      client.db.all(`SELECT username, messaged FROM last_seen WHERE userId = '${targetID}'`, [], (error, rows) => {
        if (error) {
            return console.log(`Unable to retrieve last seen data.`, error.message);
        }

        if (rows.length == 1) {
          message.channel.send(`${rows[0].username} last messaged ${rows[0].messaged}`);
        } else {
          message.channel.send(`Who?! Never heard of them.`);
        }        
      });
    }    
  };