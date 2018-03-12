
var getDisabledCommands = function(db, channel, callBack) {    
    db.all(`SELECT command FROM disabled_commands WHERE channel = "${channel}";`, [], (error, rows) => {
        if (error) {
            return console.log(`Unable to retrieve achievements data.`, error.message);
        }
        
        callBack(rows.map(c => c.command));
    });
};

module.exports = {
    getDisabledCommands: getDisabledCommands
 }