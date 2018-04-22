const { version } = require("discord.js");
const moment = require("moment");
require("moment-duration-format");

const pjson = require('../package.json');

const self = module.exports;

exports.config = {    
    enabledRoles: ['First Officer', 'Officer']
};

exports.help = {
    name: 'botinfo',    
    category: 'Misc',
    description: 'Shows bot running info.',
    usage: () => { return 'botinfo'; }
};

exports.run = (client, message, args) => {
    const duration = moment.duration(client.uptime).format(" D [days], H [hrs], m [mins], s [secs]");
    message.channel.send(
`= Bot Info =
• Bot version :: ${pjson.version}
• Mem Usage   :: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
• Uptime      :: ${duration}
• Users       :: ${client.users.size.toLocaleString()}
• Servers     :: ${client.guilds.size.toLocaleString()}
• Channels    :: ${client.channels.size.toLocaleString()}
• Discord.js  :: v${version}
• Node        :: ${process.version}`, {code: "asciidoc"});
};
