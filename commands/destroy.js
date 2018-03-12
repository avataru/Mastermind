const self = module.exports;

exports.config = {
};

exports.help = {
    name: 'destroy',
    category: 'Just for fun',
    description: 'Destroy stuff (designed for Paligan)',
    usage: 'destroy [something]'
};

exports.run = (client, message, args) => {
    if (message.member.user.username === 'Paligan') {
        message.channel.send(`No, sorry, have some cake instead.`);
    } else {
        message.channel.send(`Done, ${args[0]} is gone! Are you happy?`);
    }
};
