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
    usage: () => { return 'remindme [time] to [something]'; }
};

exports.run = (client, message, args) => {
    const argument = args.join(' ');
    const timeText = argument.split(/\s+t(?:o|hat)\s+/, 1)[0];
    const time = chrono.parseDate(timeText);
    let reminder = argument.replace(timeText, '');
    reminder = (reminder || '')
        .replace(/\s+i am\s+/gi, ' you are ')
        .replace(/\s+my\s+/gi, ' your ')
        .replace(/\s+(?:i|me)\s+/gi, ' you ');

    const delay = moment(time).valueOf() - moment().valueOf();

    if (delay) {
        message.react(`👌`);

        setTimeout((reminder) => {
            if (!_.isEmpty(reminder)) {
                message.reply(`It's time${reminder}`);
            } else {
                message.reply(`It's time`);
            }
        }, delay, reminder);
    } else {
        return message.react(`❔`);
    }

    
};
