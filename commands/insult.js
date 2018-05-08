const request = require('request');
const decode = require('unescape');

const self = module.exports;

exports.config = {
};

exports.help = {
    name: 'insult',
    category: 'Just for fun',
    description: 'Insults someone, you dumbarse!',
    usage: () => { return 'insult [@player]'; }
};

exports.run = (client, message, args) => {

    let url = 'https://evilinsult.com/generate_insult.php?lang=en&type=json';
    
    request(url, function(error, response, html) {
        if (!error) {
          let data = JSON.parse(html);
          let insult = decode(data.insult)

          let target = message.mentions.members.first();

          if (target) {            
            if (target.user.bot) {
                return message.channel.send("Hey " + target + ": You're the best!!!");
            }

            return message.channel.send('Hey ' + target + ': ' + insult);
          } else {
            return message.channel.send(insult);
          }
          
        } else if (error) {
            return message.channel.send('Puny human!');
        }
      });
};
