const self = module.exports;

exports.config = {
};

exports.help = {
    name: 'ping',
    category: 'Misc',
    description: 'Play ping-pong on server time.',
    usage: 'ping'
};

exports.run = (client, message, args) => {
    message.channel.send('Ping?')
        .then(m => m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`));
};
