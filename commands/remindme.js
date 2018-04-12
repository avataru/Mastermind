const _ = require('lodash');
const chrono = require('chrono-node');
const moment = require('moment');
const self = module.exports;

exports.config = {
};

exports.help = {
    name: 'remindme',
    category: 'White Star',
    description: 'Reminds you of something at some point.',
    usage: 'remindme [time] to [something]'
};

exports.run = (client, message, args) => {
    const argument = args.join(' ');
    args = argument.split(/\s+t(?:o|hat)\s+/);
    const time = chrono.parseDate(args[0]);

    const reminder = (args[1] || '')
        .replace(/\s+i am\s+/gi, ' you are ')
        .replace(/\s+my\s+/gi, ' your ')
        .replace(/\s+(?:i|me)\s+/gi, ' you ');

    const delay = moment(time).valueOf() - moment().valueOf();

    message.react(`👌`);

    setTimeout((reminder) => {
        if (!_.isEmpty(reminder)) {
            message.reply(`It's time to ${reminder}`);
        } else {
            message.reply(`It's time`);
        }
    }, delay, reminder);
};
