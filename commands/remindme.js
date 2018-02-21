var chrono = require('chrono-node')
var moment = require('moment')
const self = module.exports;

exports.config = {
    enabled: true
};

exports.help = {
    name: 'remindme',
    description: 'Reminds you of something at some point.',
    usage: 'remindme [time] to [something]'
};

exports.run = (client, message, args) => {
    const argument = args.join(' ');
    args = argument.split(' to ');
    const time = chrono.parseDate(args[0]);

    const reminder = args[1]
        .replace(/\s+i am\s+/gi, ' you are ')
        .replace(/\s+i\s+/gi, ' you ');

    const delay = moment(time).valueOf() - moment().valueOf();

    message.reply(`Ok, I will remind you.`);

    setTimeout((reminder) => { message.reply(`It's time to ${reminder}`); }, delay, reminder);
};
