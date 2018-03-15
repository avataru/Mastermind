const _ = require('lodash');
const Table = require('easy-table');

let addHeadingRow = function(table, heading) {
  table.cell('Player', heading);
  table.cell('Last messaged', '');    
  table.newRow();
} 

let addPlayerRow = function(table, row) {
  table.cell('Player', row.username);
  table.cell('Last messaged', row.messaged);    
  table.newRow();
}

// fetch and update all guild members last messaged times
let updateEntries = function(db, message) {
  message.guild.members.array().forEach((member) => {
    if (!member.user.bot && member.lastMessage) {
      var name = member.nickname || member.user.username;
      var messagedTime = buildMessage(member.lastMessage.createdTimestamp);

      db.run(`REPLACE INTO last_seen (userId, username, timestamp, messaged) VALUES (?, ?, ?, ?)`, [member.id, name, member.lastMessage.createdTimestamp, messagedTime], function(error) {
        if (error) {
            return console.log(`Unable to save last seen data for user ${name} (${member.id})`, error.message);
        }
      });
    }
  });
}

// build friendly "last message" text
var buildMessage = function(timestamp) {  
  var hours = Math.round((Date.now() - timestamp) / 3600000);

  return hours ? `${hours} hours ago.` : "just now...";
}

exports.config = {
};
  
exports.help = {
    name: "seen",
    category: 'White Star',
    description: "When was the last time a player messaged?",
    usage: "seen [@player]."
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
      transaction.commit(error => {
          if (error) {
              return console.log(`Unable to create the last_seen table`, error.message);
          }
      });
  });
};

exports.run = (client, message, args) => { 
    
    if (args.length === 0) {
      updateEntries(client.db, message);
      // display all stored last messaged times
      client.db.all(`SELECT userId, username, messaged FROM last_seen ORDER BY username COLLATE NOCASE ASC`, [], (error, rows) => {
        if (error) {
            return console.log(`Unable to retrieve last seen data.`, error.message);
        }
        
        let table = new Table;
        let teamARows = [], teamBRows = [], teamCRows = [], noTeamRows = [];

        _.map(rows, row => {                
            if (message.guild.members.find('id', row.userId).roles.some(x => x.name === 'Team A')) {
                teamARows.push(row)
            } else if (message.guild.members.find('id', row.userId).roles.some(x => x.name === 'Team B')) {
                teamBRows.push(row)
            } else if (message.guild.members.find('id', row.userId).roles.some(x => x.name === 'Team C')) {
                teamCRows.push(row)
            } else {
                noTeamRows.push(row)
            }
        });

        if (teamARows.length) {
            addHeadingRow(table, '= Team A =')
            teamARows.forEach(row => { addPlayerRow(table, row) });
        }

        if (teamBRows.length) {
            addHeadingRow(table, '= Team B =')
            teamBRows.forEach(row => { addPlayerRow(table, row) });
        }

        if (teamCRows.length) {
            addHeadingRow(table, '= Team C =')
            teamCRows.forEach(row => { addPlayerRow(table, row) });
        }

        if (noTeamRows.length) {
            if (teamARows.length || teamBRows.length || teamCRows.length) {
                addHeadingRow(table, '= Other =')
            }
            
            noTeamRows.forEach(row => { addPlayerRow(table, row) });
        }

        return message.channel.send(`= Last Seen =\n\n${table.toString()}`, {code:'asciidoc'});
      });
    }

    // do we have a player param?
    if (args.length === 1 && args[0].indexOf("<@") >= 0 ) {
      updateEntries(client.db, message);
      
      let memberId = args[0].replace("<@","").replace(">","").replace("!", "");
      
      // read from DB and display for user, else display a "not seen" message
      client.db.all(`SELECT username, messaged FROM last_seen WHERE userId = '${memberId}'`, [], (error, rows) => {
        if (error) {
            return console.log(`Unable to retrieve last seen data.`, error.message);
        }

        if (rows.length == 1) {
          return message.channel.send(`${rows[0].username} last messaged ${rows[0].messaged}`);
        } else {
          return message.channel.send(`Who?! Never heard of them.`);
        }        
      });
    }    
  };