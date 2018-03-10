const _ = require('lodash');
const Discord = require('discord.js');

const config = require('./config.json');
const client = new Discord.Client();
const fs = require('fs');

const mcLib = require('./lib/mc_library');

const sqlite3 = require('sqlite3').verbose();
const TransactionDatabase = require("sqlite3-transactions").TransactionDatabase;
let db = new TransactionDatabase(
    new sqlite3.Database('./db/mastermind.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE)
);

client.on('ready', () => {
    console.log(`${config.name} has awakened and is logged in as ${client.user.username} (${client.user.id}).`);
    client.user.setActivity(`Hades' Star`);
});

client.config = config;
client.commands = {};
client.db = db;

fs.readdir('./commands/', (error, files) => {
    if (error) {
        console.error(error);
    }
    
    console.log(`Loading a total of ${files.length} commands.`);

    files.forEach(file => {
        if (file.split('.').slice(-1)[0] !== 'js') {
            return;
        }

        let command = require(`./commands/${file}`);
        client.commands[command.help.name] = command;
        if (command.init) {
            command.init(client);
        }
    });
});

client.on('message', async message => {
    if (message.author.bot) {
        return;
    }

    if (message.content.indexOf(config.prefix) !== 0) {
        return;
    }

    const args = message.content.split(/ +/g);
    const command = args.shift().slice(config.prefix.length).toLowerCase();

    if (_.has(client.commands, command)) {

        const allowedRoles = client.commands[command].config.enabledRoles;
        if (!_.isEmpty(allowedRoles) && !message.member.roles.some(role => allowedRoles.includes(role.name))) {
            return message.react(`🚫`);
        }

        mcLib.getDisabledCommands(client.db, message.channel.name, (commands) => {
            if (commands && commands.includes(command)) {
                return message.react(`🔇`);
            } else {
                client.commands[command].run(client, message, args);
            }
        });        
    } else {
        return message.react(`❔`);
    }
});

client.login(config.token);
