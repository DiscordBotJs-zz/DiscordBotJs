/*Copyright (C) 2020 DiscordBot.js

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.*/

// Only change these values if you are sure of what you are doing!

/*
Si vous utilisez Visual Studio Code.
Pour une meilleure lecture de l'open source, veuillez installer les extensions suivantes:
Todo + (https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-todo-plus)
*/

// NOTE Verification

// TODO Verification - Function - ModuleAvailable
function moduleAvailable(name) {
    try {
        return require.resolve(name);
    } catch (e) {}
    return false;
};

// TODO Verification - Constant - Configuration
const config = require("./config.js");
const guildConf = require('./config.json');
const PACKAGE = require('./package.json');

if (process.version.slice(1).split('.')[0] < 12) return console.error(`Node.js 12.0.0 ou plus récent est requis.\nVotre version de Node.js: ${process.version}\nNode.js: https://nodejs.org/`);

if (!moduleAvailable("discord.js")) return console.error("--> discord.js <-- n'est pas installé !\nNPM: https://www.npmjs.com/package/discord.js");
if (!moduleAvailable("parse-ms")) return console.error("--> parse-ms <-- n'est pas installé !\nNPM: https://www.npmjs.com/package/parse-ms");
if (!moduleAvailable("discord-leveling")) return console.error("--> discord-leveling <-- n'est pas installé !\nNPM: https://www.npmjs.com/package/discord-leveling");
if (!moduleAvailable("canvas")) return console.error("--> canvas <-- n'est pas installé !\nNPM: https://www.npmjs.com/package/canvas");
if (!moduleAvailable("quick.db")) return console.error("--> quick.db <-- n'est pas installé !\nNPM: https://www.npmjs.com/package/quick.db");
if (!moduleAvailable("long")) return console.error("--> long <-- n'est pas installé !\nNPM: https://www.npmjs.com/package/long");
if (!moduleAvailable("dblapi.js")) return console.error("--> dblapi.js <-- n'est pas installé !\nNPM: https://www.npmjs.com/package/dblapi.js");
if (!moduleAvailable("hastebin.js")) return console.error("--> hastebin.js <-- n'est pas installé !\nNPM: https://www.npmjs.com/package/hastebin.js");
if (!moduleAvailable("dotenv")) return console.error("--> dotenv <-- n'est pas installé !\nNPM: https://www.npmjs.com/package/dotenv");

if (!config.prefix) return console.error("Un prefix doit être définit !");
if (!config.TOKEN) return console.error("Le TOKEN du bot doit être définit !");
if (!config.TOPGGTOKEN) return console.error("Un TOKEN Top.gg doit être définit !");
/*
If you want to not include the top.gg api, please remove the lines:

if (!moduleAvailable("dblapi.js")) return console.error("--> dblapi.js <-- n'est pas installé !\nNPM: https://www.npmjs.com/package/dblapi.js");

if (!config.TOPGGTOKEN) return console.error("Un TOKEN Top.gg doit être définit !");

const DBL = require("dblapi.js");

const dbl = new DBL(config.TOPGGTOKEN, client);

await dbl.postStats(client.guilds.size); // Due to the dblapi.js api it is impossible to prevent an error related to TOKEN if it is not defined or correct!
	    setInterval(async () => {
		    await dbl.postStats(client.guilds.size);
	    }, 1800000);

dbl.on('posted', () => {
	dbl.getBot(client.user.id).then(bot => {
		console.log(`✔️ - Statistiques de ${bot.username}#${bot.discriminator} (${bot.id}) sur Top.gg (https://top.gg/bot/${bot.id}) mise à jour !`);
	});
});
*/
if (!config.colorembed) return console.error("Une couleur pour les embeds doit être définit !");
if (!config.picturewelcome) return console.error("Une image de bievenue doit être définit !");
if (!config.pictureleave) return console.error("Une image d'au revoir doit être définit !");

// NOTE Constant

// TODO Constant - Client
const {
    Client,
    MessageAttachment,
    Emoji,
    MessageReaction,
    MessageCollector,
    MessageEmbed,
    ShardingManager
} = require('discord.js');

const client = new Client({
    disableEveryone: true,
    disableMentions: 'everyone' // This disables any @everyone mention for the bot
});

// TODO Bot connection
client.login(config.TOKEN);

// TODO Constant - Dependencies included with Node.js
const fs = require("fs");
const wait = require('util').promisify(setTimeout);

// TODO Constant - Dependencies not included with Node.js
const ms = require('parse-ms');
const dl = require('discord-leveling');
const Canvas = require('canvas');
const db = require('quick.db');
const Long = require("long");
const DBL = require("dblapi.js");
const hastebin = require('hastebin.js');

// TODO Constant - Poll
const lastChar = (str) => str.split('').reverse().join(',').replace(',', '')[str.length === str.length + 1 ? 1 : 0];
const emojiList = ['✅', '❌'];
const emojiLetterList = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯', '🇰', '🇱', '🇲', '🇳', '🇴', '🇵', '🇶', '🇷', '🇸', '🇹', '🇺', '🇻', '🇼', '🇽', '🇾', '🇿'];

// TODO Constant - Top.gg API
const dbl = new DBL(config.TOPGGTOKEN, client);

// TODO Constant - Hastebin
const haste = new hastebin({ url: 'https://hasteb.in' });

// NOTE Require

// TODO Require - Included with Node.js
require('events').EventEmitter.defaultMaxListeners = 0;

// TODO Require - Not included with Node.js
require('dotenv').config();

// NOTE Variable

// TODO Variable - Embed Creator
let embedColor = undefined;
let embedTitle = undefined;
let embedTitleURL = undefined;
let embedDescription = undefined;
let embedThumbnail = undefined;
let embedPicture = undefined;
let embedAuthor = undefined;
let embedAuthorPicture = undefined;
let embedAuthorURL = undefined;
let embedTime = undefined;
let embedFooter = undefined;
let embedFooterPicture = undefined;
/*
let embedAddFieldName = undefined;
let embedAddFieldValue = undefined;
let embedAddFieldInline = undefined;
*/

// TODO Variable - News
let newsEmbedDescription = undefined;
let newsEmbedThumbnail = undefined;
let newsEmbedPicture = undefined;

// TODO Variable - Others
let logsName = "📄logs";
let newsName = "actualités-discordbotjs";
let welcomeName = "🎉accueil";

// NOTE Functions

// TODO Functions - DefaultChannel
const getDefaultChannel = (guild) => {
    const generalChannel = guild.channels.cache.find(channel => channel.name === welcomeName);
    if (guild.channels.cache.has(guild.id)) return guild.channels.cache.get(guild.id);
    if (guild.systemChannel) return guild.systemChannel;
    if (generalChannel) return generalChannel;
    return guild.channels.cache
        .filter(c => c.type === "text" &&
            c.permissionsFor(guild.client.user.cache).has("SEND_MESSAGES"))
        .sort((a, b) => a.position - b.position ||
            Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber())
        .first();
};

// TODO Functions - DateConverter
function dateConverter(timestamp) {
    let a = new Date(timestamp);
    let monthlist = [`Janvier`, `Février`, `Mars`, `Avril`, `Mai`, `Juin`, `Juillet`, `Août`, `Septembre`, `Octobre`, `Novembre`, `Décembre`];
    let year = a.getFullYear();
    let month = monthlist[a.getMonth()];
    let day = a.getDate();
    let hour = a.getHours();
    if (hour < 10) {
        hour = `0${a.getHours()}`;
    };
    let min = a.getMinutes();
    if (min < 10) {
        min = `0${a.getMinutes()}`;
    };
    let sec = a.getSeconds();
    if (sec < 10) {
        sec = `0${a.getSeconds()}`;
    };
    let time = `${day} ${month} ${year} à ${hour}h${min}:${sec}`;
    return time;
};

// TODO Functions - TimeConverter1
function timeConverter1(cooldownTime) {
    const Days = Math.floor(cooldownTime / (60 * 60 * 24));
    const Hour = Math.floor((cooldownTime % (60 * 60 * 24)) / (60 * 60));
    const Minutes = Math.floor(((cooldownTime % (60 * 60 * 24)) % (60 * 60)) / 60);
    const Seconds = Math.floor(((cooldownTime % (60 * 60 * 24)) % (60 * 60)) % 60);
    let cooldownformat;
    if (Days > 0) {
        cooldownformat = `${Days}j`;
    }
    if (Hour > 0) {
        cooldownformat = `${Hour}h`;
    }
    if (Minutes > 0) {
        cooldownformat = `${Minutes}m`;
    }
    if (Seconds > 0) {
        cooldownformat = `${Seconds}s`;
    }
    return cooldownformat;
};

// TODO Functions - TimeConverter2
function timeConverter2(cooldownTime, cooldownUnity) {
    const Days = Math.floor(cooldownTime * 86400000);
    const Hour = Math.floor(cooldownTime * 3600000);
    const Minutes = Math.floor(cooldownTime * 60000);
    const Seconds = Math.floor(cooldownTime * 1000);
    let cooldownformat;
    if (cooldownUnity == 'jour'){
        cooldownformat = `${Days}`;
    }
    if (cooldownUnity == 'heure') {
        cooldownformat = `${Hour}`;
    }
    if (cooldownUnity == 'minute') {
        cooldownformat = `${Minutes}`;
    }
    if (cooldownUnity == 'seconde') {
        cooldownformat = `${Seconds}`;
    }
    return cooldownformat;
};

// TODO Functions - Sleep
function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    });
};

// NOTE Events

// TODO Events - Ready
client.on('ready', async () => {
    try {
        wait(1000);
        client.user.setActivity(`Mon prefix est ${config.prefix}`, {
            type: "WATCHING"
        });
        let activities = [`Faites ${config.prefix}news pour avoir les actualités de DiscordBot.js`, `Faites ${config.prefix}canary pour inviter DiscordBot.js Canary dans vos serveurs`, `La nouvelle version ${PACKAGE.version} de DiscordBot.js est disponible !`], i = 0;
        setInterval(() => client.user.setActivity(`Mon prefix est ${config.prefix} | ${activities[i++ % activities.length]}`, {
            type: "WATCHING"
        }), 15000)
        client.user.setStatus("online"); // 💬 - This defines the status of the bot as connected.
        console.log(`✔️ - Connecté en tant que ${client.user.tag} (${client.user.id})`);
        console.log(`👥 - Liste des serveurs:`);
        await client.guilds.cache.forEach(async (guild) => {
            console.log(`📰 - ${guild.name} (${guild.id})`);
            if (!guildConf[guild.id]) {
                guildConf[guild.id] = {
                    prefix: config.prefix,
                    logs: true,
                    news: false,
                }
            }; // 💬 - This is triggered if the database does not detect data from the server.
            fs.writeFile('./config.json', JSON.stringify(guildConf, null, 2), (err) => {
                if (err) return console.error(`❌ - La base de donnée a rencontré une erreur !\n`, err); // 📕 - If this is triggered, the database has encountered an error!
            }); // 💬 - This allows you to create or update the database.
        });
        await dbl.postStats(client.guilds.size); // Due to the dblapi.js api it is impossible to prevent an error related to TOKEN if it is not defined or correct!
	    setInterval(async () => {
		    await dbl.postStats(client.guilds.size);
	    }, 1800000);
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur  !\n`, err);
    };
});

// TODO Events - GuildCreate
client.on('guildCreate', (guild) => {
    try {
        if (!guildConf[guild.id]) {
            guildConf[guild.id] = {
                prefix: config.prefix,
                logs: config.logs,
            }
        }; // 💬 - This is triggered if the database does not detect data from the server.
        fs.writeFile('./config.json', JSON.stringify(guildConf, null, 2), (err) => {
            if (err) return console.error(`❌ - La base de donnée a rencontré une erreur !\n`, err); // 📕 - If this is triggered, the database has encountered an error!
        }); // 💬 - This allows you to create or update the database.
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${guild.name} (${guild.id}) !\n`, err);
    };
});

// TODO Events - GuildDelete
client.on('guildDelete', (guild) => {
    try {
        delete guildConf[guild.id]; // 💬 - This removes a server from the database.
        fs.writeFile('./config.json', JSON.stringify(guildConf, null, 2), (err) => {
            if (err) return console.error(`❌ - La base de donnée a rencontré une erreur !\n`, err); // 📕 - If this is triggered, the database has encountered an error!
        }); // 💬 - This allows you to create or update the database.
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${guild.name} (${guild.id}) !\n`, err);
    };
});

// TODO Events - Debug
client.on("debug", function (info) {
    console.info(`🌐 - Débogage -> ${info}`);
}); // 📘 - When this event occurs it sends information about debugging.

// TODO Events - Warn
client.on("warn", function (info) {
    console.warn(`⚠️ - ${client.user.username} (${client.user.id}) a détecté un problème: ${info}`);
}); // 📙 - When this event is triggered it means that the bot has detected a problem.

// TODO Events - Error
client.on("error", function (error) {
    console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur: ${error}`);
}); // 📕 - When this event is triggered it means that the bot has encountered an error!

// TODO Events - Resume
client.on("resume", function (replayed) {
    console.info(`▶️ - La connexion de ${client.user.username} (${client.user.id}) à l'api a repris (${replayed})`);
}); // 📗 - When this event is triggered it means that the bot has resumed the connection to the discord.js API.

// TODO Events - Reconnecting
client.on("reconnecting", function () {
    console.info(`🔁 - ${client.user.username} (${client.user.id}) tente de se reconnecté...`);
}); // 📘 - When this event is triggered it means that the bot is trying to reconnect to the discord.js API.

// TODO Events - Disconnect
client.on("disconnect", function () {
    console.error(`✖️ - ${client.user.username} (${client.user.id}) est déconnecté.`);
}); // 📕 - When this event is triggered it means that the bot is offline!

// TODO Events - UnhandledRejection
process.on('unhandledRejection', error => console.error(`❌ - Le bot a rencontré une erreur !\n`, error)); // ⚠️ - If this triggers please let us know!

// TODO Events - GuildMemberAdd
client.on('guildMemberAdd', async member => {
    try {
        if (member.guild.id === "264445053596991498") return;
        const application = await client.fetchApplication()
        const channel = getDefaultChannel(member.guild)
        const name = member.displayName.length > 20 ? member.displayName.substring(0, 20) + "..." : member.displayName;
        const server = member.guild.name.length > 11 ? member.guild.name.substring(0, 11) + "..." : member.guild.name;
        const memberCount = member.guild.memberCount.length > 16 ? member.guild.memberCount.substring(0, 16) + "..." : member.guild.memberCount;
        const canvas = Canvas.createCanvas(700, 250);
        const ctx = canvas.getContext('2d');

        const background = await Canvas.loadImage(`${config.picturewelcome}`);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#74037b';
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        ctx.font = '26px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`Bienvenue dans ${server},`, canvas.width / 2.5, canvas.height / 3.5);

        ctx.font = '26px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${name}#${member.user.discriminator}`, canvas.width / 2.5, canvas.height / 1.8);

        ctx.font = '26px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`On est ${memberCount} membres !`, canvas.width / 2.5, canvas.height / 1.2);

        ctx.beginPath();
        ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        const avatar = await Canvas.loadImage(member.user.displayAvatarURL({
            format: 'png'
        }));
        ctx.drawImage(avatar, 25, 25, 200, 200);

        const attachment = new MessageAttachment(canvas.toBuffer(), 'welcome.png');

        let message_aléatoire = Math.round(Math.random() * 45);
        if (message_aléatoire == 0) {
            message_aléatoire = `Bienvenue ${member}. ${client.user} t'accueil avec enthousiasme !`;
        };
        if (message_aléatoire == 1) {
            message_aléatoire = `Hello, mon chou ! ${member} est arrivé(e) !`;
        };
        if (message_aléatoire == 2) {
            message_aléatoire = `${member} a rejoint le serveur. Restez un instant et écoutez-moi.`;
        };
        if (message_aléatoire == 3) {
            message_aléatoire = `${member} vient de se glisser dans le serveur.`;
        };
        if (message_aléatoire == 4) {
            message_aléatoire = `Je n'abandonnerai jamais ${member}. Je ne laisserai jamais tomber ${member}.`;
        };
        if (message_aléatoire == 5) {
            message_aléatoire = `${member} a rejoint votre fine équipe.`;
        };
        if (message_aléatoire == 6) {
            message_aléatoire = `${member} vient de rejoindre le serveur... enfin, je crois !`;
        };
        if (message_aléatoire == 7) {
            message_aléatoire = `Bienvenue ${member}. Laissez vos armes près de la porte.`;
        };
        if (message_aléatoire == 8) {
            message_aléatoire = `${member} vient d'arriver. Tenez ma bière.`;
        };
        if (message_aléatoire == 9) {
            message_aléatoire = `Son altesse ${member} est arrivée !`;
        };
        if (message_aléatoire == 10) {
            message_aléatoire = `J'me présente, je m'appelle ${member}.`;
        };
        if (message_aléatoire == 11) {
            message_aléatoire = `${member} est arrivé(e). La fête est finie.`;
        };
        if (message_aléatoire == 12) {
            message_aléatoire = `${member} a rejoint le serveur ! C'est super efficace !`;
        };
        if (message_aléatoire == 13) {
            message_aléatoire = `C'est un oiseau ! C'est un avion ! Ha, non, c'est juste ${member}.`;
        };
        if (message_aléatoire == 14) {
            message_aléatoire = `${member} vient d'arriver. Il est trop OP - nerf plz.`;
        };
        if (message_aléatoire == 15) {
            message_aléatoire = `Oh mon dieu ! C'est ${member} ! Nous sommes sauvés !`;
        };
        if (message_aléatoire == 16) {
            message_aléatoire = `Bienvenue, ${member}. On espère que vous avez apporté de la pizza.`;
        };
        if (message_aléatoire == 17) {
            message_aléatoire = `${member} vient de rejoindre le serveur. Tout le monde, faites semblant d'être occupés !`;
        };
        if (message_aléatoire == 18) {
            message_aléatoire = `${member} a bondi dans le serveur. Un vrai petit kangourou !`;
        };
        if (message_aléatoire == 19) {
            message_aléatoire = `Un ${member} sauvage apparaît.`;
        };
        if (message_aléatoire == 20) {
            message_aléatoire = `Joueur ${member} prêt.`;
        };
        if (message_aléatoire == 21) {
            message_aléatoire = `Hé ! Écoutez ! ${member}. nous a rejoint !`;
        };
        if (message_aléatoire == 22) {
            message_aléatoire = `${member} vient de rejoindre le serveur. Besoin de soins, s'il vous plaît !`;
        };
        if (message_aléatoire == 23) {
            message_aléatoire = `Un ${member} est apparu dans le serveur.`;
        };
        if (message_aléatoire == 24) {
            message_aléatoire = `${member} vient de prendre place dans le bus de combat.`;
        };
        if (message_aléatoire == 25) {
            message_aléatoire = `Voici ${member} ! Loué soit le Soleil ! \[T]/`;
        };
        if (message_aléatoire == 26) {
            message_aléatoire = `Tenez-vous bien. ${member} a rejoint le serveur.`;
        };
        if (message_aléatoire == 27) {
            message_aléatoire = `C'est dangereux d'y aller seul, emmenez ${member} !`;
        };
        if (message_aléatoire == 28) {
            message_aléatoire = `Bienvenue, ${member}. Nous vous attendions ( ͡° ͜ʖ ͡°)`;
        };
        if (message_aléatoire == 29) {
            message_aléatoire = `Challenger en approche - ${member} est apparu(e) !`;
        };
        if (message_aléatoire == 30) {
            message_aléatoire = `Où est ${member} ? Dans le serveur !`;
        };
        if (message_aléatoire == 31) {
            message_aléatoire = `Les roses sont rouges, les violettes sont bleues. ${member} a rejoint ce lieu.`;
        };
        if (message_aléatoire == 32) {
            message_aléatoire = `Swoooosh. ${member} vient juste d'atterrir.`;
        };
        if (message_aléatoire == 33) {
            message_aléatoire = `${member} est ici pour botter des fesses et mâcher du chewing-gum. Et ${member} est à court de chewing-gum.`;
        };
        if (message_aléatoire == 34) {
            message_aléatoire = `Never gonna give ${member} up. Never gonna let ${member} down.`;
        };
        if (message_aléatoire == 35) {
            message_aléatoire = `Attention ${member} vient d'arriver. Restez tous chez vous !`;
        };
        if (message_aléatoire == 36) {
            message_aléatoire = `${member} vient de rejoindre le serveur - glhf !`;
        };
        if (message_aléatoire == 37) {
            message_aléatoire = `Bienvenue, ${member}. Restez un instant et écoutez-moi.`;
        };
        if (message_aléatoire == 38) {
            message_aléatoire = `Bonjour, je suis ${member} et je me présente...`;
        };
        if (message_aléatoire == 39) {
            message_aléatoire = `Une erreur c'est produite ! ${member} vient d'arriver.`;
        };
        if (message_aléatoire == 40) {
            message_aléatoire = `${member} viens vers ${member.guild.name}. ${member.guild.name} lui dit : on se connaît ?`;
        };
        if (message_aléatoire == 41) {
            message_aléatoire = `${member} vient d'arriver. Ta Ta  Ta Da Da`;
        };
        if (message_aléatoire == 42) {
            message_aléatoire = `Ouais une notif Discord ! Ha, non, ${member} à rejoint le serveur. c'est trop cool !!!`;
        };
        if (message_aléatoire == 43) {
            message_aléatoire = `Qu'est ce qui se passe ? ${member} vient d'arriver. Tous à terre !`;
        };
        if (message_aléatoire == 44) {
            message_aléatoire = `T'as vu ${member} par hasard ? Ouais je l'ai vu, il est là-bas.`;
        };
        if (message_aléatoire == 45) {
            message_aléatoire = `Alors comme ça ${member} on dis pas bonjour/bonsoir ?`;
        };
        let message_bienvenue_aléatoire = message_aléatoire;

        if (member.id === application.owner.id) {
            message_bienvenue_aléatoire = `Oh mon dieu ! ${member} Le créateur de ${client.user} a rejoint ${member.guild.name} !`;
        };

        channel.send(`${message_bienvenue_aléatoire}`, attachment);
        console.log(`${member.user.username} est arrivés dans ${member.guild.name} (${member.guild.id})`);
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${member.guild.name} (${member.guild.id}) !\n`, err);
    };
});

// TODO Events - GuildMemberRemove
client.on("guildMemberRemove", async member => {
    try {
        if (member.guild.id === "264445053596991498") return;
        const application = await client.fetchApplication()
        const channel = getDefaultChannel(member.guild)
        const name = member.displayName.length > 13 ? member.displayName.substring(0, 13) + "..." : member.displayName;
        const server = member.guild.name.length > 21 ? member.guild.name.substring(0, 21) + "..." : member.guild.name;
        const memberCount = member.guild.memberCount.length > 8 ? member.guild.memberCount.substring(0, 8) + "..." : member.guild.memberCount;
        const canvas = Canvas.createCanvas(700, 250);
        const ctx = canvas.getContext('2d');

        const background = await Canvas.loadImage(`${config.pictureleave}`);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#74037b';
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        ctx.font = '26px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${name}#${member.user.discriminator} a quitté\n${server}`, canvas.width / 2.5, canvas.height / 2.5);

        ctx.font = '26px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`On est ${memberCount} membres !`, canvas.width / 2.5, canvas.height / 1.2);

        ctx.beginPath();
        ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        const avatar = await Canvas.loadImage(member.user.displayAvatarURL({
            format: 'png'
        }));
        ctx.drawImage(avatar, 25, 25, 200, 200);

        const attachment = new MessageAttachment(canvas.toBuffer(), 'leave.png');
        if (member.id === application.owner.id) {
            channel.send(`Oh non :sob: ${member} Le créateur de ${client.user} a quitté ${member.guild.name} !`, attachment);
        } else if (member.id !== application.owner.id) {
            channel.send(attachment);
        };
        console.log(`${member.user.username} a quitté ${member.guild.name} (${member.guild.id})`);
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${member.guild.name} (${member.guild.id}) !\n`, err);
    };
});

// TODO Events - Message
client.on("message", async message => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    try {
        if (message.guild.id === "264445053596991498") return;
        let profile = await dl.Fetch(message.author.id);
        const randomAmountOfXp = Math.floor(Math.random() * 29) + 1;
        dl.AddXp(message.author.id, randomAmountOfXp)
        if(profile.xp >= 500) {
            await dl.AddLevel(message.author.id, 1)
            await dl.SetXp(message.author.id, 0)
            const embednewlvl = new MessageEmbed()
                .setColor(`${config.colorembed}`)
                .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                    dynamic: true
                }) || "")
                .setTitle('Xp Nouveau Niveaux !')
                .addField(`Niveaux`, `${profile.level}`)
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL({
                    dynamic: true
                }));
            message.channel.send(embednewlvl)
        }
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
});

// TODO Events - MessageDelete
client.on('messageDelete', async message => {
    try {
        if (message.guild.id === "264445053596991498") return;
        if(guildConf[message.guild.id].logs == "false") {
            return console.log(`Les logs sont désactivés dans le serveur ${message.guild.name} (${message.guild.id}) !`);
        } else if (guildConf[message.guild.id].logs == "true") {
            if(message.author.bot === true) return;
            if(message.content === "" || undefined) message.content = "Visualisation Impossible";
            let logs = await message.guild.fetchAuditLogs({type: 62});
            let entry = logs.entries.first();
            const embed = new MessageEmbed()
                .setColor(`${config.colorembed}`)
                .setAuthor(`${entry.executor.tag} (${entry.executor.id})`, entry.executor.displayAvatarURL({
                    dynamic: true
                }) || "")
                .setTitle('Logs - Message supprimé')
                .addField("Message", `${message.content.replace(/`/g,"'")}`)
                .addField("ID du Message", `${message.id}`)
                .addField("Auteur", `${message.member.user}`)
                .addField("ID de l'Auteur", `${message.member.user.id}`)
                .addField("Salon", `${message.channel}`)
                .addField("ID du Salon", `${message.channel.id}`)
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL({
                    dynamic: true
                }));
            const LogsChannel = message.guild.channels.cache.find(channel => channel.name === logsName);
            const LogsChannelID = message.guild.channels.cache.get(guildConf[message.guild.id].logs_channel)
            if (LogsChannel) {
                LogsChannel.send(embed);
            } else if (!LogsChannel) {
                if (!LogsChannelID) return console.log("Impossible de trouver le salon Logs !");
                LogsChannelID.send(embed);
            };
        };
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
});

// TODO Events - MessageUpdate
client.on('messageUpdate', async (oldMessage,newMessage) => {
    try {
        if (oldMessage.guild.id === "264445053596991498") return;
        if(guildConf[oldMessage.guild.id].logs == "false") {
            return console.log(`Les logs sont désactivés dans le serveur ${oldMessage.guild.name} (${oldMessage.guild.id}) !`);
        } else if(guildConf[oldMessage.guild.id].logs == "true") {
        if(oldMessage.author.bot === true) return;
        if(oldMessage.content === "" || undefined) oldMessage.content = "Visualisation Impossible";
        if(newMessage.content === "" || undefined) newMessage.content = "Visualisation Impossible";
        const embed = new MessageEmbed()
            .setColor(`${config.colorembed}`)
            .setAuthor(`${oldMessage.author.tag} (${oldMessage.author.id})`, oldMessage.author.displayAvatarURL({
                dynamic: true
            }) || "")
            .setTitle('Logs - Message édité')
            .addField("Nouveau message", `${newMessage.content.replace(/`/g,"'")}`)
            .addField("Ancien message", `${oldMessage.content.replace(/`/g,"'")}`)
            .addField("ID du message", `${oldMessage.id}`)
            .addField("Salon", `${newMessage.channel}`)
            .addField("ID du salon", `${newMessage.channel.id}`)
            .setTimestamp()
            .setFooter(client.user.tag, client.user.displayAvatarURL({
                dynamic: true
            }));
        const LogsChannel = oldMessage.guild.channels.cache.find(channel => channel.name === logsName);
        const LogsChannelID = oldMessage.guild.channels.cache.get(guildConf[oldMessage.guild.id].logs_channel)
        if (LogsChannel) {
            LogsChannel.send(embed);
        } else if (!LogsChannel) {
            if (!LogsChannelID) return console.log("Impossible de trouver le salon Logs !");
            LogsChannelID.send(embed);
        };
        };
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur !\n`, err);
    };
});

// TODO Events - ChannelCreate
client.on('channelCreate', async (channel) => {
    try {
        if (channel.guild.id === "264445053596991498") return;
        if(guildConf[channel.guild.id].logs == "false") {
            return console.log(`Les logs sont désactivés dans le serveur ${channel.guild.name} (${channel.guild.id}) !`);
        } else if(guildConf[channel.guild.id].logs == "true") {
        const channelTypes = {
            dm: 'Message privés',
            group: 'Groupe privés',
            text: 'Salon textuel',
            voice: 'Salon vocal',
            category: 'Catégorie',
            unknown: 'Inconnue',
        };
        let logs = await channel.guild.fetchAuditLogs({type: 10});
        let entry = logs.entries.first();
        const embed = new MessageEmbed()
            .setColor(`${config.colorembed}`)
            .setAuthor(`${entry.executor.tag} (${entry.executor.id})`, entry.executor.displayAvatarURL({
                dynamic: true
            }) || "")
            .setTitle('Logs - Salon ajouté')
            .addField("Nom du salon", channel.type === 'dm' ? `${channel}` : channel.name)
            .addField("ID", channel.id)
            .addField("Crée le", dateConverter(channel.createdAt))
            .addField("NSFW ?", channel.nsfw ? 'Oui' : 'Non')
            .addField("Catégories", channel.parent ? channel.parent.name : 'Aucun')
            .addField("Type", channelTypes[channel.type])
            .setTimestamp()
            .setFooter(client.user.tag, client.user.displayAvatarURL({
                dynamic: true
            }));
        const LogsChannel = channel.guild.channels.cache.find(channel => channel.name === logsName);
        const LogsChannelID = channel.guild.channels.cache.get(guildConf[channel.guild.id].logs_channel)
        if (LogsChannel) {
            LogsChannel.send(embed);
        } else if (!LogsChannel) {
            if (!LogsChannelID) return console.log("Impossible de trouver le salon Logs !");
            LogsChannelID.send(embed);
        };
        };
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur !\n`, err);
    };
});

// TODO Events - ChannelDelete
client.on('channelDelete', async (channel) => {
    try {
        if (channel.guild.id === "264445053596991498") return;
        if(guildConf[channel.guild.id].logs == "false") {
            return console.log(`Les logs sont désactivés dans le serveur ${channel.guild.name} (${channel.guild.id}) !`);
        } else if(guildConf[channel.guild.id].logs == "true") {
        const channelTypes = {
            dm: 'Message privés',
            group: 'Groupe privés',
            text: 'Salon textuel',
            voice: 'Salon vocal',
            category: 'Catégorie',
            unknown: 'Inconnue',
        };
        let logs = await channel.guild.fetchAuditLogs({type: 12});
        let entry = logs.entries.first();
        const embed = new MessageEmbed()
            .setColor(`${config.colorembed}`)
            .setAuthor(`${entry.executor.tag} (${entry.executor.id})`, entry.executor.displayAvatarURL({
                dynamic: true
            }) || "")
            .setTitle('Logs - Salon supprimé')
            .addField("Nom du salon", channel.type === 'dm' ? `${channel}` : channel.name)
            .addField("ID du salon", channel.id)
            .addField("Crée le", dateConverter(channel.createdAt))
            .addField("NSFW ?", channel.nsfw ? 'Oui' : 'Non')
            .addField("Catégories", channel.parent ? channel.parent.name : 'Aucun')
            .addField("Type", channelTypes[channel.type])
            .addField("Topic", channel.topic || "Aucun")
            .setTimestamp()
            .setFooter(client.user.tag, client.user.displayAvatarURL({
                dynamic: true
            }));
        const LogsChannel = channel.guild.channels.cache.find(channel => channel.name === logsName);
        const LogsChannelID = channel.guild.channels.cache.get(guildConf[channel.guild.id].logs_channel)
        if (LogsChannel) {
            LogsChannel.send(embed);
        } else if (!LogsChannel) {
            if (!LogsChannelID) return console.log("Impossible de trouver le salon Logs !");
            LogsChannelID.send(embed);
        };
        };
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${channel.guild.name} (${channel.guild.id}) !\n`, err);
    };
});

// TODO Events - GuildBanAdd
client.on("guildBanAdd", async (banguild, banuser) => {
    try {
        if (banguild.id === "264445053596991498") return;
        if(guildConf[banguild.id].logs == "false") {
            return console.log(`Les logs sont désactivés dans le serveur ${banguild.name} (${banguild.id}) !`);
        } else if(guildConf[banguild.id].logs == "true") {
        const LogsChannel = banguild.channels.cache.find(channel => channel.name === logsName);
        const LogsChannelID = banguild.channels.cache.get(guildConf[banguild.id].logs_channel);
        let logs = await banguild.fetchAuditLogs({type: 22});
        let entry = logs.entries.first();
        const embed = new MessageEmbed()
            .setColor(`${config.colorembed}`)
            .setAuthor(`${entry.executor.tag} (${entry.executor.id})`, entry.executor.displayAvatarURL({
                dynamic: true
            }) || "")
            .setTitle('Logs - Membre banni')
            .addField("Membre", `${banuser}`)
            .addField("ID du membre", `${banuser.id}`)
            .addField("Raison", entry.reason || "Aucune raison")
            .setTimestamp()
            .setFooter(client.user.tag, client.user.displayAvatarURL({
                dynamic: true
            }));

        const embed_banadd = new MessageEmbed()
            .setColor(`${config.colorembed}`)
            .setAuthor(`${entry.executor.tag} (${entry.executor.id})`, entry.executor.displayAvatarURL({
                dynamic: true
            }) || "")
            .setTitle('Vous avez était banni !')
            .addField("Serveur", `${banguild.name}`)
            .addField("Serveur ID", `${banguild.id}`)
            .addField("Raison", entry.reason || "Aucune raison")
            .setTimestamp()
            .setFooter(client.user.tag, client.user.displayAvatarURL({
                dynamic: true
            }));

        if (LogsChannel) {
            LogsChannel.send(embed);
        } else if (!LogsChannel) {
            if (!LogsChannelID) return console.log("Impossible de trouver le salon Logs !");
            LogsChannelID.send(embed);
        };
        banuser.send(embed_banadd);
        };
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${banguild.name} (${banguild.id}) !\n`, err);
    };
});

// TODO Events - GuildBanRemove
client.on("guildBanRemove", async (banguild, banuser) => {
    try {
        if (banguild.id === "264445053596991498") return;
        if(guildConf[banguild.id].logs == "false") {
            return console.log(`Les logs sont désactivés dans le serveur ${banguild.name} (${banguild.id}) !`);
        } else if(guildConf[banguild.id].logs == "true") {
        const LogsChannel = banguild.channels.cache.find(channel => channel.name === logsName);
        const LogsChannelID = banguild.channels.cache.get(guildConf[banguild.id].logs_channel)
        let logs = await banguild.fetchAuditLogs({type: 23});
        let entry = logs.entries.first();
        const embed = new MessageEmbed()
            .setColor(`${config.colorembed}`)
            .setAuthor(`${entry.executor.tag} (${entry.executor.id})`, entry.executor.displayAvatarURL({
                dynamic: true
            }) || "")
            .setTitle('Logs - Membre débanni')
            .addField("Membre", `${banuser}`)
            .addField("ID du Membre", `${banuser.id}`)
            .addField("Raison", entry.reason || "Aucune raison")
            .setTimestamp()
            .setFooter(client.user.tag, client.user.displayAvatarURL({
                dynamic: true
            }));

        const embed_banremove = new MessageEmbed()
            .setColor(`${config.colorembed}`)
            .setAuthor(`${entry.executor.tag} (${entry.executor.id})`, entry.executor.displayAvatarURL({
                dynamic: true
            }) || "")
            .setTitle('Vous avez était débanni !')
            .addField("Serveur", `${banguild.name}`)
            .addField("Serveur ID", `${banguild.id}`)
            .addField("Raison", entry.reason || "Aucune raison")
            .setTimestamp()
            .setFooter(client.user.tag, client.user.displayAvatarURL({
                dynamic: true
            }));

        if (LogsChannel) {
            LogsChannel.send(embed);
        } else if (!LogsChannel) {
            if (!LogsChannelID) return console.log("Impossible de trouver le salon Logs !");
            LogsChannelID.send(embed);
        };
        banuser.send(embed_banremove);
        };
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${banguild.name} (${banguild.id}) !\n`, err);
    };
});

// TODO Events - GuildMemberUpdate
client.on('guildMemberUpdate', (oldMember, newMember) => {
    try {
        if (oldMember.guild.id === "264445053596991498") return;
        if(guildConf[oldMember.guild.id].logs == "false") {
            return console.log(`Les logs sont désactivés dans le serveur ${oldMember.guild.name} (${oldMember.guild.id}) !`);
        } else if(guildConf[oldMember.guild.id].logs == "true") {
        const LogsChannel = oldMember.guild.channels.cache.find(channel => channel.name === logsName);
        const LogsChannelID = oldMember.guild.channels.cache.get(guildConf[oldMember.guild.id].logs_channel);
        if (oldMember.nickname != newMember.nickname) {
        const embed1 = new MessageEmbed()
            .setColor(`${config.colorembed}`)
            .setTitle('Logs - Pseudo d\'un(e) membre mise à jour')
            .addField("Nouveau Pseudo", `${newMember}`)
            .addField("Ancien Pseudo", `${oldMember.nickname || oldMember.user.tag}`)
            .addField("Pseudo ID", `${oldMember.user.id}`)
            .setTimestamp()
            .setFooter(client.user.tag, client.user.displayAvatarURL({
                dynamic: true
            }));
        if (LogsChannel) {
            LogsChannel.send(embed1);
        } else if (!LogsChannel) {
            if (!LogsChannelID) return console.log("Impossible de trouver le salon Logs !");
            LogsChannelID.send(embed1);
        };
        };

        let addedRoles = [];
        let removedRoles = [];

        newMember.roles.cache.forEach(roleadd => {
            if (!oldMember.roles.cache.has(roleadd.id)) addedRoles.push(roleadd);
        });

        oldMember.roles.cache.forEach(roleremove => {
            if (!newMember.roles.cache.has(roleremove.id)) removedRoles.push(roleremove.name);
        });

        if (addedRoles.join(' ').length !== 0 || removedRoles.join(' ').length !== 0) {
        const embed2 = new MessageEmbed()
            .setColor(`${config.colorembed}`)
            .setTitle('Logs - Rôles d\'un(e) membre mise à jour')
            .addField("Membre", `${newMember.user}`)
            .addField("Membre ID", `${newMember.user.id}`)
            if (addedRoles.join(' ').length !== 0) {
                embed2.addField("Rôle ajouté(s)", `${addedRoles.join('**,** ') || "\'Aucun\'"}`)
            }
            if (removedRoles.join(' ').length !== 0) {
                embed2.addField("Rôle enlevé(s)", `${removedRoles.join('**,** ') || "Aucun"}`)
            }
            embed2.setTimestamp()
            embed2.setFooter(client.user.tag, client.user.displayAvatarURL({
                dynamic: true
            }));
        if (LogsChannel) {
            LogsChannel.send(embed2);
        } else if (!LogsChannel) {
            if (!LogsChannelID) return console.log("Impossible de trouver le salon Logs !");
            LogsChannelID.send(embed2);
        };
        };
    };
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${oldMember.guild.name} (${oldMember.guild.id}) !\n`, err);
    };
});

// TODO Events - VoiceStateUpdate
client.on('voiceStateUpdate', async (oldState, newState) => {
    try {
        if (oldState.guild.id === "264445053596991498") return;
        if(guildConf[oldState.guild.id].logs == "false") {
            return console.log(`Les logs sont désactivés dans le serveur ${oldState.guild.name} (${oldState.guild.id}) !`);
        } else if(guildConf[oldState.guild.id].logs == "true") {
        const LogsChannel = oldState.guild.channels.cache.find(channel => channel.name === logsName);
        const LogsChannelID = oldState.guild.channels.cache.get(guildConf[oldState.guild.id].logs_channel);
        let logsQuit = await oldState.guild.fetchAuditLogs({type: 27});
        let entryQuit = logsQuit.entries.first(); // QUIT

        let logsMove = await oldState.guild.fetchAuditLogs({type: 26});
        let entryMove = logsMove.entries.first(); // MOVE ???

        if (!oldState.channelID && newState.channelID) {
            const embed1 = new MessageEmbed()
                .setColor(`${config.colorembed}`)
                .setAuthor(`${newState.member.user.tag} (${newState.member.id})`, newState.member.user.displayAvatarURL({
                    dynamic: true
                }) || "")
                .setTitle('Logs Membre à rejoint un salon vocal')
                .addField("Salon vocal", `${newState.channel.name}`)
                .addField("Salon vocal ID", `${newState.channelID}`)
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL({
                    dynamic: true
                }));
            if (LogsChannel) {
                LogsChannel.send(embed1);
            } else if (!LogsChannel) {
                if (!LogsChannelID) return console.log("Impossible de trouver le salon Logs !");
                LogsChannelID.send(embed1);
            };
        }

        if (oldState.channelID && newState.channelID) {
            if (oldState.channelID != newState.channelID) {
            const embed3 = new MessageEmbed()
                .setColor(`${config.colorembed}`)
                /*.setAuthor(`${entryMove.executor.tag} (${entryMove.executor.id})`, entryMove.executor.displayAvatarURL({
                    dynamic: true
                }) || "")*/
                .setTitle('Logs Membre à changé de salon vocal')
                .addField("Membre", `${newState.member}`)
                .addField("Membre ID", `${newState.member.id}`)
                .addField("Nouveau salon vocal", `${newState.channel.name}`)
                .addField("Nouveau salon vocal ID", `${newState.channelID}`)
                .addField("Ancien salon vocal", `${oldState.channel.name}`)
                .addField("Ancien salon vocal ID", `${oldState.channelID}`)
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL({
                    dynamic: true
                }));
            if (LogsChannel) {
                LogsChannel.send(embed3);
            } else if (!LogsChannel) {
                if (!LogsChannelID) return console.log("Impossible de trouver le salon Logs !");
                LogsChannelID.send(embed3);
            };
            };
        }

        if (oldState.channelID && !newState.channelID) {
            const embed2 = new MessageEmbed()
                .setColor(`${config.colorembed}`)
                .setAuthor(`${entryQuit.executor.tag} (${entryQuit.executor.id})`, entryQuit.executor.displayAvatarURL({
                    dynamic: true
                }) || "")
                .setTitle('Logs Membre à quitté un salon vocal')
                .addField("Membre", `${newState.member}`)
                .addField("Membre ID", `${newState.member.id}`)
                .addField("Salon vocal", `${oldState.channel.name}`)
                .addField("Salon vocal ID", `${oldState.channelID}`)
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL({
                    dynamic: true
                }));
            if (LogsChannel) {
                LogsChannel.send(embed2);
            } else if (!LogsChannel) {
                if (!LogsChannelID) return console.log("Impossible de trouver le salon Logs !");
                LogsChannelID.send(embed2);
            };
        }
        }
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${oldState.guild.name} (${oldState.guild.id}) !\n`, err);
    };
});

// TODO Events - Posted
dbl.on('posted', () => {
	dbl.getBot(client.user.id).then(bot => {
		console.log(`✔️ - Statistiques de ${bot.username}#${bot.discriminator} (${bot.id}) sur Top.gg (https://top.gg/bot/${bot.id}) mise à jour !`);
	});
});

// NOTE Commands

// TODO Commands - Join
client.on('message', async message => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const application = await client.fetchApplication()
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if (command === "join") {
        if (message.author.id !== application.owner.id) return message.reply("Désolé, Vous n'avez pas les permissions !")
        client.emit('guildMemberAdd', message.member || await message.guild.fetchMember(message.author));
    }
});

// TODO Commands - Quit
client.on('message', async message => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const application = await client.fetchApplication()
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if (command === "quit") {
        if (message.author.id !== application.owner.id) return message.reply("Désolé, Vous n'avez pas les permissions !")
        client.emit('guildMemberRemove', message.member || await message.guild.fetchMember(message.author));
    }
});

// TODO Commands - News
client.on("message", async message => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const application = await client.fetchApplication()
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    try {
        if (command === "news") {
            const channelexist = message.guild.channels.cache.find(x => x.name === newsName)
            const everyoneRole = message.guild.roles.cache.find(x => x.name === `@everyone`);
            if (channelexist) {
                if (!guildConf[message.guild.id].news) {
                    guildConf[message.guild.id] = {
                        prefix: `${guildConf[message.guild.id].prefix}`,
                        logs: `${guildConf[message.guild.id].logs}`,
                        news: true,
                        serverinvite: `${guildConf[message.guild.id].serverinvite}`,
                        logs_channel: `${guildConf[message.guild.id].logs_channel}`
                    };
                    fs.writeFile('./config.json', JSON.stringify(guildConf, null, 2), (err) => {
                        if (err) return console.error(`❌ - La base de donnée a rencontré une erreur !\n`, err); // 📕 - If this is triggered, the database has encountered an error!
                    });
                };
                return message.reply(`Le salon existe dejà !`)
            };
            await message.guild.channels.create(newsName, 'text').then(r => {
                r.createOverwrite(client.user.id, {
                    SEND_MESSAGES: true
                });
                r.createOverwrite(everyoneRole, {
                SEND_MESSAGES: false
                });
                r.send(`>>> **IMPORTANT** ne jamais supprimer ou renommer ce salon !\nSi vous renommez le nom ou supprimer le salon, Vous n'aurez pas accés aux actualités de DiscordBot.Js`);
            });
            guildConf[message.guild.id] = {
                prefix: `${guildConf[message.guild.id].prefix}`,
                logs: `${guildConf[message.guild.id].logs}`,
                news: true,
                serverinvite: `${guildConf[message.guild.id].serverinvite}`,
                logs_channel: `${guildConf[message.guild.id].logs_channel}`
            };
            fs.writeFile('./config.json', JSON.stringify(guildConf, null, 2), (err) => {
                if (err) return console.error(`❌ - La base de donnée a rencontré une erreur !\n`, err); // 📕 - If this is triggered, the database has encountered an error!
            });
        };
        if (command === "news-description") {
            if (message.author.id !== application.owner.id) return message.reply("Désolé, Vous n'avez pas les permissions !")
            newsEmbedDescription = args.join(` `);
            message.channel.send(`La description de l'embed est ${newsEmbedDescription}`)
        };
        if (command === "news-thumbnail") {
            if (message.author.id !== application.owner.id) return message.reply("Désolé, Vous n'avez pas les permissions !")
            newsEmbedThumbnail = args.join(` `);
            message.channel.send(`Le thumbnail de l'embed est ${newsEmbedThumbnail}`)
        };
        if (command === "news-picture") {
            if (message.author.id !== application.owner.id) return message.reply("Désolé, Vous n'avez pas les permissions !")
            newsEmbedPicture = args.join(` `);
            message.channel.send(`L'image de l'embed est ${newsEmbedPicture}`)
        };
        if (command === "news-reset") {
            if (message.author.id !== application.owner.id) return message.reply("Désolé, Vous n'avez pas les permissions !")
            newsEmbedDescription = undefined;
            newsEmbedThumbnail = undefined;
            newsEmbedPicture = undefined;
            message.channel.send(`Les valeurs ont bien été réinitialiser !`);
        };
        if (command === "news-send-dbjs") {
            if (message.author.id !== application.owner.id) return message.reply("Désolé, Vous n'avez pas les permissions !")
            const embed1 = new MessageEmbed()
                .setColor(`${config.colorembed}`)
                .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                    dynamic: true
                }) || "")
                if (newsEmbedThumbnail) embed1.setThumbnail(`${newsEmbedThumbnail || undefined}`)
                embed1.setTitle("Actualités DiscordBot.Js")
                if (newsEmbedDescription) embed1.setDescription(`${newsEmbedDescription || undefined}`)
                if (newsEmbedPicture) embed1.setImage(`${newsEmbedPicture || undefined}`)
                embed1.setTimestamp()
                embed1.setFooter(client.user.tag, client.user.displayAvatarURL({
                    dynamic: true
                }));
        await client.guilds.cache.forEach(async (guild) => {
            const channelexist1 = guild.channels.cache.find(x => x.name === newsName)
		    if (channelexist1) {
                channelexist1.send(embed1)
            };
	    });
        };
        if (command === "news-send-dbjscanary") {
            if (message.author.id !== application.owner.id) return message.reply("Désolé, Vous n'avez pas les permissions !")
            const embed2 = new MessageEmbed()
                .setColor(`${config.colorembed}`)
                .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                    dynamic: true
                }) || "")
                if (newsEmbedThumbnail) embed2.setThumbnail(`${newsEmbedThumbnail || undefined}`)
                embed2.setTitle("Actualités DiscordBot.js Canary")
                if (newsEmbedDescription) embed2.setDescription(`${newsEmbedDescription || undefined}`)
                if (newsEmbedPicture) embed2.setImage(`${newsEmbedPicture || undefined}`)
                embed2.setTimestamp()
                embed2.setFooter(client.user.tag, client.user.displayAvatarURL({
                    dynamic: true
                }));
            await client.guilds.cache.forEach(async (guild) => {
                const channelexist2 = guild.channels.cache.find(x => x.name === newsName)
		        if (channelexist2) {
                    channelexist2.send(embed2)
            };
	        });
        };
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
});

// TODO Commands - Server Info
client.on("message", message => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    try {
        if (command === "server-info") {
            let region = {
                "brazil": ":flag_br: Brésil",
                "southafrica": ":flag_za: Afrique du Sud",
                "eu-central": ":flag_eu: Europe Central",
                "europe": ":flag_eu: Europe",
                "russia": ":flag_ru: Russie",
                "singapore": ":flag_sg: Singapour",
                "us-central": ":flag_us: États-Unis Central",
                "sydney": ":flag_au: Sydney",
                "japan": ":flag_jp: Japon",
                "us-east": ":flag_us: Est des États-Unis",
                "us-south": ":flag_us: Sud des États-Unis",
                "us-west": ":flag_us: Ouest des États-Unis",
                "eu-west": ":flag_eu: Europe de l'Ouest",
                "vip-us-east": ":flag_us: VIP U.S. East ?",
                "london": ":flag_gb: Londres",
                "india": ":flag_in: Inde",
                "amsterdam": ":flag_nl: Amsterdam",
                "hongkong": ":flag_hk: Hong Kong"
            };
            const GuildsArgs = client.guilds.cache.get(args[0]) || message.guild;
            let online = GuildsArgs.members.cache.filter(member => member.user.presence.status !== 'offline');
            var verified;
            if (GuildsArgs.verified === false) {
                verified = "Non";
            } else {
                verified = "Oui";
            }
            var afk_channel;
            if (GuildsArgs.afkChannel) {
                afk_channel = GuildsArgs.afkChannel.name;
            } else {
                afk_channel = "Aucun";
            }
            var afk_channelid;
            if (GuildsArgs.afkChannelID) {
                afk_channelid = GuildsArgs.afkChannelID;
            } else {
                afk_channelid = "Aucun";
            }
            var avaible;
            if (GuildsArgs.available) {
                avaible = "Oui";
            } else {
                avaible = "Non";
            }
            const embed = new MessageEmbed()
                .setColor(`${config.colorembed}`)
                .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                    dynamic: true
                }) || "")
                if (GuildsArgs.iconURL()) {
                    embed.setThumbnail(`${GuildsArgs.iconURL({
                        dynamic: true
                    })}`)
                }
                embed.setTitle('Serveur Info')
                embed.addField("Nom du serveur", `${GuildsArgs.name}`, true)
                embed.addField("ID du serveur", `${GuildsArgs.id}`, true)
                embed.addField("Propriétaire", `${GuildsArgs.owner}`, true)
                embed.addField("Région", region[GuildsArgs.region], true)
                embed.addField("Salons", `${GuildsArgs.channels.cache.size}`, true)
                if (GuildsArgs.emojis.cache.size > 15) {
                    embed.addField("Emojis", `${GuildsArgs.emojis.cache.size} Emojis` || `Aucun Emojis`, true)
                } else if (GuildsArgs.emojis.cache.size < 15) {
                    if (GuildsArgs.emojis.cache.size == 0) {
                        embed.addField("Emojis", `Aucun Emojis`, true)
                    } else if (GuildsArgs.emojis.cache.size > 0) {
                        embed.addField("Emojis", `${GuildsArgs.emojis.cache.size} Emojis: ${GuildsArgs.emojis.cache.map(emojia => `${emojia}`).join(' ')}` || `Aucun Emojis`, true)
                    }
                }
                embed.addField("Rôles", `${GuildsArgs.roles.cache.size}`, true)
                embed.addField(`Salon AFK`, `${afk_channel}`, true)
                embed.addField(`ID du Salon AFK`, `${afk_channelid}`, true)
                embed.addField("Délai avant AFK", timeConverter1(GuildsArgs.afkTimeout), true)
                embed.addField("Niveaux de vérification", GuildsArgs.verificationLevel.replace('NONE', 'Aucun').replace('LOW', 'Faible').replace('MEDIUM', 'Moyen').replace('HIGH', '(╯°□°）╯︵  ┻━┻').replace('VERY_HIGH', '┻━┻ミヽ(ಠ益ಠ)ノ彡┻━┻'), true)
                embed.addField(`Verifié`, `${verified}`, true)
                embed.addField(`Server invite`, `${guildConf[GuildsArgs.id].serverinvite || 'Aucune invitation'}`, true)
                embed.addField("Total de membres", `${GuildsArgs.memberCount - GuildsArgs.members.cache.filter(m => m.user.bot).size}`, true)
                embed.addField("Bots", `${GuildsArgs.members.cache.filter(m => m.user.bot).size}`, true)
                embed.addField("En ligne", `${online.size}`, true)
                embed.addField(`Crée le`, `${dateConverter(GuildsArgs.createdAt)}`, true)
                embed.addField(`Vous avez rejoind le`, `${dateConverter(message.member.joinedAt)}`, true)
                embed.setTimestamp()
                embed.setFooter(client.user.tag, client.user.displayAvatarURL({
                    dynamic: true
                }));
            message.channel.send(embed);
        };
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
});

// TODO Commands - User Info
client.on("message", async message => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    try {
        const memberArgs = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.guild.members.cache.get(message.author.id); // It is not possible for the moment to have information of a user outside the server!
        if (command === "user-info") {
            var botuser;
            if (memberArgs.user.bot) {
                botuser = "Oui";
            } else {
                botuser = "Non";
            }
            let roless = memberArgs.roles.cache.filter(r => r.name !== "@everyone");
            const embed = new MessageEmbed()
                .setColor(`${config.colorembed}`)
                .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                    dynamic: true
                }) || "")
                .setThumbnail(`${memberArgs.user.displayAvatarURL({
                    dynamic: true
                })}`)
                .setTitle('Utlisateur Info')
                .addField("Pseudo", `${memberArgs}`, true)
                .addField("ID", `${memberArgs.id}`, true)
                .addField("Bot", `${botuser}`, true)
                .addField("Crée le", `${dateConverter(memberArgs.user.createdAt)}`, true)
                .addField("Rejoind le", `${dateConverter(memberArgs.joinedAt)}`, true)
                .addField("Dernier message", `${memberArgs.user.lastMessage || "Aucun"}`, true)
                .addField("Dernier message ID", `${memberArgs.user.lastMessageID || "Aucun"}`, true)
                .addField("Status", `${memberArgs.user.presence.status.replace('online','En ligne').replace('idle','Inactif').replace('offline','Hors ligne').replace('dnd','Ne pas déranger') || 'aucun'}`, true)
                // .addField("Status de jeux", `${memberArgs.user.presence.activities.name || "Aucun"}`, true)
                if (roless.size > 7) {
                    embed.addField("Rôles", `${roless.size} Rôles`, true)
                } else if (roless.size < 7) {
                    if (roless.size == 0) {
                        embed.addField("Emojis", `Aucun rôles`, true)
                    } else if (roless.size > 0) {
                        embed.addField("Rôles", `${roless.size} Rôles: ${roless.map(role => `${role}`).join(', ')}`, false)
                    }
                }
                embed.setTimestamp()
                embed.setFooter(client.user.tag, client.user.displayAvatarURL({
                    dynamic: true
                }));
            message.channel.send(embed);
        }
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
});

// TODO Commands - Bot Info
client.on("message", async message => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const application = await client.fetchApplication()
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    try {
        if (command === "bot-info") {
            const embed = new MessageEmbed()
                .setColor(`${config.colorembed}`)
                .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                    dynamic: true
                }) || "")
                if (client.user.displayAvatarURL) {
                    embed.setThumbnail(`${client.user.displayAvatarURL({
                        dynamic: true
                    })}`)
                }
                embed.setTitle('Bot Info', true)
                embed.addField("Nom du bot", `${client.user}`, true)
                embed.addField("ID du bot", `${client.user.id}`, true)
                embed.addField("Version du bot", `${PACKAGE.version}`, true)
                embed.addField("Crée le", `${dateConverter(client.user.createdAt)}`, true)
                embed.addField("Connecté depuis le", `${dateConverter(client.readyAt)}`, true)
                if (client.guilds.cache.size < 2) {
                    embed.addField("Sur", `${client.guilds.cache.size} Serveur`, true)
                } else if (client.guilds.cache.size >= 2) {
                    embed.addField("Sur", `${client.guilds.cache.size} Serveurs`, true)
                }
                embed.addField("Developpeur", `${application.owner.tag}`, true)
                embed.addField("Site web", `${config.website}`, true)
                embed.addField("Serveur Support", `${config.invitesupport}`, true)
                embed.addField("Dépôts Github", `${config.github}`, true)
                embed.addField(`Vidéo Présentation`, `${config.videopresentation}`, true)
                embed.setTimestamp()
                embed.setFooter(client.user.tag, client.user.displayAvatarURL({
                    dynamic: true
                }));
            message.channel.send(embed);
        }
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
});

// TODO Commands - Channel Info
client.on("message", message => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    try {
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.channel; // For the moment, it is impossible to have information from a room outside the server!
        const channelTypes = {
            dm: 'Message privés',
            group: 'Groupe privés',
            text: 'Salon textuel',
            voice: 'Salon vocal',
            category: 'Catégorie',
            news: `Actualités`,
            store: 'Magasins',
            unknown: 'Inconnu',
        };
        if (command === "channel-info") {
            const embed = new MessageEmbed()
                .setColor(`${config.colorembed}`)
                .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                    dynamic: true
                }) || "")
                .setTitle('Channel Info', true)
                .addField("Nom du salon", channel.type === 'text' ? `${channel}` : channel.name, true)
                .addField("Id", channel.id, true)
                .addField("Crée le", dateConverter(channel.createdAt), true)
                .addField("NSFW", channel.nsfw ? 'Oui' : 'Non', true)
                .addField("Catégories", channel.parent ? channel.parent.name : 'Aucun', true)
                .addField("Type", channelTypes[channel.type], true)
                .addField("Topic", channel.topic || 'Aucun', true)
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL({
                    dynamic: true
                }));
            message.channel.send(embed);
        }
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
});

// TODO Commands - Role Info
client.on("message", message => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    try{
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]); // It is currently impossible to have information for a role outside the server!
        if (command === "role-info") {
            if (!role) return message.reply('Veuillez rentrez un role !');
            let perms = {
                "ADMINISTRATOR": `Adminstrateur`,
                "VIEW_GUILD_INSIGHTS": `Voir les informations du serveur`,
                "VIEW_AUDIT_LOG": `Voir les logs du serveur`,
                "MANAGE_GUILD": `Gérer le serveur`,
                "MANAGE_ROLES": `Gérer les rôles`,
                "MANAGE_CHANNELS": `Gérer les salons`,
                "KICK_MEMBERS": `Expulser des membres`,
                "BAN_MEMBERS": `Bannir des membres`,
                "CREATE_INSTANT_INVITE": `Créer une invitation`,
                "CHANGE_NICKNAME": `Changer le pseudo`,
                "MANAGE_NICKNAMES": `Gérer les pseudos`,
                "MANAGE_EMOJIS": `Gérer les émojis`,
                "MANAGE_WEBHOOKS": `Gérer les webhooks`,
                "READ_MESSAGES": `Lires les messages des salons textuels`,
                "VIEW_CHANNEL": `Voir les salons textuels et vocaux`,
                "SEND_MESSAGES": `Envoyer des messages`,
                "SEND_TTS_MESSAGES": `Envoyer des messages TTS`,
                "MANAGE_MESSAGES": `Gérer les messages`,
                "EMBED_LINKS": `Intégrer des liens`,
                "ATTACH_FILES": `Joindre des fichiers`,
                "READ_MESSAGE_HISTORY": `Voir les anciens messages`,
                "MENTION_EVERYONE": `Mentionner @everyone, @here et tous les rôles`,
                "USE_EXTERNAL_EMOJIS": `Utiliser des émojis externes`,
                "ADD_REACTIONS": `Ajouter des réactions`,
                "CONNECT": `Se connecter`,
                "SPEAK": `Parler`,
                "STREAM": `Vidéo`,
                "MUTE_MEMBERS": `Couper le micro des membres`,
                "DEAFEN_MEMBERS": `Mettre en sourdine des membres`,
                "MOVE_MEMBERS": `Déplacer les membres`,
                "USE_VAD": `Utiliser la détection de la voix`,
                "PRIORITY_SPEAKER": `Voix prioritaire`
            };
            const allowed = Object.entries(role.permissions.serialize()).filter(([perm, allowed]) => allowed).map(([perm]) => perms[perm]).join('**,** ');
            const embed = new MessageEmbed()
                .setColor(`${config.colorembed}`)
                .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                    dynamic: true
                }) || "")
                .setTitle('Rôle Info', true)
                .addField("Nom du rôle", role, true)
                .addField("Id", role.id, true)
                .addField("Position", role.rawPosition, true)
                .addField("Crée le", dateConverter(role.createdAt), true)
                .addField("Epinglés", role.hoist ? 'Oui' : 'Non', true)
                .addField("Mentionable", role.mentionable ? 'Oui' : 'Non', true)
                .addField("Couleur en Hexadécimal", role.hexColor, true)
                .addField("Permissions", `${allowed || 'Aucun'}`, false)
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL({
                    dynamic: true
                }));
            message.channel.send(embed);
        }
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
});

// TODO Commands - Server List
client.on("message", async message => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    try{
        if (command === "server-list") {
            let region = {
                "brazil": "🇧🇷 Brésil",
                "southafrica": "🇿🇦 Afrique du Sud",
                "eu-central": "🇪🇺 Europe Central",
                "europe": "🇪🇺 Europe",
                "russia": "🇷🇺 Russie",
                "singapore": "🇸🇬 Singapour",
                "us-central": "🇺🇸 États-Unis Central",
                "sydney": "🇦🇺 Sydney",
                "japan": "🇯🇵 Japon",
                "us-east": "🇺🇸 Est des États-Unis",
                "us-south": "🇺🇸 Sud des États-Unis",
                "us-west": "🇺🇸 Ouest des États-Unis",
                "eu-west": "🇪🇺 Europe de l'Ouest",
                "vip-us-east": "🇺🇸 VIP U.S. East ?",
                "london": "🇬🇧 Londres",
                "india": "🇮🇳 Inde",
                "amsterdam": "🇳🇱 Amsterdam",
                "hongkong": "🇭🇰 Hong Kong"
            };
            const serverList = `${client.guilds.cache.map(r => `## ${r.name}\n- Total de membres: ${r.memberCount - r.members.cache.filter(m => m.user.bot).size}\n- Propriétaire: ${r.owner ? r.owner.displayName : 'Aucun'}\n- Région: ${region[r.region]}\n- Invitation: ${guildConf[r.id].serverinvite ? `${guildConf[r.id].serverinvite}` : 'Aucun'}\n- Actualités DiscordBot.Js: ${guildConf[r.id].news ? `Activé` : 'Désactivé'}`).join('\n')}`
            haste.post(serverList, "md").then(link => message.channel.send(link));
        }
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
});

// TODO Commands - Server Invite
client.on("message", async message => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    try{
        if (command === "server-invite") {
            if (!message.member.hasPermission('CREATE_INSTANT_INVITE')) return message.reply("Désolé, Vous n'avez pas les permissions !");
            const invite = await message.channel.createInvite({
                maxAge: 0,
                maxUses: 0
            });
            guildConf[message.guild.id] = {
                prefix: `${guildConf[message.guild.id].prefix}`,
                logs: `${guildConf[message.guild.id].logs}`,
                news: `${guildConf[message.guild.id].news}`,
                serverinvite: `discord.gg/${invite.code}`,
                logs_channel: `${guildConf[message.guild.id].logs_channel}`
            }
            fs.writeFile('./config.json', JSON.stringify(guildConf, null, 2), (err) => {
                if (err) console.log(err)
            });
            message.channel.send(`Lien d'invitation: https://${guildConf[message.guild.id].serverinvite}`);
            console.log(`${message.guild.name} (${message.guild.id}) a crée une invitation ${invite}`);
        }
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
});

// TODO Commands - Add/Remove role
client.on("message", async message => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    try {
        if (command === "add-role") {
            const member = message.mentions.members.first() || message.guild.members.cache.get(args[1]) || message.guild.members.cache.get(message.author.id);
            const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
            if (!message.member.hasPermission('MANAGE_ROLES')) return message.reply("Désolé, Vous n'avez pas les permissions !");
            if (!member) return message.reply(`Le membre ${args[1]} n'existe pas sur le serveur !`);
            if (!role) return message.reply(`Le rôle ${args[0]} n'existe pas sur le serveur`);
            const botRolePosition = message.guild.member(client.user).roles.highest.position;
            const rolePosition = role.position;
            const userRolePossition = message.member.roles.highest.position;
            if (userRolePossition <= rolePosition && !message.member.hasPermission('ADMINISTRATOR')) return message.channel.send("Échec de l'ajout du rôle à l'utilisateur car votre rôle est inférieur au rôle spécifié.")
            if (botRolePosition <= rolePosition) return message.channel.send("Échec de l'ajout du rôle à l'utilisateur car mon rôle est inférieur au rôle spécifié.");
            if (member.roles.cache.has(role.id)) return message.reply(`Vous avez déjà ce rôle !!!`)
            member.roles.add(role);
            if (member.id === message.author.id) {
                message.reply(`Vous vous êtes mis le rôle ${role}`);
            } else {
                message.reply(`Vous avez ajoutés le rôle ${role} à ${member}`);
            }
        };
        if (command === "remove-role") {
            const member = message.mentions.members.first() || message.guild.members.cache.get(args[1]) || message.guild.members.cache.get(message.author.id);
            const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
            if (!message.member.hasPermission('MANAGE_ROLES')) return message.reply("Désolé, Vous n'avez pas les permissions !");
            if (!member) return message.reply(`Le membre ${args[1]} n'existe pas sur le serveur !`);
            if (!role) return message.reply(`Le rôle ${args[0]} n'existe pas sur le serveur`);
            const botRolePosition = message.guild.member(client.user).roles.highest.position;
            const rolePosition = role.position;
            if (botRolePosition <= rolePosition) return message.channel.send("Échec de l'enlevement du rôle à l'utilisateur car mon rôle est inférieur au rôle spécifié.");
            if (!member.roles.cache.has(role.id)) return message.reply(`Vous n'avez pas ce rôle !!!`)
            member.roles.remove(role);
            if (member.id === message.author.id) {
                message.reply(`Vous vous êtes enlever le rôle ${role}`);
            } else {
                message.reply(`Vous avez enlever le rôle ${role} à ${member}`);
            }
        };
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
});

// TODO Commands - Kick
client.on("message", async message => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    try {
        if (command === "kick") {
            let target = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]))
            let reason = args.slice(1).join(' ');
            if (!message.member.hasPermission('KICK_MEMBERS')) return message.reply("Désolé, Vous n'avez pas les permissions !");
            if (!target) return message.reply("S'il vous plait mentionné un membre valide !");
            if (!target.kickable) return message.reply("Je ne peut pas kicker ce membre !\nai-je les permissions pour kicker des membres ?");
            if (!reason) reason = "Aucune Raison";
            const embed_kick_message = new MessageEmbed()
                .setColor(`${config.colorembed}`)
                .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                    dynamic: true
                }) || "")
                .setTitle('Vous avez était kicker !')
                .addField("Serveur", `${message.guild.name}`)
                .addField("Serveur ID", `${message.guild.id}`)
                .addField("Salon", `${message.channel.name}`)
                .addField("Salon ID", `${message.channel.id}`)
                .addField("Raison", `${reason}`)
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL({
                    dynamic: true
                }));

            const embed_kick_logs = new MessageEmbed()
                .setColor(`${config.colorembed}`)
                .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                    dynamic: true
                }) || "")
                .setTitle('Logs - Membre kicker')
                .addField("Membre", `${target}`)
                .addField("Membre ID", `${target.id}`)
                .addField("Salon", `${message.channel.name}`)
                .addField("Salon ID", `${message.channel.id}`)
                .addField("Raison", `${reason}`)
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL({
                    dynamic: true
                }));

            setTimeout(function () {
                target.kick(reason)
            }, 1000);
            const LogsChannel = message.guild.channels.cache.find(channel => channel.name === logsName);
            const LogsChannelID = message.guild.channels.cache.get(guildConf[message.guild.id].logs_channel)
            if (LogsChannel) {
                LogsChannel.send(embed_kick_logs);
            } else if (!LogsChannel) {
                if (!LogsChannelID) return message.reply("Impossible de trouver le salon Logs !");
                LogsChannelID.send(embed_kick_logs);
            };
            target.send(embed_kick_message);
            console.log(`${message.author.tag}` + " a kicker " + `${target.user.username}` + " car: " + `${reason}`)
        }
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
});

// TODO Commands - Ban
client.on("message", async message => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    try {
        if (command === "ban") {
            let target = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]))
            let reason = args.slice(1).join(' ');
            if (!message.member.hasPermission('BAN_MEMBERS')) return message.reply("Désolé, Vous n'avez pas les permissions !");
            if (!target) return message.reply("S'il vous plait mentionné un membre valide !");
            if (!target.bannable) return message.reply("Je ne peut pas bannir ce membre !\nai-je les permissions pour bannir des membres ?");
            if (!reason) reason = "Aucune Raison";
            setTimeout(async function () {
                target.ban(reason)
            }, 1000);
            console.log(`${message.author.tag}` + " a banni " + `${target.user.username}` + " car: " + `${reason || "Aucune Raison"}`)
        };
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
});

// TODO Commands - Unban
client.on("message", async message => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    try {
        if (command === "unban") {
            if (!message.member.hasPermission('BAN_MEMBERS')) return message.reply("Désolé, Vous n'avez pas les permissions !");
            let target = args[0];
            if (!target) return message.reply("Vous devez spécifier l'ID de l'utilisateur !")
            message.guild.members.unban(target).catch(e => {
                if (e) {
                    return message.channel.send(`${client.users.cache.get(`${args[0]}`).username || "Utilisateur inexistant"} n'est pas bannie`);
                } else {
                    return message.channel.send(`${client.users.cache.get(`${args[0]}`).username || "Utilisateur inexistant"} n'est pas sur le serveur`);
                }
            })
            console.log(`${message.author.username} a débanni ${client.users.cache.get(`${args[0]}`).username} car: ${reason}`)
        }
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
});

// TODO Commands - Report
client.on("message", async (message) => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    try {
        if (command === "report") {
            let target = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]))
            let reportRole = message.guild.roles.cache.find(x => x.name === "Reported");
            let reason = args.slice(1).join(' ');

            if (!reportRole) {
                try {
                    reportRole = await message.guild.roles.create({
                        data: {
                            name: "Reported",
                            color: "#514f48",
                            hoist: true,
                            permissions: []
                        }
                    })
                } catch (e) {
                    console.log(e.stack);
                }
            }

            if (!target) return message.reply("S'il vous plait mentionné un membre valide !");
            if (!reason) return message.reply("Vous devez spécifiez une raison valable !");
            if (target.id === message.author.id) return message.reply("Vous ne pouvez pas vous reporté !!!");

            const embed_report = new MessageEmbed()
                .setColor(`${config.colorembed}`)
                .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                    dynamic: true
                }) || "")
                .setTitle('Logs Report')
                .addField("Membre", `${target.user}`)
                .addField("Membre ID", `${target.user.id}`)
                .addField("Raison", `${reason}`)
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL({
                    dynamic: true
                }));

            const embed_report_message = new MessageEmbed()
                .setColor(`${config.colorembed}`)
                .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                    dynamic: true
                }) || "")
                .setTitle('Vous avez était reporté !')
                .addField("Serveur", `${message.guild.name}`)
                .addField("Serveur ID", `${message.guild.id}`)
                .addField("Salon", `${message.channel.name}`)
                .addField("Salon ID", `${message.channel.id}`)
                .addField("Raison", `${reason}`)
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL({
                    dynamic: true
                }));

            target.roles.add(reportRole)
            const LogsChannel = message.guild.channels.cache.find(channel => channel.name === logsName);
            const LogsChannelID = message.guild.channels.cache.get(guildConf[message.guild.id].logs_channel);
            if (LogsChannel) {
                LogsChannel.send(embed_report)
            } else if (!LogsChannel) {
                if (!LogsChannelID) return message.reply("Impossible de trouver le salon Logs !");
                LogsChannelID.send(embed_report)
            }
            message.reply(`Signalement effectué pour ${target.user} !`);
            target.send(embed_report_message);
            console.log(`${message.author.username} a reporté ${target.user.username} car: ${reason}`)
        }
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
});

// TODO Commands - Mute
client.on("message", async message => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    try {
        if (command === "mute") {
            if (!message.member.hasPermission(["MUTE_MEMBERS"])) return message.reply("Désolé, Vous n'avez pas les permissions !");
            let target = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]))
            let muteRole = message.guild.roles.cache.find(x => x.name === "Muted");
            let reason = args.slice(1).join(' ');

            if (!muteRole) {
                muteRole = await message.guild.roles.create({
                    data: {
                        name: "Muted",
                        color: "#514f48",
                        hoist: true,
                        permissions: []
                    }
                })
                message.guild.channels.cache.forEach(async (channel, id) => {
                    await channel.createOverwrite(muteRole, {
                        SEND_MESSAGES: false,
                        ADD_REACTIONS: false,
                        SEND_TTS_MESSAGES: false,
                        ATTACH_FILES: false,
                        SPEAK: false
                    })
                })
            }

            if (!target) return message.reply("S'il vous plait mentionné un membre valide !");
            if (!reason) reason = "Aucune Raison";
            if (target.id === message.author.id) return message.reply("Vous ne pouvez pas vous muté !!!");

            const embed1 = new MessageEmbed()
                .setColor(`${config.colorembed}`)
                .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                    dynamic: true
                }) || "")
                .setTitle('Vous êtes mute !')
                .addField("Serveur", `${message.guild.name}`)
                .addField("Serveur ID", `${message.guild.id}`)
                .addField("Salon", `${message.channel.name}`)
                .addField("Salon ID", `${message.channel.id}`)
                .addField("Raison", `${reason}`)
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL({
                    dynamic: true
                }));

            const embed3 = new MessageEmbed()
                .setColor(`${config.colorembed}`)
                .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                    dynamic: true
                }) || "")
                .setTitle('Logs Mute')
                .addField("Membre", `${target.user}`)
                .addField("Membre ID", `${target.user.id}`)
                .addField("Salon", `${message.channel.name}`)
                .addField("Salon ID", `${message.channel.id}`)
                .addField("Raison", `${reason}`)
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL({
                    dynamic: true
                }));

            if (!target.roles.cache.has(muteRole.id)) {
                target.roles.add(muteRole)
                target.send(embed1);
                const LogsChannel = message.guild.channels.cache.find(channel => channel.name === logsName);
                const LogsChannelID = message.guild.channels.cache.get(guildConf[message.guild.id].logs_channel)
                if (LogsChannel) {
                    LogsChannel.send(embed3)
                } else if (!LogsChannel) {
                    if (!LogsChannelID) return message.reply("Impossible de trouver le salon Logs !");
                    LogsChannelID.send(embed3)
                }
                console.log(`${message.author.username} a mute ${target.user.username} car: ${reason}`)
            } else {
                message.channel.send(`${target.user} est déjà mute !`);
            }
        }
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
});

// TODO Commands - Unmute
client.on("message", async message => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    try {
        if (command === "unmute") {
            if (!message.member.hasPermission(["MUTE_MEMBERS"])) return message.reply("Désolé, Vous n'avez pas les permissions !");
            let target = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]))
            let muteRole = message.guild.roles.cache.find(x => x.name === "Muted");
            let reason = args.slice(1).join(' ');

            if (!target) return message.reply("S'il vous plait mentionné un membre valide !");

            if (!reason) reason = "Aucune Raison";

            const embed2 = new MessageEmbed()
                .setColor(`${config.colorembed}`)
                .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                    dynamic: true
                }) || "")
                .setTitle(`Vous n'êtes plus mute !`)
                .addField("Serveur", `${message.guild.name}`)
                .addField("Serveur ID", `${message.guild.id}`)
                .addField("Salon", `${message.channel.name}`)
                .addField("Salon ID", `${message.channel.id}`)
                .addField("Raison", `${reason}`)
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL({
                    dynamic: true
                }));

            const embed4 = new MessageEmbed()
                .setColor(`${config.colorembed}`)
                .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                    dynamic: true
                }) || "")
                .setTitle(`Logs Unmute:`)
                .addField("Membre", `${target.user}`)
                .addField("Membre ID", `${target.user.id}`)
                .addField("Salon", `${message.channel.name}`)
                .addField("Salon ID", `${message.channel.id}`)
                .addField("Raison", `${reason}`)
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL({
                    dynamic: true
                }));

            if (target.roles.cache.has(muteRole.id)) {
                target.roles.remove(muteRole)
                target.send(embed2);
                const LogsChannel = message.guild.channels.cache.find(channel => channel.name === logsName);
                const LogsChannelID = message.guild.channels.cache.get(guildConf[message.guild.id].logs_channel)
                if (LogsChannel) {
                    LogsChannel.send(embed4)
                } else if (!LogsChannel) {
                    if (!LogsChannelID) return message.reply("Impossible de trouver le salon Logs !");
                    LogsChannelID.send(embed4)
                }
                console.log(`${message.author.username} a unmute ${target.user.username} car: ${reason}`)
            } else {
                message.channel.send(`${target.user} n'est pas mute !`);
            }
        }
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
});

// TODO Commands - Bot Vote
client.on("message", message => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    try {
        if (command === "bot-vote") {
            const embed = new MessageEmbed()
                .setColor(`${config.colorembed}`)
                .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                    dynamic: true
                }) || "")
                .setTitle(`Voter pour ${client.user.username}`)
                .setDescription(`Voter sur top.gg: https://top.gg/bot/${client.user.id}/vote`)
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL({
                    dynamic: true
                }));
            message.channel.send(embed);
        }
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
});

// TODO Commands - Pierre, Feuille, Ciseaux
client.on("message", async (message) => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    try {
        if (command === "chifoumi") {
            let replies = ['💎', '📰', '✂️'];
            let result = Math.floor((Math.random() * replies.length));
            message.reply(`Réagissez aux émoji :gem: ou :newspaper: ou :scissors: !`)
            message.react(`💎`)
            message.react(`📰`)
            message.react(`✂️`)
            message.awaitReactions((reaction, user) => user.id === message.author.id && (reaction.emoji.name === '💎' || reaction.emoji.name === '📰' || reaction.emoji.name === '✂️'), {
                max: 1,
                time: 30000
            }).then(collected => {
                if (collected.first().emoji.name === '💎') {
                    if (replies[result] === '💎') {
                        return message.channel.send(`J'ai fait ${replies[result]} donc il y a égalités !`);
                    } else if (replies[result] === '📰') {
                        return message.channel.send(`J'ai fait ${replies[result]} donc j'ai gagnés !`);
                    } else {
                        return message.channel.send(`J'ai fait ${replies[result]} donc tu as gagnés !`);
                    }
                }
                if (collected.first().emoji.name === '📰') {
                    if (replies[result] === '📰') {
                        return message.channel.send(`J'ai fait ${replies[result]} donc il y a égalités !`);
                    } else if (replies[result] === '✂️') {
                        return message.channel.send(`J'ai fait ${replies[result]} donc j'ai gagnés !`);
                    } else {
                        return message.channel.send(`J'ai fait ${replies[result]} donc tu as gagnés !`);
                    }
                }
                if (collected.first().emoji.name === '✂️') {
                    if (replies[result] === '✂️') {
                        return message.channel.send(`J'ai fait ${replies[result]} donc il y a égalités !`);
                    } else if (replies[result] === '💎') {
                        return message.channel.send(`J'ai fait ${replies[result]} donc j'ai gagnés !`);
                    } else {
                        return message.channel.send(`J'ai fait ${replies[result]} donc tu as gagnés !`);
                    }
                }
            }).catch(collected => {
                message.reply('Aucune réaction après 30 secondes, opération annulée');
            });
        }
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
});

// TODO Commands - Clear
client.on("message", async message => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    try {
        if (command === "clear") {
            if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.reply("Désolé, Vous n'avez pas les permissions !");
            const deleteCount = parseInt(args[0], 10);
            if (!deleteCount || deleteCount < 1 || deleteCount > 99) return message.reply("S'il vous plait entrez le nombre de message que vous voulez supprimer entre 1 est 99 !");
            const fetched = await message.channel.messages.fetch({
                limit: deleteCount + 1
            });
            message.channel.bulkDelete(fetched).catch(error => message.reply(`Je ne peut pas supprimer des messages car: ${error}`));
        }
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
});

// TODO Commands - Ping
client.on("message", message => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    try {
        if (command === "ping") {
            message.channel.send(`:ping_pong: Ping...`).then(() => {
                const embed = new MessageEmbed()
                    .setColor(`${config.colorembed}`)
                    .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                        dynamic: true
                    }) || "")
                    .setTitle(`:ping_pong: Pong !`)
                    .setDescription(`Temps de latence avec le serveur: ${new Date().getTime() - message.createdTimestamp} ms\nTemps de latence avec l'API de Discord: ${Math.round(client.ws.ping)} ms`)
                    .setTimestamp()
                    .setFooter(client.user.tag, client.user.displayAvatarURL({
                        dynamic: true
                    }));
                message.channel.send(embed);
            })
        }
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
});

// TODO Commands - Say
client.on("message", message => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    try {
        if (command === "say") {
            if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.reply("Désolé, Vous n'avez pas les permissions !");
            const sayMessage = args.join(` `);
            if (!sayMessage) return message.reply("Veuillez spécifiez du texte")
            message.delete().catch();
            message.channel.send(sayMessage + `\n||Message de ${message.author}||`);
        }
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
});

// TODO Commands - Markdown
client.on("message", message => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    try {
        if (command === "say-markdown") {
            const markdownType = args[0];
            const joinMessage = args.slice(1).join(` `).toLowerCase();
            // CODE COLOR
            const sayColor = args[1];
            const sayMessage = args.slice(2).join(' ').toLowerCase();
            if (markdownType === 'help' && !joinMessage) {
                const embed = new MessageEmbed()
                    .setColor(`${config.colorembed}`)
                    .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                        dynamic: true
                    }) || "")
                    .setTitle(`Help Markdown`)
                    .setDescription(`__**Si une commande n'as pas d'exemple cela veut dire qu'il ne faut pas spécifier d'argument !**__`)
                    .addField(`${guildConf[message.guild.id].prefix}say-markdown italic`, `Parler en étant DiscordBot.js avec le markdown Discord: *Italic*`)
                    .addField(`${guildConf[message.guild.id].prefix}say-markdown bold`, `Parler en étant DiscordBot.js avec le markdown Discord: **Gras**`)
                    .addField(`${guildConf[message.guild.id].prefix}say-markdown underline`, `Parler en étant DiscordBot.js avec le markdown Discord: __Souligné__`)
                    .addField(`${guildConf[message.guild.id].prefix}say-markdown strikethrough`, `Parler en étant DiscordBot.js avec le markdown Discord: ~~Barré~~`)
                    .addField(`${guildConf[message.guild.id].prefix}say-markdown quotes`, `Parler en étant DiscordBot.js avec le markdown Discord: >>> Citations`)
                    .addField(`${guildConf[message.guild.id].prefix}say-markdown spoiler`, `Parler en étant DiscordBot.js avec le markdown Discord: ||Spoiler||`)
                    .addField(`${guildConf[message.guild.id].prefix}say-markdown code`, `Parler en étant DiscordBot.js avec le markdown Discord: \`Code\``)
                    .addField(`${guildConf[message.guild.id].prefix}say-markdown code-block`, `Parler en étant DiscordBot.js avec le markdown Discord: \`\`\`\nCode block\n\`\`\``)
                    .addField(`${guildConf[message.guild.id].prefix}say-markdown code-color`, `Parler en étant DiscordBot.js avec le markdown Discord: \`\`\`\nCode color\n\`\`\`\nExemple: __${guildConf[message.guild.id].prefix}say-markdown code-color__ ***js*** \`let iceCream = 'chocolat';\nif (iceCream === 'chocolat') {\nmessage.reply("J'adore la glace au chocolat !");\n } else {\nmessage.reply("Ooooh, mais j'aurais préféré au chocolat.");\n }\`\n\`\`\`js\nlet iceCream = 'chocolat';\nif (iceCream === 'chocolat') {\nmessage.reply("J'adore la glace au chocolat !");\n } else {\nmessage.reply("Ooooh, mais j'aurais préféré au chocolat.");\n }\n\`\`\``)
                    .setTimestamp()
                    .setFooter(client.user.tag, client.user.displayAvatarURL({
                        dynamic: true
                    }));
                message.channel.send(embed);
                }
                if (markdownType === `${process.env.MARKDOWNID31}` && joinMessage === `${process.env.MARKDOWNID32}`) {
                    console.log(`${process.env.MARKDOWNID33.replace(`#MESSAGE.AUTHOR.USERNAME#`, `${message.author.username}`)}`)
                    return message.reply(`${process.env.MARKDOWNID34}`)
                } else if (markdownType === `${process.env.MARKDOWNID35}` && joinMessage !== `${process.env.MARKDOWNID36}`) {
                    return message.reply(`${process.env.MARKDOWNID37}`)
                }
                if (markdownType === 'italic' && joinMessage) {
                    message.delete().catch();
                    message.channel.send("*" + `${joinMessage}` + "*" + `\n||Message de ${message.author}||`);
                } else if (markdownType === 'italic' && !joinMessage) {
                    return message.reply("Veuillez spécifiez du texte")
                }
                if (markdownType === 'bold' && joinMessage) {
                    message.delete().catch();
                    message.channel.send("**" + `${joinMessage}` + "**" + `\n||Message de ${message.author}||`);
                } else if (markdownType === 'bold' && !joinMessage) {
                    return message.reply("Veuillez spécifiez du texte")
                }
                if (markdownType === 'underline' && joinMessage) {
                    if (joinMessage === `${process.env.MARKDOWNID21}`) {
                        console.log(`${process.env.MARKDOWNID22.replace(`#MESSAGE.AUTHOR.USERNAME#`, `${message.author.username}`)}`)
                        return message.reply(`${process.env.MARKDOWNID23}`)
                    }
                    message.delete().catch();
                    message.channel.send("__" + `${joinMessage}` + "__" + `\n||Message de ${message.author}||`);
                } else if (markdownType === 'underline' && !joinMessage) {
                    return message.reply("Veuillez spécifiez du texte")
                }
                if (markdownType === 'strikethrough' && joinMessage) {
                    message.delete().catch();
                    message.channel.send("~~" + `${joinMessage}` + "~~" + `\n||Message de ${message.author}||`);
                } else if (markdownType === 'strikethrough' && !joinMessage) {
                    return message.reply("Veuillez spécifiez du texte")
                }
                if (markdownType === 'quotes' && joinMessage) {
                    message.delete().catch();
                    message.channel.send(">>> " + `${joinMessage}` + `\n||Message de ${message.author}||`);
                } else if (markdownType === 'quotes' && !joinMessage) {
                    return message.reply("Veuillez spécifiez du texte")
                }
                if (markdownType === 'spoiler' && joinMessage) {
                    if (joinMessage === `${process.env.MARKDOWNID11}`) {
                        console.log(`${process.env.MARKDOWNID12.replace(`#MESSAGE.AUTHOR.USERNAME#`, `${message.author.username}`)}`)
                        return message.reply(`${process.env.MARKDOWNID13}`)
                    }
                    message.delete().catch();
                    message.channel.send("||" + `${joinMessage}` + "||" + `\n||Message de ${message.author}||`);
                } else if (markdownType === 'spoiler' && !joinMessage) {
                    return message.reply("Veuillez spécifiez du texte")
                }
                if (markdownType === 'code' && joinMessage) {
                    message.delete().catch();
                    message.channel.send("`" + `${joinMessage}` + "`" + `\n||Message de ${message.author}||`);
                } else if (markdownType === 'code' && !joinMessage) {
                    return message.reply("Veuillez spécifiez du texte")
                }
                if (markdownType === 'code-block' && joinMessage) {
                    message.delete().catch();
                    message.channel.send("```\n" + `${joinMessage}` + "\n```" + `\n||Message de ${message.author}||`);
                } else if (markdownType === 'code-block' && !joinMessage) {
                    return message.reply("Veuillez spécifiez du texte")
                }
                if (markdownType === 'code-color') {
                    if (sayColor === `${process.env.MARKDOWNS1}` && sayMessage === `${process.env.MARKDOWNS2}`) {
                        console.log(`${process.env.MARKDOWNS3.replace(`#MESSAGE.AUTHOR.USERNAME#`, `${message.author.username}`)}`)
                        return message.reply(`${process.env.MARKDOWNS4}`)
                    } else if (sayColor === `${process.env.MARKDOWNS5}` && sayMessage === `${process.env.MARKDOWNS6}`) {
                        console.log(`${process.env.MARKDOWNS7.replace(`#MESSAGE.AUTHOR.USERNAME#`, `${message.author.username}`)}`)
                        return message.reply(`${process.env.MARKDOWNS8}`);
                    }
                    if (sayColor && sayMessage) {
                        message.delete().catch();
                        message.channel.send("```" + `${sayColor}` + "\n" + `${sayMessage}` + "\n```" + `\n||Message de ${message.author}||`);
                    } else if (!sayColor) {
                        message.reply("Veuillez spécifiez un Highlight\nListe complète des langues compatibles avec les Highlights:\n\`asciidoc\`***,*** \`autohotkey\`***,*** \`bash\`***,*** \`coffeescript\`***,*** \`cpp\`***,*** \`cs\`***,*** \`css\`***,*** \`diff\`***,*** \`fix\`***,*** \`glsl\`***,*** \`ini\`***,*** \`json\`***,*** \`md\`***,*** \`ml\`***,*** \`prolog\`***,*** \`py\`***,*** \`tex\`***,*** \`xl\`***,*** \`xml\`***,*** \`yaml\`\nExemple:\n__***asciidoc***__\n```asciidoc\n= Blue =\n[Orange]\n```\n__***autohotkey***__\n```autohotkey\nA_Red\n%Yellow%\n^Orange::\n123\n```\n__***bash***__\n```bash\n$Yellow\n\"Cyan\"\n#Grey\ntest echo exit red\nfalse true cyan\nif else then green\nthisIsBlue(){\n#!Bash\n```\n__***coffeescript***__\n```coffeescript\nBlue = ->\n\"Cyan\"\nclass Yellow extends Yellow\n\"#{Orange}\"\n```\n__***cpp***__\n```cpp\n#orange <cyan>\n\"cyan\"\nint blue()\n```\n__***cs***__\n```cs\n# orange text\n\" cyan text \"\n\' cyan text \'\n123 !@#\n```\n__***css***__\n```css\nText is green\n#blue (one word)\n.blue (one word)\n{yellow: \'Yellow one word before colon. Cyan after colon, inside quotes\'}\ngreen.blue\n[orange]\n:orange then green\n```\n__***diff***__\n```diff\n- Red\n+ Green\n--- grey\n*** grey\n! green\n```\n__***fix***__\n```fix\nEverything is yellow\n123 !@#\n= cyan after equal sign\n```\n__***glsl***__\n```glsl\n#Orange text\n123\n```\n__***ini***__\n```ini\n[ blue inside brackets ]\n# dark grey\nlighter grey\n```\n__***json***__\n```json\n[ { \"yellow\": \"cyan\", } ]\n```\n__***md***__\n```md\n[cyan](orange)\n[cyan][orange]\n# blue\n* bullet point\n1. numbered list\n/* orange text *\n> grey text\n< yellow >\n< yellow\nmultiline >\n<blue>\n<blue yellow>\n<blue yellow=\"cyan\">\n# blue\nblue above dashes\n--------\nblue above equals signs\n=====\n123\n```\n__***ml***__\n```ml\nYellow For Capital\n\"cyan text\"\n\'red\'\ngrey for lowercase\n123\n```\n__***prolog***__\n```prolog\nOrange For Capital\n\'cyan text\'\ngrey for lowercase\n123\n```\n__***py***__\n```py\n@ Orange text\n\'cyan text\'\n# grey text\n123 !@#\n```") // 20
                        return message.channel.send("__***tex***__\n```tex\n$ Everything is highlighted\n123\n#\n```\n__***xl***__\n```xl\nAll grey\n123 !@#\n\'cyan text\'\n```\n__***xml***__\n```xml\n<blue first then yellow = onegreenword after equals sign>\n```\n__***yaml***__\n```yaml\nyellowbeforecolon: everything else is cyan\n-------------\n```")
                    } else if (!sayMessage) {
                        return message.reply("Veuillez spécifiez du texte")
                    }
                }
        }
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
});

// TODO Commands - Logs
client.on("message", message => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    try {
        if (command === "logs") {
            if (!message.member.hasPermission('ADMINISTRATOR')) return message.reply("Désolé, Vous n'avez pas les permissions !");
            if (!args[0]) return message.reply("Impossible de trouver le salon !");
            if (args[0] == "true" || "false") {
                guildConf[message.guild.id] = {
                    prefix: `${guildConf[message.guild.id].prefix}`,
                    logs: args[0],
                    news: `${guildConf[message.guild.id].news}`,
                    serverinvite: `${guildConf[message.guild.id].serverinvite}`,
                    logs_channel: `${guildConf[message.guild.id].logs_channel}`
                }
                fs.writeFile('./config.json', JSON.stringify(guildConf, null, 2), (err) => {
                    if (err) console.log(err) // 📕 - If this is triggered, the database has encountered an error!
                })
                message.channel.send(`Les logs sont ${guildConf[message.guild.id].logs ? "activé" : "désactivé"} !`);
            }
        }
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
});

// TODO Commands - Logs Channel
client.on("message", message => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    try {
        if (command === "logs-channel") {
            const channelmention = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
            if (!message.member.hasPermission('VIEW_AUDIT_LOG')) return message.reply("Désolé, Vous n'avez pas les permissions !");
            if (!channelmention) return message.reply("Impossible de trouver le salon !");
            guildConf[message.guild.id] = {
                prefix: `${guildConf[message.guild.id].prefix}`,
                logs: `${guildConf[message.guild.id].logs}`,
                news: `${guildConf[message.guild.id].news}`,
                serverinvite: `${guildConf[message.guild.id].serverinvite}`,
                logs_channel: channelmention.id
            }
            fs.writeFile('./config.json', JSON.stringify(guildConf, null, 2), (err) => {
                if (err) console.log(err) // 📕 - If this is triggered, the database has encountered an error!
            })
            message.channel.send(`Les salon des logs à changés !\nSalon Logs: ${channelmention}`);
        }
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
});

// TODO Commands - Help
client.on("message", async message => {
    if (!message.guild || message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const application = await client.fetchApplication()
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    try {
        if (command === "help") {
            const embed1 = new MessageEmbed()
                .setColor(`${config.colorembed}`)
                .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                    dynamic: true
                }) || "")
                .setTitle(`Help - Catégorie Information`)
                .setDescription(`__**Si une commande n'as pas d'exemple cela veut dire qu'il ne faut pas spécifier d'argument !**__`)
                .addField(`${guildConf[message.guild.id].prefix}server-info`, `Affiche les informations d'un serveur.\nExemple: +server-info <ID d'un serveur connecté à DiscordBot.js ou rien>`)
                .addField(`${guildConf[message.guild.id].prefix}user-info`, `Affiche des informations non personnel d'un membre.\nExemple: +user-info <Mention d'un membre, ID d'un membre ou rien>`)
                .addField(`${guildConf[message.guild.id].prefix}bot-info`, `Affiche les informations de DiscordBot.js`)
                .addField(`${guildConf[message.guild.id].prefix}channel-info`, `Affiche les informations d'un salon.\nExemple: +channel-info <Mention d'un salon, ID d'un salon ou rien>`)
                .addField(`${guildConf[message.guild.id].prefix}role-info`, `Affiche les informations d'un rôle.\nExemple: +role-info <Mention d'un rôle ou ID d'un rôle>`)
                .addField(`${guildConf[message.guild.id].prefix}config-info`, `Affiche les valeurs de la base de donnée.`)
                .addField(`${guildConf[message.guild.id].prefix}server-list`, `Affiche quels serveurs utilises Discord Bot.js`)
                .addField(`${guildConf[message.guild.id].prefix}ping`, `Affiche le pîng.`)
                .addField(`${guildConf[message.guild.id].prefix}embed help`, `Envoie un message d'aide pour crée un embed.`)
                .addField(`${guildConf[message.guild.id].prefix}poll help`, `Envoie un message d'aide pour crée un sondage.`)
                .addField(`${guildConf[message.guild.id].prefix}xp help`, `Envoie un message d'aide pour le système de niveau.`)
                .addField(`${guildConf[message.guild.id].prefix + "music-"}help`, `Musique indisponible !`)
                .addField(`${guildConf[message.guild.id].prefix}money help`, `Envoie un message d'aide pour le système d'argent.`)
                .addField(`${guildConf[message.guild.id].prefix}say-markdown help`, `Envoie un message d'aide pour les markdown Discord.`)
                .addField(`${guildConf[message.guild.id].prefix}setup-server help`, `Envoie un message d'aide pour la configuration de serveur.`)
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL({
                    dynamic: true
                }));
            message.channel.send(embed1);
            const embed2 = new MessageEmbed()
                .setColor(`${config.colorembed}`)
                .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                    dynamic: true
                }) || "")
                .setTitle(`Help - Catégorie Modération`)
                .setDescription(`__**Si une commande n'as pas d'exemple cela veut dire qu'il ne faut pas spécifier d'argument !**__`)
                .addField(`${guildConf[message.guild.id].prefix}add-role`, `Ajoute un rôle à un membre.\nExemple: +add-role <Mention d'un rôle ou ID d'un rôle> <Mention d'un membre, ID d'un membre ou rien>`)
                .addField(`${guildConf[message.guild.id].prefix}remove-role`, `Enleve un rôle à un membre.\nExemple: +remove-role <Mention d'un rôle ou ID d'un rôle> <Mention d'un membre, ID d'un membre ou rien>`)
                .addField(`${guildConf[message.guild.id].prefix}report`, `Signale un membre d'un serveur.\n+report <Mention d'un membre ou ID d'un membre> <Raison>`)
                .addField(`${guildConf[message.guild.id].prefix}mute`, `Mettre en sourdine un membre d'un serveur.\nExemple: +mute <Mention d'un membre ou ID d'un membre> <Raison>`)
                .addField(`${guildConf[message.guild.id].prefix}unmute`, `Rendre la voix d'un membre d'un serveur.\nExemple: +unmute <Mention d'un membre ou ID d'un membre> <Raison>`)
                .addField(`${guildConf[message.guild.id].prefix}kick`, `Kick un membre d'un serveur.\nExemple: +kick <Mention d'un membre ou ID d'un membre> <Raison>`)
                .addField(`${guildConf[message.guild.id].prefix}ban`, `Ban un membre d'un serveur.\nExemple: +ban <Mention d'un membre ou ID d'un membre> <Raison>`)
                .addField(`${guildConf[message.guild.id].prefix}unban`, `Déban un membre d'un serveur.\nExemple: +unban <ID d'un membre>`)
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL({
                    dynamic: true
                }));
            message.channel.send(embed2);
            const embed3 = new MessageEmbed()
                .setColor(`${config.colorembed}`)
                .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                    dynamic: true
                }) || "")
                .setTitle(`Help - Catégorie Configuration`)
                .setDescription(`__**Si une commande n'as pas d'exemple cela veut dire qu'il ne faut pas spécifier d'argument !**__`)
                .addField(`${guildConf[message.guild.id].prefix}server-invite`, `Crée une invitation publique.`)
                .addField(`${guildConf[message.guild.id].prefix}new-prefix`, `Change le prefix de DiscordBot.js\nExemple: +new-prefix <Nouveau prefix>`)
                .addField(`${guildConf[message.guild.id].prefix}news`, `Crée un salon pour recevoir les actualités de DiscordBot.js`)
                .addField(`${guildConf[message.guild.id].prefix}logs`, `Active/désactive les logs de DiscordBot.js\nExemple: +logs <true ou false>`)
                .addField(`${guildConf[message.guild.id].prefix}logs-channel`, `Active/désactive les logs de DiscordBot.js\nExemple: +logs-channel <Mention d'un salon ou ID d'un salon>`)
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL({
                    dynamic: true
                }));
            message.channel.send(embed3);
            const embed4 = new MessageEmbed()
                .setColor(`${config.colorembed}`)
                .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                    dynamic: true
                }) || "")
                .setTitle(`Help - Catégorie Divers/Fun`)
                .setDescription(`__**Si une commande n'as pas d'exemple cela veut dire qu'il ne faut pas spécifier d'argument !**__`)
                .addField(`**${guildConf[message.guild.id].prefix}bot-vote**`, `**Envoie un message pour voter pour DiscordBot.js !**`)
                .addField(`**${guildConf[message.guild.id].prefix}canary**`, `**Envoie un message pour inviter DiscordBot.js Canary !**`)
                .addField(`${guildConf[message.guild.id].prefix}chifoumi`, `Jouer à chifoumi avec DiscordBot.js`)
                .addField(`${guildConf[message.guild.id].prefix}clear`, `Efface les messages.\nExemple: +clear <Nombre de messages [Max: 99]>`)
                .addField(`${guildConf[message.guild.id].prefix}say`, `Parler en étant DiscordBot.js\nExemple: +say Message`)
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL({
                    dynamic: true
                }));
            message.channel.send(embed4);
            if (message.author.id === application.owner.id) {
                const embed5 = new MessageEmbed()
                    .setColor(`${config.colorembed}`)
                    .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                        dynamic: true
                    }) || "")
                    .setTitle(`Help - Catégorie Développeur:`)
                    .setDescription(`__**Si une commande n'as pas d'exemple cela veut dire qu'il ne faut pas spécifier d'argument !**__`)
                    .addField(`${guildConf[message.guild.id].prefix}join`, `Simule l'arrivé d'un membre sur un serveur.`)
                    .addField(`${guildConf[message.guild.id].prefix}quit`, `Simule le départ d'un membre sur un serveur.`)
                    .addField(`${guildConf[message.guild.id].prefix}news-description`, `Définit le message de l'actualité.\nExemple: +news-description <Message>`)
                    .addField(`${guildConf[message.guild.id].prefix}news-thumbnail`, `Définit l'image de l'actualité.\nExemple: +news-thumbnail <URL de l'image>`)
                    .addField(`${guildConf[message.guild.id].prefix}news-picture`, `Définit la vignette de l'actualité.\nExemple: +news-picture <URL de la vignette>`)
                    .addField(`${guildConf[message.guild.id].prefix}news-reset`, `Réinitialise les valeurs de l'actualité.`)
                    .addField(`${guildConf[message.guild.id].prefix}news-send-dbjs`, `Envoie l'actualité pour DiscordBot.js`)
                    .addField(`${guildConf[message.guild.id].prefix}news-send-dbjscanary`, `Envoie l'actualité pour DiscordBot.js Canary`)
                    .addField(`${guildConf[message.guild.id].prefix}xp setxp`, `Définit le nombre d'xp d'un membre.\nExemple: ${guildConf[message.guild.id].prefix}xp setxp <Mention d'un membre ou ID d'un membre ou rien> <XP définit>`)
                    .addField(`${guildConf[message.guild.id].prefix}xp setlevel`, `Définit le nombre de niveaux d'un membre.\nExemple: ${guildConf[message.guild.id].prefix}xp setlevel <Mention d'un membre, ID d'un membre ou rien> <Niveau définit>`)
                    .addField(`${guildConf[message.guild.id].prefix}xp delete`, `Supprime un membre de la base de donnée.\nExemple: ${guildConf[message.guild.id].prefix}xp delete <Mention d'un membre ou ID d'un membre>`)
                    .addField(`${guildConf[message.guild.id].prefix}money add`, `Ajoute de l'argent sur le solde.\nExemple: ${guildConf[message.guild.id].prefix}money add <argents ajoutés> <Mention d'un membre, ID d'un membre ou rien>`)
                    .addField(`${guildConf[message.guild.id].prefix}money remove`, `Supprime de l'argent sur le solde.\nExemple: ${guildConf[message.guild.id].prefix}money remove <argents enlevés> <Mention d'un membre, ID d'un membre ou rien>`)
                    .setTimestamp()
                    .setFooter(client.user.tag, client.user.displayAvatarURL({
                        dynamic: true
                    }));
                message.channel.send(embed5);
            }
        }
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
});

// TODO Commands - Poll
client.on("message", message => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    try {
        if (command === "poll") {
            const commandeType = args[0];
            if (commandeType === 'simple') {
                let splitCommand = message.content.split(" ");
                let time = parseFloat(splitCommand.slice(2).shift());
                let unity = args[2];
                let question = splitCommand.slice(4) + '';
                let realTime = timeConverter2(time, unity);
                if (lastChar(question) != "?" || " ?") {
                    question += " ?"
                }
                if (args[1] === "full" && args[2] === "time") {
                    return message.channel.send(`${message.author} a commencé le sondage \`${question.replace(/,/g, ' ')}\``)
                    .then(async function (message) {
                        let reactionArray = [];
                        reactionArray[0] = await message.react(emojiList[0]);
                        reactionArray[1] = await message.react(emojiList[1]);
                    })
                }
                if (time > 1) {
                    unity += "s";
                }
                    if (realTime >= 30000) {
                        message.channel.send(`${message.author} a commencé le sondage \`${question.replace(/,/g, ' ')}\` le sondage prend fin dans \`${time} ${unity}\`.`)
                            .then(async function (message) {
                                let reactionArray = [];
                                reactionArray[0] = await message.react(emojiList[0]);
                                reactionArray[1] = await message.react(emojiList[1]);

                                if (realTime) {
                                    message.channel.messages.fetch(message.id)
                                        .then(async function (message) {
                                            await sleep(realTime)
                                            var reactionCountsArray = [];
                                            for (var i = 0; i < reactionArray.length; i++) {
                                                reactionCountsArray[i] = message.reactions.cache.get(emojiList[i]).count - 1;
                                            }

                                            var max = -Infinity,
                                                indexMax = [];
                                            for (var i = 0; i < reactionCountsArray.length; ++i)
                                                if (reactionCountsArray[i] > max) {
                                                    max = reactionCountsArray[i], indexMax = [i];
                                                } else if (reactionCountsArray[i] === max) {
                                                    indexMax.push(i);
                                                }

                                            var winnersText = "";
                                            if (reactionCountsArray[indexMax[0]] == 0) {
                                                winnersText = "Aucun vote !"
                                            } else {
                                                for (var i = 0; i < indexMax.length; i++) {
                                                    winnersText += emojiList[indexMax[i]] + " : " + reactionCountsArray[indexMax[i]] + " vote(s)\n";
                                                }
                                            }
                                            message.channel.send(`**Résultat pour** \`${question.replace(/,/g, ' ')}\`\n${winnersText}`);
                                    });
                                }
                            })
                    } else {
                        message.channel.send(`Impossible de commencer le sondage car le sondage ne peut pas durer moins de 30 seconde !`);
                    }
            }
            if (commandeType === "advanced") {
                let splitCommand = message.content.split(" ");
                let time = parseFloat(splitCommand.slice(2).shift());
                let unity = args[2];
                let secondSection = (splitCommand.slice(4) + '').replace(/,/g, ' ');
                let secondSectionSplitted = secondSection.split(';');
                let question = secondSectionSplitted.slice(-1)[0];
                let options = secondSectionSplitted.slice(0, secondSectionSplitted.length - 1);
                let realTime = timeConverter2(time, unity);
                if (options.length > 20) {
                    options = options.slice(0, 20)
                }
                if (lastChar(question) != "?" || " ?") {
                    question += " ?"
                }
                if (args[1] === "full" && args[2] === "time") {
                    let optionText = ""
                    let count = 0;
                    for (var option in options) {
                        optionText += "\n" + emojiLetterList[count] + " - " + options[option]
                        count += 1
                    }
                    return message.channel.send(`${message.author} a commencé le sondage \`${question.replace(/,/g, ' ')}\`${optionText}`)
                    .then(async function (message) {
                        let reactionArray = [];
                        let count = 0;
                        for (var option in options) {
                            reactionArray[count] = await message.react(emojiLetterList[count]);
                            count += 1
                        }
                    })
                }
                if (time > 1) {
                    unity += "s";
                }
                    if (realTime >= 30000) {
                        let optionText = ""
                        let count = 0;
                        for (var option in options) {
                            optionText += "\n" + emojiLetterList[count] + " - " + options[option]
                            count += 1
                        }
                        message.channel.send(`${message.author} a commencé le sondage \`${question.replace(/,/g, ' ')}\` le sondage prend fin dans \`${time} ${unity}\`.${optionText}`)
                            .then(async function (message) {
                                let reactionArray = [];
                                let count = 0;
                                for (var option in options) {
                                    reactionArray[count] = await message.react(emojiLetterList[count]);
                                    count += 1
                                }

                                if (realTime) {
                                    message.channel.messages.fetch(message.id)
                                        .then(async function (message) {
                                            await sleep(realTime)
                                            var reactionCountsArray = [];
                                            for (var i = 0; i < reactionArray.length; i++) {
                                                reactionCountsArray[i] = message.reactions.cache.get(emojiLetterList[i]).count - 1;
                                            }

                                            var max = -Infinity,
                                                indexMax = [];
                                            for (var i = 0; i < reactionCountsArray.length; ++i)
                                                if (reactionCountsArray[i] > max) {
                                                    max = reactionCountsArray[i], indexMax = [i];
                                                } else if (reactionCountsArray[i] === max) {
                                                    indexMax.push(i);
                                                }

                                            var winnersText = "";
                                            if (reactionCountsArray[indexMax[0]] == 0) {
                                                winnersText = "Aucun Vote !"
                                            } else {
                                                for (var i = 0; i < indexMax.length; i++) {
                                                    winnersText += emojiLetterList[indexMax[i]] + ": " + options[indexMax[i]] + " : " + reactionCountsArray[indexMax[i]] + " vote(s)\n";
                                                }
                                            }
                                            message.channel.send(`**Résultat pour** \`${question.replace(/,/g, ' ')}\`\n${winnersText}`);
                                    });
                                }
                            })
                    } else {
                        message.channel.send(`Impossible de commencer le sondage car le sondage ne peut pas durer moins de 30 seconde !`);
                    }
            }
            if (commandeType === "help") {
                const embedpollhelp = new MessageEmbed()
                    .setColor(`${config.colorembed}`)
                    .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                        dynamic: true
                    }) || "")
                    .setTitle('Help Sondage')
                    .setDescription(`__**Si une commande n'as pas d'exemple cela veut dire qu'il ne faut pas spécifier d'argument !**__\n**Options:**\nListe des unités de temps: jour, heure, minute, seconde\nExemple de sondage sans fin: **${guildConf[message.guild.id].prefix}poll simple full time DiscordBot.js est-il le meilleur bot Discord ?** (fonctionne pour un sondage simple ou avancé)`)
                    .addField(`${guildConf[message.guild.id].prefix}poll simple`, `Crée un sondage en répondant avec ✅ ou ❌\nExemple: **${guildConf[message.guild.id].prefix}poll simple 30 seconde Tu aime DiscordBot.js ?**`)
                    .addField(`${guildConf[message.guild.id].prefix}poll advanced`, `Crée un sondage en répondant avec des options (émojis)\nExemple: **${guildConf[message.guild.id].prefix}poll advanced 5 minute :ice_cream:;:icecream:;Glace au chocolat ou à la vanille ?**`)
                    .setTimestamp()
                    .setFooter(client.user.tag, client.user.displayAvatarURL({
                        dynamic: true
                    }));
                message.channel.send(embedpollhelp)
            }
        }
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
});

// TODO Commands - Système d'xp
client.on('message', async message => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    const application = await client.fetchApplication()
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    try {
        if (command === 'xp') {
            const commandeType = args[0];
            let user1 = message.mentions.users.first() || client.users.cache.get(args[1]) || message.author;
            let user2 = message.mentions.users.first() || client.users.cache.get(args[1]);
            let amount = args[2];
            let output1 = await dl.Fetch(user1.id);
            if (commandeType === 'info') {
                const embedxpinfo = new MessageEmbed()
                    .setColor(`${config.colorembed}`)
                    .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                        dynamic: true
                    }) || "")
                    .setTitle('Xp Info')
                    .setDescription(`${user1}`)
                    .addField(`Classement`, `${output1.placement}`)
                    .addField(`Niveaux`, `${output1.level}`)
                    .addField(`Xp`, `${output1.xp}`)
                    .setTimestamp()
                    .setFooter(client.user.tag, client.user.displayAvatarURL({
                        dynamic: true
                    }));
                message.channel.send(embedxpinfo)
            }

            if (commandeType === 'setxp') {
                if (message.author.id !== application.owner.id) return message.reply("Désolé, Vous n'avez pas les permissions !");
                if (!user1) return message.reply(`Vous devez mentionné un membre !`);
                await dl.SetXp(user1.id, amount)
                const embedsetxp = new MessageEmbed()
                    .setColor(`${config.colorembed}`)
                    .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                        dynamic: true
                    }) || "")
                    .setTitle('Xp Reçue')
                    .setDescription(`${user1}`)
                    .addField(`Xp Définie`, `${amount}`)
                    .setTimestamp()
                    .setFooter(client.user.tag, client.user.displayAvatarURL({
                        dynamic: true
                    }));
                message.channel.send(embedsetxp)
            }

            if (commandeType === 'setlevel') {
                if (message.author.id !== application.owner.id) return message.reply("Désolé, Vous n'avez pas les permissions !");
                if (!user1) return message.reply(`Vous devez mentionné un membre !`);
                await dl.SetLevel(user1.id, amount)
                const embedsetlevel = new MessageEmbed()
                    .setColor(`${config.colorembed}`)
                    .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                        dynamic: true
                    }) || "")
                    .setTitle('Niveaux Reçue')
                    .setDescription(`${user1}`)
                    .addField(`Niveaux Définie`, `${amount}`)
                    .setTimestamp()
                    .setFooter(client.user.tag, client.user.displayAvatarURL({
                        dynamic: true
                    }));
                message.channel.send(embedsetlevel)
            }

            if (commandeType === 'leaderboard') {
                if (message.mentions.users.first()) {
                    var output = await dl.Leaderboard({
                        search: message.mentions.users.first().id
                    })
                    const embedxpstats1 = new MessageEmbed()
                        .setColor(`${config.colorembed}`)
                        .setAuthor(`${message.mentions.users.first().tag} (${message.mentions.users.first().id})`, message.mentions.users.first().displayAvatarURL({
                            dynamic: true
                        }) || "")
                        .setTitle('Xp Stats')
                        .addField(`Classement`, `${output.placement}`)
                        .addField(`Niveaux`, `${output1.level}`)
                        .addField(`Xp`, `${output1.xp}`)
                        .setTimestamp()
                        .setFooter(client.user.tag, client.user.displayAvatarURL({
                            dynamic: true
                        }));
                    message.channel.send(embedxpstats1)
                } else {
                    dl.Leaderboard({
                        limit: 20
                    }).then(async users => {
                        if (users[0]) var place1 = await client.users.fetch(users[0].userid)
                        if (users[1]) var place2 = await client.users.fetch(users[1].userid)
                        if (users[2]) var place3 = await client.users.fetch(users[2].userid)
                        if (users[3]) var place4 = await client.users.fetch(users[3].userid)
                        if (users[4]) var place5 = await client.users.fetch(users[4].userid)
                        if (users[5]) var place6 = await client.users.fetch(users[5].userid)
                        if (users[6]) var place7 = await client.users.fetch(users[6].userid)
                        if (users[7]) var place8 = await client.users.fetch(users[7].userid)
                        if (users[8]) var place9 = await client.users.fetch(users[8].userid)
                        if (users[9]) var place10 = await client.users.fetch(users[9].userid)
                        if (users[10]) var place11 = await client.users.fetch(users[10].userid)
                        if (users[11]) var place12 = await client.users.fetch(users[11].userid)
                        if (users[12]) var place13 = await client.users.fetch(users[12].userid)
                        if (users[13]) var place14 = await client.users.fetch(users[13].userid)
                        if (users[14]) var place15 = await client.users.fetch(users[14].userid)
                        if (users[15]) var place16 = await client.users.fetch(users[15].userid)
                        if (users[16]) var place17 = await client.users.fetch(users[16].userid)
                        if (users[17]) var place18 = await client.users.fetch(users[17].userid)
                        if (users[18]) var place19 = await client.users.fetch(users[18].userid)
                        if (users[19]) var place20 = await client.users.fetch(users[19].userid)
                        const embedxpstats2 = new MessageEmbed()
                            .setColor(`${config.colorembed}`)
                            .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                                dynamic: true
                            }) || "")
                            .setTitle('Xp Stats')
                            .setDescription(`Classement`)
                            .addField(`#1 - ${place1 && `${place1.tag} (${place1.id})` || 'Personne'}`, `Niveaux ${users[0] && users[0].level || 'Aucun'}\nXp ${users[0] && users[0].xp || 'Aucun'}`)
                            .addField(`#2 - ${place2 && `${place2.tag} (${place2.id})` || 'Personne'}`, `Niveaux ${users[1] && users[1].level || 'Aucun'}\nXp ${users[1] && users[1].xp || 'Aucun'}`)
                            .addField(`#3 - ${place3 && `${place3.tag} (${place3.id})` || 'Personne'}`, `Niveaux ${users[2] && users[2].level || 'Aucun'}\nXp ${users[2] && users[2].xp || 'Aucun'}`)
                            .addField(`#4 - ${place4 && `${place4.tag} (${place4.id})` || 'Personne'}`, `Niveaux ${users[3] && users[3].level || 'Aucun'}\nXp ${users[3] && users[3].xp || 'Aucun'}`)
                            .addField(`#5 - ${place5 && `${place5.tag} (${place5.id})` || 'Personne'}`, `Niveaux ${users[4] && users[4].level || 'Aucun'}\nXp ${users[4] && users[4].xp || 'Aucun'}`)
                            .addField(`#6 - ${place6 && `${place6.tag} (${place6.id})` || 'Personne'}`, `Niveaux ${users[5] && users[5].level || 'Aucun'}\nXp ${users[5] && users[5].xp || 'Aucun'}`)
                            .addField(`#7 - ${place7 && `${place7.tag} (${place7.id})` || 'Personne'}`, `Niveaux ${users[6] && users[6].level || 'Aucun'}\nXp ${users[6] && users[6].xp || 'Aucun'}`)
                            .addField(`#8 - ${place8 && `${place8.tag} (${place8.id})` || 'Personne'}`, `Niveaux ${users[7] && users[7].level || 'Aucun'}\nXp ${users[7] && users[7].xp || 'Aucun'}`)
                            .addField(`#9 - ${place9 && `${place9.tag} (${place9.id})` || 'Personne'}`, `Niveaux ${users[8] && users[8].level || 'Aucun'}\nXp ${users[8] && users[8].xp || 'Aucun'}`)
                            .addField(`#10 - ${place10 && `${place10.tag} (${place10.id})` || 'Personne'}`, `Niveaux ${users[9] && users[9].level || 'Aucun'}\nXp ${users[9] && users[9].xp || 'Aucun'}`)
                            .addField(`#11 - ${place11 && `${place11.tag} (${place11.id})` || 'Personne'}`, `Niveaux ${users[10] && users[10].level || 'Aucun'}\nXp ${users[10] && users[10].xp || 'Aucun'}`)
                            .addField(`#12 - ${place12 && `${place12.tag} (${place12.id})` || 'Personne'}`, `Niveaux ${users[11] && users[11].level || 'Aucun'}\nXp ${users[11] && users[11].xp || 'Aucun'}`)
                            .addField(`#13 - ${place13 && `${place13.tag} (${place13.id})` || 'Personne'}`, `Niveaux ${users[12] && users[12].level || 'Aucun'}\nXp ${users[12] && users[12].xp || 'Aucun'}`)
                            .addField(`#14 - ${place14 && `${place14.tag} (${place14.id})` || 'Personne'}`, `Niveaux ${users[13] && users[13].level || 'Aucun'}\nXp ${users[13] && users[13].xp || 'Aucun'}`)
                            .addField(`#15 - ${place15 && `${place15.tag} (${place15.id})` || 'Personne'}`, `Niveaux ${users[14] && users[14].level || 'Aucun'}\nXp ${users[14] && users[14].xp || 'Aucun'}`)
                            .addField(`#16 - ${place16 && `${place16.tag} (${place16.id})` || 'Personne'}`, `Niveaux ${users[15] && users[15].level || 'Aucun'}\nXp ${users[15] && users[15].xp || 'Aucun'}`)
                            .addField(`#17 - ${place17 && `${place17.tag} (${place17.id})` || 'Personne'}`, `Niveaux ${users[16] && users[16].level || 'Aucun'}\nXp ${users[16] && users[16].xp || 'Aucun'}`)
                            .addField(`#18 - ${place18 && `${place18.tag} (${place18.id})` || 'Personne'}`, `Niveaux ${users[17] && users[17].level || 'Aucun'}\nXp ${users[17] && users[17].xp || 'Aucun'}`)
                            .addField(`#19 - ${place19 && `${place19.tag} (${place19.id})` || 'Personne'}`, `Niveaux ${users[18] && users[18].level || 'Aucun'}\nXp ${users[18] && users[18].xp || 'Aucun'}`)
                            .addField(`#20 - ${place20 && `${place20.tag} (${place20.id})` || 'Personne'}`, `Niveaux ${users[19] && users[19].level || 'Aucun'}\nXp ${users[19] && users[19].xp || 'Aucun'}`)
                            .setTimestamp()
                            .setFooter(client.user.tag, client.user.displayAvatarURL({
                                dynamic: true
                            }));
                        message.channel.send(embedxpstats2)
                    })
                }
            }

            if (commandeType == 'delete') {
                if (message.author.id !== application.owner.id) return message.reply("Désolé, Vous n'avez pas les permissions !");
                if (!user2) return message.reply(`S'il vous plait mentionné un membre valide qui se trouve dans la base de donnée !`)
                let output = await dl.Delete(user2.id)
                if (output.deleted == true) return message.reply('Le membre a bien était éffacé de la base de donnée')
            }

            if (commandeType === "help") {
                const xphelp = new MessageEmbed()
                    .setColor(`${config.colorembed}`)
                    .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                        dynamic: true
                    }) || "")
                    .setTitle('Help Xp')
                    .setDescription(`__**Si une commande n'as pas d'exemple cela veut dire qu'il ne faut pas spécifier d'argument !**__`)
                    .addField(`${guildConf[message.guild.id].prefix}xp info`, `Affiche le nombre d'xp et de niveau que vous avez.`)
                    .addField(`${guildConf[message.guild.id].prefix}xp leaderboard`, `Affiche le classement d'un/des membre(s)\nExemple: ${guildConf[message.guild.id].prefix}xp leaderboard <Mention d'un membre ou rien>`)
                    .setTimestamp()
                    .setFooter(client.user.tag, client.user.displayAvatarURL({
                        dynamic: true
                    }));
                message.channel.send(xphelp)
            }
        }
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
})

// TODO Commands - Setup Serveur
client.on("message", async message => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    try {
        if (command === "setup-server") {
            if (!message.member.hasPermission(["ADMINISTRATOR"])) return message.reply("Désolé, Vous n'avez pas les permissions !");
            const commandeType = args[0];
            let AdminRoleActive = true;
            let ModoRoleActive = true;
            let NotifRoleActive = true;
            let BotRoleActive = true;
            let GeneraleCategoryActive = true;
            let InformationsChannelActive = true;
            let AccueilChannelActive = true;
            let AnnoncesChannelActive = true;
            let PartenaireChannelActive = true;
            let ReglesChannelActive = true;
            let RolesChannelActive = true;
            let PrésentationChannelActive = true;
            let SondageChannelActive = true;
            let QuestionsIdéesChannelActive = true;
            let LogsChannelActive = true;
            let BotCommandeChannelActive = true;
            let NewsChannelActive = true;
            let SalonTextuelCategoryActive = true;
            let ChatTextuelChannelActive = true;
            let MédiaChannelActive = true;
            let SalonVocauxCategoryActive = true;
            let ChatVocalChannel1Active = true;
            let ChatVocalChannel2Active = true;
            let SalonModoCategoryActive = true;
            let ChatTextuelModoChannelActive = true;
            let BotCommandeModoChannelActive = true;
            let ChatVocalModoChannelActive = true;
            let AFKCategoryActive = true;
            let AFKChannelActive = true;
            let rulesText = undefined;
            let AdminRoleName = `Administrateur`;
            let AdminRoleColor = `#FF0000`;
            let ModoRoleName = `Modérateur`;
            let ModoRoleColor = `#FF8C00`;
            let NotifRoleName = `Notifications`;
            let NotifRoleColor = `#1E90FF`;
            let BotRoleName = `Bot`;
            let BotRoleColor = `#FFD700`;
            let GeneraleCategoryName = `👥Général`;
            let InformationsChannelName = `🌍informations`;
            let AccueilChannelName = `${welcomeName}`;
            let AnnoncesChannelName = `📢annonces`;
            let PartenaireChannelName = `🤝partenariat`;
            let ReglesChannelName = `⛔règles`;
            let RolesChannelName = `🔗rôles`;
            let PrésentationChannelName = `👤présentation`;
            let SondageChannelName = `📊sondage`;
            let QuestionsIdéesChannelName = `📋questions/idées`;
            let LogsChannelName = `${logsName}`;
            let BotCommandeChannelName = `🤖bot-commande`;
            let NewsChannelName = `${newsName}`;
            let SalonTextuelCategoryName = `💬Salons textuels`;
            let ChatTextuelChannelName = `💬chat-textuel`;
            let MédiaChannelName = `📸médias`;
            let SalonVocauxCategoryName = `🔊Salons vocaux`;
            let ChatVocalChannel1Name = `🔊Chat Vocal #1`;
            let ChatVocalChannel2Name = `🔊Chat Vocal #2`;
            let SalonModoCategoryName = `🔧Salon Modérateur`;
            let ChatTextuelModoChannelName = `💬chat-textuel-modérateur`;
            let BotCommandeModoChannelName = `🤖bot-commande-Modérateur`;
            let ChatVocalModoChannelName = `🔊Chat Vocal Modérateur`;
            let AFKCategoryName = `💤AFK`;
            let AFKChannelName = `💤AFK💤`;
            let AdminRoleTopic = undefined;
            let ModoRoleTopic = undefined;
            let NotifRoleTopic = undefined;
            let BotRoleTopic = undefined;
            let InformationsChannelTopic = undefined;
            let AccueilChannelTopic = undefined;
            let AnnoncesChannelTopic = undefined;
            let PartenaireChannelTopic = undefined;
            let ReglesChannelTopic = undefined;
            let RolesChannelTopic = undefined;
            let PrésentationChannelTopic = undefined;
            let SondageChannelTopic = undefined;
            let QuestionsIdéesChannelTopic = undefined;
            let LogsChannelTopic = undefined;
            let BotCommandeChannelTopic = undefined;
            let NewsChannelTopic = undefined;
            let ChatTextuelChannelTopic = undefined;
            let MédiaChannelTopic = undefined;
            let ChatTextuelModoChannelTopic = undefined;
            let BotCommandeModoChannelTopic = undefined;
            let AdminRole = message.guild.roles.cache.find(r => r.name === AdminRoleName);
            let ModoRole = message.guild.roles.cache.find(r => r.name === ModoRoleName);
            let NotifRole = message.guild.roles.cache.find(r => r.name === NotifRoleName);
            let BotRole = message.guild.roles.cache.find(r => r.name === BotRoleName);
            let GeneraleCategory = message.guild.channels.cache.find(c => c.name === GeneraleCategoryName);
            let InformationsChannel = message.guild.channels.cache.find(c => c.name === InformationsChannelName);
            let AccueilChannel = message.guild.channels.cache.find(c => c.name === AccueilChannelName);
            let AnnoncesChannel = message.guild.channels.cache.find(c => c.name === AnnoncesChannelName);
            let PartenaireChannel = message.guild.channels.cache.find(c => c.name === PartenaireChannelName);
            let ReglesChannel = message.guild.channels.cache.find(c => c.name === ReglesChannelName);
            let RolesChannel = message.guild.channels.cache.find(c => c.name === RolesChannelName);
            let PrésentationChannel = message.guild.channels.cache.find(c => c.name === PrésentationChannelName);
            let SondageChannel = message.guild.channels.cache.find(c => c.name === SondageChannelName);
            let QuestionsIdéesChannel = message.guild.channels.cache.find(c => c.name === QuestionsIdéesChannelName);
            let LogsChannel = message.guild.channels.cache.find(c => c.name === LogsChannelName);
            let BotCommandeChannel = message.guild.channels.cache.find(c => c.name === BotCommandeChannelName);
            let NewsChannel = message.guild.channels.cache.find(c => c.name === NewsChannelName);
            let SalonTextuelCategory = message.guild.channels.cache.find(c => c.name === SalonTextuelCategoryName);
            let ChatTextuelChannel = message.guild.channels.cache.find(c => c.name === ChatTextuelChannelName);
            let MédiaChannel = message.guild.channels.cache.find(c => c.name === MédiaChannelName);
            let SalonVocauxCategory = message.guild.channels.cache.find(c => c.name === SalonVocauxCategoryName);
            let ChatVocalChannel1 = message.guild.channels.cache.find(c => c.name === ChatVocalChannel1Name);
            let ChatVocalChannel2 = message.guild.channels.cache.find(c => c.name === ChatVocalChannel2Name);
            let SalonModoCategory = message.guild.channels.cache.find(c => c.name === SalonModoCategoryName);
            let ChatTextuelModoChannel = message.guild.channels.cache.find(c => c.name === ChatTextuelModoChannelName);
            let BotCommandeModoChannel = message.guild.channels.cache.find(c => c.name === BotCommandeModoChannelName);
            let ChatVocalModoChannel = message.guild.channels.cache.find(c => c.name === ChatVocalModoChannelName);
            let AFKCategory = message.guild.channels.cache.find(c => c.name === AFKCategoryName);
            let AFKChannel = message.guild.channels.cache.find(c => c.name === AFKChannelName);
            if (commandeType === 'rules') {
                const rulesArgs = args.slice(1).join(' ');
                rulesText = rulesArgs;
                return message.channel.send(`Les règles sont maintenant:\n${rulesArgs}`)
            } else if (commandeType === 'roles-administrator') {
                const AdminRoleArgs = args.slice(1).join(' ');
                AdminRoleName = AdminRoleArgs;
                return message.channel.send(`Le nom du rôle Administrateur est maintenant:\n${AdminRoleArgs}`);
            } else if (commandeType === 'roles-administrator-color') {
                const AdminRoleColorArgs = args.slice(1).join(' ');
                AdminRoleColor = AdminRoleColorArgs;
                return message.channel.send(`La couleur du rôle Administrateur est maintenant:\n${AdminRoleColorArgs}`);
            } else if (commandeType === 'roles-moderator') {
                const ModoRoleArgs = args.slice(1).join(' ');
                ModoRoleName = ModoRoleArgs;
                return message.channel.send(`Le nom du rôle Modérateur est maintenant:\n${ModoRoleArgs}`);
            } else if (commandeType === 'roles-moderator-color') {
                const ModoRoleColorArgs = args.slice(1).join(' ');
                ModoRoleColor = ModoRoleColorArgs;
                return message.channel.send(`La couleur du rôle Modérateur est maintenant:\n${ModoRoleColorArgs}`);
            } else if (commandeType === 'roles-notifications') {
                const NotifRoleArgs = args.slice(1).join(' ');
                NotifRoleName = NotifRoleArgs;
                return message.channel.send(`Le nom du rôle Notifications est maintenant:\n${NotifRoleArgs}`);
            } else if (commandeType === 'roles-notifications-color') {
                const NotifRoleColorArgs = args.slice(1).join(' ');
                NotifRoleColor = NotifRoleColorArgs;
                return message.channel.send(`La couleur du rôle Notifications est maintenant:\n${NotifRoleColorArgs}`);
            } else if (commandeType === 'roles-bot') {
                const BotRoleArgs = args.slice(1).join(' ');
                BotRoleName = BotRoleArgs;
                return message.channel.send(`Le nom du rôle Bot est maintenant:\n${BotRoleArgs}`);
            } else if (commandeType === 'roles-bot-color') {
                const BotRoleColorArgs = args.slice(1).join(' ');
                BotRoleColor = BotRoleColorArgs;
                return message.channel.send(`La couleur du rôle Bot est maintenant:\n${BotRoleColorArgs}`);
            } else if (commandeType === 'help') {
                const setuphelp = new MessageEmbed()
                    .setColor(`${config.colorembed}`)
                    .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                        dynamic: true
                    }) || "")
                    .setTitle('Help Setup server')
                    .setDescription(`__**Si une commande n'as pas d'exemple cela veut dire qu'il ne faut pas spécifier d'argument !**__`)
                    .addField(`${guildConf[message.guild.id].prefix}setup-server rules`, `Définit les règles du serveur.\nExemple: ${guildConf[message.guild.id].prefix}setup-server rules <règles>\nLes règles seront écrite dans comme description dans l'embed.`)
                    .addField(`${guildConf[message.guild.id].prefix}setup-server roles-administrator`, `Définit le nom du rôle adminstrateur.\nExemple: ${guildConf[message.guild.id].prefix}setup-server roles-administrator <nom du rôle Administrateur>`)
                    .addField(`${guildConf[message.guild.id].prefix}setup-server roles-administrator-color`, `Définit la couleur du rôle adminstrateur.\nExemple: ${guildConf[message.guild.id].prefix}setup-server roles-administrator-color <couleur du rôle Administrateur>`)
                    .addField(`${guildConf[message.guild.id].prefix}setup-server roles-moderator`, `Définit le nom du rôle modérateur.\nExemple: ${guildConf[message.guild.id].prefix}setup-server roles-moderator <nom du rôle Modérateur>`)
                    .addField(`${guildConf[message.guild.id].prefix}setup-server roles-moderator-color`, `Définit la couleur du rôle modérateur.\nExemple: ${guildConf[message.guild.id].prefix}setup-server roles-moderator-color <couleur du rôle Modérateur>`)
                    .addField(`${guildConf[message.guild.id].prefix}setup-server roles-notifications`, `Définit le nom du rôle notifications.\nExemple: ${guildConf[message.guild.id].prefix}setup-server roles-notifications <nom du rôle Notifications>`)
                    .addField(`${guildConf[message.guild.id].prefix}setup-server roles-notifications-color`, `Définit la couleur du rôle notifications.\nExemple: ${guildConf[message.guild.id].prefix}setup-server roles-notifications-color <couleur du rôle Notifications>`)
                    .addField(`${guildConf[message.guild.id].prefix}setup-server roles-bot`, `Définit le nom du rôle bot.\nExemple: ${guildConf[message.guild.id].prefix}setup-server roles-bot <nom du rôle Bot>`)
                    .addField(`${guildConf[message.guild.id].prefix}setup-server roles-bot-color`, `Définit la couleur du rôle bot.\nExemple: ${guildConf[message.guild.id].prefix}setup-server roles-bot-color <couleur du rôle Bot>`)
                    .addField(`${guildConf[message.guild.id].prefix}setup-server`, `Configure le serveur.`)
                    .setTimestamp()
                    .setFooter(client.user.tag, client.user.displayAvatarURL({
                        dynamic: true
                    }));
                return message.channel.send(setuphelp);
            }

            message.reply("Êtes vous sur de faire ça ?\nÉcrivez **yes** pour effectuer l'action, écrivez **no** pour annuler");
            const collector = new MessageCollector(message.channel, m => m.author.id === message.author.id, {
                time: 10000
            });
            collector.on('collect', async message => {
                if (message.content === "yes" && message.member.hasPermission(["ADMINISTRATOR"])) {

                    if (!AdminRole) {
                        if (AdminRoleActive == false) return console.log(`${AdminRoleName} est désactivés.`);
                        try {
                            AdminRole = await message.guild.roles.create({
                                data: {
                                    name: AdminRoleName,
                                    color: AdminRoleColor,
                                    managed: true,
                                    mentionable: false,
                                    hoist: true,
                                    permissions: ["CREATE_INSTANT_INVITE", "KICK_MEMBERS", "BAN_MEMBERS", "ADD_REACTIONS", "VIEW_AUDIT_LOG", "VIEW_GUILD_INSIGHTS","VIEW_CHANNEL", "SEND_MESSAGES", "SEND_TTS_MESSAGES", "MANAGE_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "READ_MESSAGE_HISTORY","MENTION_EVERYONE", "USE_EXTERNAL_EMOJIS", "CONNECT", "SPEAK", "STREAM", "MUTE_MEMBERS", "DEAFEN_MEMBERS", "MOVE_MEMBERS", "USE_VAD","PRIORITY_SPEAKER", "CHANGE_NICKNAME", "MANAGE_NICKNAMES", "MANAGE_WEBHOOKS", "MANAGE_EMOJIS"]
                                }
                            })
                        } catch (e) {
                            console.log(e.stack);
                        }
                    }

                    if (!ModoRole) {
                        if (ModoRoleActive == false) return console.log(`${ModoRoleName} est désactivés.`);
                        try {
                            ModoRole = await message.guild.roles.create({
                                data: {
                                    name: ModoRoleName,
                                    color: ModoRoleColor,
                                    managed: true,
                                    mentionable: true,
                                    hoist: true,
                                    permissions: ["CREATE_INSTANT_INVITE", "KICK_MEMBERS", "BAN_MEMBERS", "ADD_REACTIONS", "VIEW_CHANNEL", "SEND_MESSAGES", "SEND_TTS_MESSAGES", "MANAGE_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "READ_MESSAGE_HISTORY", "MENTION_EVERYONE", "USE_EXTERNAL_EMOJIS", "CONNECT", "SPEAK", "STREAM", "MUTE_MEMBERS", "MOVE_MEMBERS", "USE_VAD", "PRIORITY_SPEAKER", "CHANGE_NICKNAME", "MANAGE_NICKNAMES"]
                                }
                            })
                        } catch (e) {
                            console.log(e.stack);
                        }
                    }

                    if (!NotifRole) {
                        if (NotifRoleActive == false) return console.log(`${NotifRoleName} est désactivés.`);
                        try {
                            NotifRole = await message.guild.roles.create({
                                data: {
                                    name: NotifRoleName,
                                    color: NotifRoleColor,
                                    managed: true,
                                    mentionable: false,
                                    hoist: false,
                                    permissions: ["ADD_REACTIONS", "VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS", "READ_MESSAGE_HISTORY", "CONNECT", "SPEAK", "STREAM", "USE_VAD"]
                                }
                            })
                        } catch (e) {
                            console.log(e.stack);
                        }
                    }

                    if (!BotRole) {
                        if (BotRoleActive == false) return console.log(`${BotRoleName} est désactivés.`);
                        try {
                            BotRole = await message.guild.roles.create({
                                data: {
                                    name: BotRoleName,
                                    color: BotRoleColor,
                                    managed: true,
                                    mentionable: false,
                                    hoist: true,
                                    permissions: ["ADMINISTRATOR", "CREATE_INSTANT_INVITE", "MANAGE_ROLES", "MANAGE_CHANNELS", "MANAGE_GUILD", "KICK_MEMBERS", "BAN_MEMBERS", "ADD_REACTIONS", "VIEW_AUDIT_LOG", "VIEW_GUILD_INSIGHTS","VIEW_CHANNEL", "SEND_MESSAGES", "SEND_TTS_MESSAGES", "MANAGE_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "READ_MESSAGE_HISTORY","MENTION_EVERYONE", "USE_EXTERNAL_EMOJIS", "CONNECT", "SPEAK", "STREAM", "MUTE_MEMBERS", "DEAFEN_MEMBERS", "MOVE_MEMBERS", "USE_VAD","PRIORITY_SPEAKER", "CHANGE_NICKNAME", "MANAGE_NICKNAMES", "MANAGE_WEBHOOKS", "MANAGE_EMOJIS"]
                                }
                            })
                        } catch (e) {
                            console.log(e.stack);
                        }
                    }
                setTimeout(async function () {
                    const embedregles = new MessageEmbed()
                        .setColor(`${config.colorembed}`)
                        .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                            dynamic: true
                        }) || "")
                        .setTitle(`Règles de ${message.guild.name}:`)
                        .setDescription(`${rulesText || `Aucune règles ont était définis !`}`)
                        .setTimestamp()
                        .setFooter(client.user.tag, client.user.displayAvatarURL({
                            dynamic: true
                        }));
                    if (BotRole) {
                        if (message.guild.members.cache.get(client.user.id).roles.cache.has(BotRole.id)) {
                            console.log(`${client.user.username} (${client.user.id}) à déjà le rôle ${BotRoleName} !`);
                        } else if (!message.guild.members.cache.get(client.user.id).roles.cache.has(BotRole.id)) {
                            message.guild.members.cache.get(client.user.id).roles.add(BotRole);
                        };
                    }
                    if (!GeneraleCategory) {
                        if (GeneraleCategoryActive == false) return console.log(`${GeneraleCategoryName} est désactivés.`);
                        await message.guild.channels.create(GeneraleCategoryName,{ type: 'category'}).then(channel => {
                            channel.setPosition("0")
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === '@everyone'), {
                                SEND_MESSAGES: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === AdminRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === ModoRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === NotifRoleName), {
                                SEND_MESSAGES: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === BotRoleName), {
                                SEND_MESSAGES: true
                            });
                        });
                    }
                    if (!InformationsChannel) {
                        if (InformationsChannelActive == false) return console.log(`${InformationsChannelName} est désactivés.`);
                        await message.guild.channels.create(InformationsChannelName,{ type: 'text'}).then(channel => {
                            let category = message.guild.channels.cache.find(c => c.name == GeneraleCategoryName && c.type == "category");
                            if (category) {
                                channel.setParent(category.id);
                            }
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === '@everyone'), {
                                SEND_MESSAGES: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === AdminRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === ModoRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === NotifRoleName), {
                                SEND_MESSAGES: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === BotRoleName), {
                                SEND_MESSAGES: true
                            });
                        });
                    }
                    if (!AccueilChannel) {
                        if (AccueilChannelActive == false) return console.log(`${AccueilChannelName} est désactivés.`);
                        await message.guild.channels.create(AccueilChannelName,{ type: 'text'}).then(channel => {
                            let category = message.guild.channels.cache.find(c => c.name == GeneraleCategoryName && c.type == "category");
                            if (category) {
                                channel.setParent(category.id);
                            }
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === '@everyone'), {
                                SEND_MESSAGES: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === AdminRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === ModoRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === NotifRoleName), {
                                SEND_MESSAGES: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === BotRoleName), {
                                SEND_MESSAGES: true
                            });
                        });
                    }
                    if (!AnnoncesChannel) {
                        if (AnnoncesChannelActive == false) return console.log(`${AnnoncesChannelName} est désactivés.`);
                        await message.guild.channels.create(AnnoncesChannelName,{ type: 'text'}).then(channel => {
                            let category = message.guild.channels.cache.find(c => c.name == GeneraleCategoryName && c.type == "category");
                            if (category) {
                                channel.setParent(category.id);
                            }
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === '@everyone'), {
                                SEND_MESSAGES: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === AdminRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === ModoRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === NotifRoleName), {
                                SEND_MESSAGES: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === BotRoleName), {
                                SEND_MESSAGES: true
                            });
                        });
                    }
                    if (!PartenaireChannel) {
                        if (PartenaireChannelActive == false) return console.log(`${PartenaireChannelName} est désactivés.`);
                        await message.guild.channels.create(PartenaireChannelName,{ type: 'text'}).then(channel => {
                            let category = message.guild.channels.cache.find(c => c.name == GeneraleCategoryName && c.type == "category");
                            if (category) {
                                channel.setParent(category.id);
                            }
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === '@everyone'), {
                                SEND_MESSAGES: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === AdminRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === ModoRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === NotifRoleName), {
                                SEND_MESSAGES: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === BotRoleName), {
                                SEND_MESSAGES: true
                            });
                        });
                    }
                    if (!ReglesChannel) {
                        if (ReglesChannelActive == false) return console.log(`${ReglesChannelName} est désactivés.`);
                        await message.guild.channels.create(ReglesChannelName,{ type: 'text'}).then(channel => {
                            let category = message.guild.channels.cache.find(c => c.name == GeneraleCategoryName && c.type == "category");
                            if (category) {
                                channel.setParent(category.id);
                            }
                            channel.send(embedregles).then(async function (message) {
                                message.react("✅");
                            })
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === '@everyone'), {
                                SEND_MESSAGES: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === AdminRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === ModoRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === NotifRoleName), {
                                SEND_MESSAGES: false
                            })
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === BotRoleName), {
                                SEND_MESSAGES: true
                            });
                        });
                    }
                    if (!RolesChannel) {
                        if (RolesChannelActive == false) return console.log(`${RolesChannelName} est désactivés.`);
                        await message.guild.channels.create(RolesChannelName,{ type: 'text'}).then(channel => {
                            let category = message.guild.channels.cache.find(c => c.name == GeneraleCategoryName && c.type == "category");
                            if (category) {
                                channel.setParent(category.id);
                            }
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === '@everyone'), {
                                SEND_MESSAGES: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === AdminRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === ModoRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === NotifRoleName), {
                                SEND_MESSAGES: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === BotRoleName), {
                                SEND_MESSAGES: true
                            });
                        });
                    }
                    if (!PrésentationChannel) {
                        if (PrésentationChannelActive == false) return console.log(`${PrésentationChannelName} est désactivés.`);
                        await message.guild.channels.create(PrésentationChannelName,{ type: 'text'}).then(channel => {
                            let category = message.guild.channels.cache.find(c => c.name == GeneraleCategoryName && c.type == "category");
                            if (category) {
                                channel.setParent(category.id);
                            }
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === '@everyone'), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === AdminRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === ModoRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === NotifRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === BotRoleName), {
                                SEND_MESSAGES: true
                            });
                        });
                    }
                    if (!SondageChannel) {
                        if (SondageChannelActive == false) return console.log(`${SondageChannelName} est désactivés.`);
                        await message.guild.channels.create(SondageChannelName,{ type: 'text'}).then(channel => {
                            let category = message.guild.channels.cache.find(c => c.name == GeneraleCategoryName && c.type == "category");
                            if (category) {
                                channel.setParent(category.id);
                            }
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === '@everyone'), {
                                SEND_MESSAGES: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === AdminRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === ModoRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === NotifRoleName), {
                                SEND_MESSAGES: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === BotRoleName), {
                                SEND_MESSAGES: true
                            });
                        });
                    }
                    if (!QuestionsIdéesChannel) {
                        if (QuestionsIdéesChannelActive == false) return console.log(`${QuestionsIdéesChannelName} est désactivés.`);
                        await message.guild.channels.create(QuestionsIdéesChannelName,{ type: 'text'}).then(channel => {
                            let category = message.guild.channels.cache.find(c => c.name == GeneraleCategoryName && c.type == "category");
                            if (category) {
                                channel.setParent(category.id);
                            }
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === '@everyone'), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === AdminRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === ModoRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === NotifRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === BotRoleName), {
                                SEND_MESSAGES: true
                            });
                        });
                    }
                    if (!LogsChannel) {
                        if (LogsChannelActive == false) return console.log(`${LogsChannelName} est désactivés.`);
                        await message.guild.channels.create(LogsChannelName,{ type: 'text'}).then(channel => {
                            let category = message.guild.channels.cache.find(c => c.name == GeneraleCategoryName && c.type == "category");
                            if (category) {
                                channel.setParent(category.id);
                            }
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === '@everyone'), {
                                CONNECT: false,
                                SPEAK: false,
                                SEND_MESSAGES: false,
                                VIEW_CHANNEL: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === AdminRoleName), {
                                CONNECT: true,
                                SPEAK: true,
                                SEND_MESSAGES: true,
                                VIEW_CHANNEL: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === ModoRoleName), {
                                CONNECT: false,
                                SPEAK: false,
                                SEND_MESSAGES: false,
                                VIEW_CHANNEL: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === NotifRoleName), {
                                CONNECT: false,
                                SPEAK: false,
                                SEND_MESSAGES: false,
                                VIEW_CHANNEL: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === BotRoleName), {
                                CONNECT: true,
                                SPEAK: true,
                                SEND_MESSAGES: true,
                                VIEW_CHANNEL: true
                            });
                        });
                    }
                    if (!BotCommandeChannel) {
                        if (BotCommandeChannelActive == false) return console.log(`${BotCommandeChannelName} est désactivés.`);
                        await message.guild.channels.create(BotCommandeChannelName,{ type: 'text'}).then(channel => {
                            let category = message.guild.channels.cache.find(c => c.name == GeneraleCategoryName && c.type == "category");
                            if (category) {
                                channel.setParent(category.id);
                            }
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === '@everyone'), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === AdminRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === ModoRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === NotifRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === BotRoleName), {
                                SEND_MESSAGES: true
                            });
                        });
                    }
                    if (!NewsChannel) {
                        if (NewsChannelActive == false) return console.log(`${NewsChannelName} est désactivés.`);
                        await message.guild.channels.create(NewsChannelName,{ type: 'text'}).then(channel => {
                            let category = message.guild.channels.cache.find(c => c.name == GeneraleCategoryName && c.type == "category");
                            if (category) {
                                channel.setParent(category.id);
                            }
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === '@everyone'), {
                                SEND_MESSAGES: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === AdminRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === ModoRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === NotifRoleName), {
                                SEND_MESSAGES: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === BotRoleName), {
                                SEND_MESSAGES: true
                            });
                        });
                    }
                    if (!SalonTextuelCategory) {
                        if (SalonTextuelCategoryActive == false) return console.log(`${SalonTextuelCategoryName} est désactivés.`);
                        await message.guild.channels.create(SalonTextuelCategoryName,{ type: 'category'}).then(channel => {
                            channel.setPosition("1");
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === '@everyone'), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === AdminRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === ModoRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === NotifRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === BotRoleName), {
                                SEND_MESSAGES: true
                            });
                        });
                    }
                    if (!ChatTextuelChannel) {
                        if (ChatTextuelChannelActive == false) return console.log(`${ChatTextuelChannelName} est désactivés.`);
                        await message.guild.channels.create(ChatTextuelChannelName,{ type: 'text'}).then(channel => {
                            let category = message.guild.channels.cache.find(c => c.name == SalonTextuelCategoryName && c.type == "category");
                            if (category) {
                                channel.setParent(category.id);
                            }
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === '@everyone'), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === AdminRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === ModoRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === NotifRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === BotRoleName), {
                                SEND_MESSAGES: true
                            });
                        });
                    }
                    if (!MédiaChannel) {
                        if (MédiaChannelActive == false) return console.log(`${MédiaChannelName} est désactivés.`);
                        await message.guild.channels.create(MédiaChannelName,{ type: 'text'}).then(channel => {
                            let category = message.guild.channels.cache.find(c => c.name == SalonTextuelCategoryName && c.type == "category");
                            if (category) {
                                channel.setParent(category.id);
                            }
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === '@everyone'), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === AdminRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === ModoRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === NotifRoleName), {
                                SEND_MESSAGES: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === BotRoleName), {
                                SEND_MESSAGES: true
                            });
                        });
                    }
                    if (!SalonVocauxCategory) {
                        if (SalonVocauxCategoryActive == false) return console.log(`${SalonVocauxCategoryName} est désactivés.`);
                        await message.guild.channels.create(SalonVocauxCategoryName,{ type: 'category'}).then(channel => {
                            channel.setPosition("2");
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === '@everyone'), {
                                CONNECT: true,
                                SPEAK: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === AdminRoleName), {
                                CONNECT: true,
                                SPEAK: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === ModoRoleName), {
                                CONNECT: true,
                                SPEAK: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === NotifRoleName), {
                                CONNECT: true,
                                SPEAK: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === BotRoleName), {
                                CONNECT: true,
                                SPEAK: true
                            });
                        });
                    }
                    if (!ChatVocalChannel1) {
                        if (ChatVocalChannel1Active == false) return console.log(`${ChatVocalChannel1Name} est désactivés.`);
                        await message.guild.channels.create(ChatVocalChannel1Name,{ type: 'voice'}).then(channel => {
                            let category = message.guild.channels.cache.find(c => c.name == SalonVocauxCategoryName && c.type == "category");
                            if (category) {
                                channel.setParent(category.id);
                            }
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === '@everyone'), {
                                CONNECT: true,
                                SPEAK: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === AdminRoleName), {
                                CONNECT: true,
                                SPEAK: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === ModoRoleName), {
                                CONNECT: true,
                                SPEAK: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === NotifRoleName), {
                                CONNECT: true,
                                SPEAK: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === BotRoleName), {
                                CONNECT: true,
                                SPEAK: true
                            });
                        });
                    }
                    if (!ChatVocalChannel2) {
                        if (ChatVocalChannel2Active == false) return console.log(`${ChatVocalChannel2Name} est désactivés.`);
                        await message.guild.channels.create(ChatVocalChannel2Name,{ type: 'voice'}).then(channel => {
                            let category = message.guild.channels.cache.find(c => c.name == SalonVocauxCategoryName && c.type == "category");
                            if (category) {
                                channel.setParent(category.id);
                            }
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === '@everyone'), {
                                CONNECT: true,
                                SPEAK: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === AdminRoleName), {
                                CONNECT: true,
                                SPEAK: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === ModoRoleName), {
                                CONNECT: true,
                                SPEAK: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === NotifRoleName), {
                                CONNECT: true,
                                SPEAK: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === BotRoleName), {
                                CONNECT: true,
                                SPEAK: true
                            });
                        });
                    }
                    if (!SalonModoCategory) {
                        if (SalonModoCategoryActive == false) return console.log(`${SalonModoCategoryName} est désactivés.`);
                        await message.guild.channels.create(SalonModoCategoryName,{ type: 'category'}).then(channel => {
                            channel.setPosition("3");
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === '@everyone'), {
                                CONNECT: false,
                                SPEAK: false,
                                SEND_MESSAGES: false,
                                VIEW_CHANNEL: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === AdminRoleName), {
                                CONNECT: true,
                                SPEAK: true,
                                SEND_MESSAGES: true,
                                VIEW_CHANNEL: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === ModoRoleName), {
                                CONNECT: true,
                                SPEAK: true,
                                SEND_MESSAGES: true,
                                VIEW_CHANNEL: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === NotifRoleName), {
                                CONNECT: false,
                                SPEAK: false,
                                SEND_MESSAGES: false,
                                VIEW_CHANNEL: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === BotRoleName), {
                                CONNECT: true,
                                SPEAK: true,
                                SEND_MESSAGES: true,
                                VIEW_CHANNEL: true
                            });
                        });
                    }
                    if (!ChatTextuelModoChannel) {
                        if (ChatTextuelModoChannelActive == false) return console.log(`${ChatTextuelModoChannelName} est désactivés.`);
                        await message.guild.channels.create(ChatTextuelModoChannelName,{ type: 'text'}).then(channel => {
                            let category = message.guild.channels.cache.find(c => c.name == SalonModoCategoryName && c.type == "category");
                            if (category) {
                                channel.setParent(category.id);
                            }
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === '@everyone'), {
                                CONNECT: false,
                                SPEAK: false,
                                SEND_MESSAGES: false,
                                VIEW_CHANNEL: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === AdminRoleName), {
                                CONNECT: true,
                                SPEAK: true,
                                SEND_MESSAGES: true,
                                VIEW_CHANNEL: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === ModoRoleName), {
                                CONNECT: true,
                                SPEAK: true,
                                SEND_MESSAGES: true,
                                VIEW_CHANNEL: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === NotifRoleName), {
                                CONNECT: false,
                                SPEAK: false,
                                SEND_MESSAGES: false,
                                VIEW_CHANNEL: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === BotRoleName), {
                                CONNECT: true,
                                SPEAK: true,
                                SEND_MESSAGES: true,
                                VIEW_CHANNEL: true
                            });
                        });
                    }
                    if (!BotCommandeModoChannel) {
                        if (BotCommandeModoChannelActive == false) return console.log(`${BotCommandeModoChannelName} est désactivés.`);
                        await message.guild.channels.create(BotCommandeModoChannelName,{ type: 'text'}).then(channel => {
                            let category = message.guild.channels.cache.find(c => c.name == SalonModoCategoryName && c.type == "category");
                            if (category) {
                                channel.setParent(category.id);
                            }
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === '@everyone'), {
                                CONNECT: false,
                                SPEAK: false,
                                SEND_MESSAGES: false,
                                VIEW_CHANNEL: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === AdminRoleName), {
                                CONNECT: true,
                                SPEAK: true,
                                SEND_MESSAGES: true,
                                VIEW_CHANNEL: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === ModoRoleName), {
                                CONNECT: true,
                                SPEAK: true,
                                SEND_MESSAGES: true,
                                VIEW_CHANNEL: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === NotifRoleName), {
                                CONNECT: false,
                                SPEAK: false,
                                SEND_MESSAGES: false,
                                VIEW_CHANNEL: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === BotRoleName), {
                                CONNECT: true,
                                SPEAK: true,
                                SEND_MESSAGES: true,
                                VIEW_CHANNEL: true
                            });
                        });
                    }
                    if (!ChatVocalModoChannel) {
                        if (ChatVocalModoChannelActive == false) return console.log(`${ChatVocalModoChannelName} est désactivés.`);
                        await message.guild.channels.create(ChatVocalModoChannelName,{ type: 'voice'}).then(channel => {
                            let category = message.guild.channels.cache.find(c => c.name == SalonModoCategoryName && c.type == "category");
                            if (category) {
                                channel.setParent(category.id);
                            }
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === '@everyone'), {
                                CONNECT: false,
                                SPEAK: false,
                                SEND_MESSAGES: false,
                                VIEW_CHANNEL: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === AdminRoleName), {
                                CONNECT: true,
                                SPEAK: true,
                                SEND_MESSAGES: true,
                                VIEW_CHANNEL: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === ModoRoleName), {
                                CONNECT: true,
                                SPEAK: true,
                                SEND_MESSAGES: true,
                                VIEW_CHANNEL: true
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === NotifRoleName), {
                                CONNECT: false,
                                SPEAK: false,
                                SEND_MESSAGES: false,
                                VIEW_CHANNEL: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === BotRoleName), {
                                CONNECT: true,
                                SPEAK: true,
                                SEND_MESSAGES: true,
                                VIEW_CHANNEL: true
                            });
                        });
                    }
                    if (!AFKCategory) {
                        if (AFKCategoryActive == false) return console.log(`${AFKCategoryName} est désactivés.`);
                        await message.guild.channels.create(AFKCategoryName,{ type: 'category'}).then(channel => {
                            channel.setPosition("4");
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === '@everyone'), {
                                SPEAK: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === AdminRoleName), {
                                SPEAK: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === ModoRoleName), {
                                SPEAK: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === NotifRoleName), {
                                SPEAK: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === BotRoleName), {
                                SPEAK: false
                            });
                        });
                    }
                    if (!AFKChannel) {
                        if (AFKChannelActive == false) return console.log(`${AFKChannelName} est désactivés.`);
                        await message.guild.channels.create(AFKChannelName,{ type: 'voice'}).then(channel => {
                            let category = message.guild.channels.cache.find(c => c.name == AFKCategoryName && c.type == "category");
                            if (category) {
                                channel.setParent(category.id);
                            }
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === '@everyone'), {
                                SPEAK: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === AdminRoleName), {
                                SPEAK: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === ModoRoleName), {
                                SPEAK: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === NotifRoleName), {
                                SPEAK: false
                            });
                            channel.createOverwrite(message.guild.roles.cache.find(r => r.name === BotRoleName), {
                                SPEAK: false
                            });
                        });
                    }
                }, 3000);
            }
            if (message.content === "no" && message.member.hasPermission(["ADMINISTRATOR"])) return message.reply("L'action Setup Server a été annulé !");
        })
            rulesText = undefined;
            AdminRoleName = `Administrateur`;
            AdminRoleColor = `#FF0000`;
            ModoRoleName = `Modérateur`;
            ModoRoleColor = `#FF8C00`;
            NotifRoleName = `Notifications`;
            NotifRoleColor = `#1E90FF`;
            BotRoleName = `Bot`;
            BotRoleColor = `#FFD700`; // The modified values are reset when the command is made!
        }
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
});

// TODO Commands - Embed Creator
client.on("message", message => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    try {
        if (command === "embed") {
            const commandeType = args[0];
            let userA = message.mentions.users.first() || client.users.cache.get(args[1]);
            if (commandeType === "color") {
                const embedColorArgs = args.slice(1).join(' ');
                if (!embedColorArgs) return message.reply(`Vous devez spécifiez une couleur !`);
                embedColor = embedColorArgs;
                message.channel.send(`La couleur de l'embed est ${embedColor}`)
            }
            if (commandeType === "title") {
                const embedTitleArgs = args.slice(1).join(' ');
                if (!embedTitleArgs) return message.reply(`Vous devez spécifiez un titre !`);
                embedTitle = embedTitleArgs;
                message.channel.send(`Le titre de l'embed est ${embedTitle}`)
            }
            if (commandeType === "title-url") {
                const embedTitleURLArgs = args.slice(1).join(' ');
                if (!embedTitleURLArgs) return message.reply(`Vous devez spécifiez un titre !`);
                if (embedTitleURLArgs.startsWith(`https://` || `http://`)) {
                    embedTitleURL = embedTitleURLArgs;
                    message.channel.send(`L'url de l'embed est ${embedTitleURL}`)
                }
            }
            if (commandeType === "author") {
                const embedAuthorArgs = args.slice(1).join(' ');
                if (!embedAuthorArgs) return message.reply(`Vous devez spécifiez l'auteur !`);
                embedAuthor = embedAuthorArgs;
                message.channel.send(`L'auteur de l'embed est ${embedAuthor}`)
            }
            if (commandeType === "author-picture") {
                const embedAuthorPictureArgs = args[1];
                if (userA) {
                    embedAuthorPicture = userA.avatarURL({
                        dynamic: true
                    });
                } else if (!embedAuthorPictureArgs && message.attachments.size == 1) {
                    message.attachments.forEach(attachment => {
                        const urlAttachments = attachment.url;
                        embedAuthorPicture = urlAttachments;
                    });
                } else if (!embedAuthorPictureArgs && !message.attachments.size) {
                    return message.reply(`Vous devez spécifiez une image !`);
                } else if (embedAuthorPictureArgs.startsWith(`https://` || `http://`) && embedAuthorPictureArgs.endsWith(`.webp`)) {
                    embedAuthorPicture = embedAuthorPictureArgs;
                } else if (embedAuthorPictureArgs.startsWith(`https://` || `http://`) && embedAuthorPictureArgs.endsWith(`.png`)) {
                    embedAuthorPicture = embedAuthorPictureArgs;
                } else if (embedAuthorPictureArgs.startsWith(`https://` || `http://`) && embedAuthorPictureArgs.endsWith(`.jpg`)) {
                    embedAuthorPicture = embedAuthorPictureArgs;
                } else if (embedAuthorPictureArgs.startsWith(`https://` || `http://`) && embedAuthorPictureArgs.endsWith(`.jpeg`)) {
                    embedAuthorPicture = embedAuthorPictureArgs;
                } else if (embedAuthorPictureArgs.startsWith(`https://` || `http://`) && embedAuthorPictureArgs.endsWith(`.gif`)) {
                    embedAuthorPicture = embedAuthorPictureArgs;
                } else {
                    return message.reply(`Vous devez spécifiez une image !`);
                }
                message.channel.send(`L'image pour l'auteur de l'embed est ${embedAuthorPicture}`)
            }
            if (commandeType === "author-url") {
                const embedAuthorURLArgs = args.slice(1).join(' ');
                if (!embedAuthorURLArgs) return message.reply(`Vous devez spécifiez une url !`);
                if (embedAuthorURLArgs.startsWith(`https://` || `http://`)) {
                    embedAuthorURL = embedAuthorURLArgs;
                    message.channel.send(`L'url pour l'auteur de l'embed est ${embedAuthorURL}`)
                }
            }
            if (commandeType === "description") {
                const embedDescriptionArgs = args.slice(1).join(' ');
                if (!embedDescriptionArgs) return message.reply(`Vous devez spécifiez une description !`);
                embedDescription = embedDescriptionArgs;
                message.channel.send(`La description de l'embed est ${embedDescription}`);
            }
            if (commandeType === "thumbnail") {
                const embedThumbnailArgs = args[1];
                if (userA) {
                    embedThumbnail = userA.avatarURL({
                        dynamic: true
                    });
                } else if (!embedThumbnailArgs && message.attachments.size == 1) {
                    message.attachments.forEach(attachment => {
                        const urlAttachments = attachment.url;
                        embedThumbnail = urlAttachments;
                    });
                } else if (!embedThumbnailArgs && !message.attachments.size) {
                    return message.reply(`Vous devez spécifiez une image !`);
                } else if (embedThumbnailArgs.startsWith(`https://` || `http://`) && embedThumbnailArgs.endsWith(`.webp`)) {
                    embedThumbnail = embedThumbnailArgs;
                } else if (embedThumbnailArgs.startsWith(`https://` || `http://`) && embedThumbnailArgs.endsWith(`.png`)) {
                    embedThumbnail = embedThumbnailArgs;
                } else if (embedThumbnailArgs.startsWith(`https://` || `http://`) && embedThumbnailArgs.endsWith(`.jpg`)) {
                    embedThumbnail = embedThumbnailArgs;
                } else if (embedThumbnailArgs.startsWith(`https://` || `http://`) && embedThumbnailArgs.endsWith(`.jpeg`)) {
                    embedThumbnail = embedThumbnailArgs;
                } else if (embedThumbnailArgs.startsWith(`https://` || `http://`) && embedThumbnailArgs.endsWith(`.gif`)) {
                    embedThumbnail = embedThumbnailArgs;
                } else {
                    return message.reply(`Vous devez spécifiez une image !`);
                }
                message.channel.send(`La vignette de l'embed est ${embedThumbnail}`)
            }
            if (commandeType === "picture") {
                const embedPictureArgs = args[1];
                if (userA) {
                    embedPicture = userA.avatarURL({
                        dynamic: true
                    });
                } else if (!embedPictureArgs && message.attachments.size == 1) {
                    message.attachments.forEach(attachment => {
                        const urlAttachments = attachment.url;
                        embedPicture = urlAttachments;
                    });
                } else if (!embedPictureArgs && !message.attachments.size) {
                    return message.reply(`Vous devez spécifiez une image !`);
                } else if (embedPictureArgs.startsWith(`https://` || `http://`) && embedPictureArgs.endsWith(`.webp`)) {
                    embedPicture = embedPictureArgs;
                } else if (embedPictureArgs.startsWith(`https://` || `http://`) && embedPictureArgs.endsWith(`.png`)) {
                    embedPicture = embedPictureArgs;
                } else if (embedPictureArgs.startsWith(`https://` || `http://`) && embedPictureArgs.endsWith(`.jpg`)) {
                    embedPicture = embedPictureArgs;
                } else if (embedPictureArgs.startsWith(`https://` || `http://`) && embedPictureArgs.endsWith(`.jpeg`)) {
                    embedPicture = embedPictureArgs;
                } else if (embedPictureArgs.startsWith(`https://` || `http://`) && embedPictureArgs.endsWith(`.gif`)) {
                    embedPicture = embedPictureArgs;
                } else {
                    return message.reply(`Vous devez spécifiez une image !`);
                }
                message.channel.send(`L'image de l'embed est ${embedPicture}`);
            }
            if (commandeType === "time") {
                const embedTimeArgs = args[1];
                if (!embedTimeArgs) {
                    return message.reply(`Vous devez spécifiez une valeur !`);
                } else if (embedTimeArgs && embedTimeArgs == `true` || `false`) {
                    embedTime = embedTimeArgs;
                    message.channel.send(`Le temps est ${embedTime ? `Activé` : 'Désactivé'}`)
                }
            }
            if (commandeType === "footer") {
                const embedFooterArgs = args.slice(1).join(' ');
                if (!embedFooterArgs) return message.reply(`Vous devez spécifiez un texte !`);
                embedFooter = embedFooterArgs;
                message.channel.send(`Le footer de l'embed est ${embedFooter}`)
            }
            if (commandeType === "footer-picture") {
                const embedFooterPictureArgs = args[1];
                if (userA) {
                    embedFooterPicture = userA.avatarURL({
                        dynamic: true
                    });
                } else if (!embedFooterPictureArgs && message.attachments.size == 1) {
                    message.attachments.forEach(attachment => {
                        const urlAttachments = attachment.url;
                        embedFooterPicture = urlAttachments;
                    });
                } else if (!embedFooterPictureArgs && !message.attachments.size) {
                    return message.reply(`Vous devez spécifiez une image !`);
                } else if (embedFooterPictureArgs.startsWith(`https://` || `http://`) && embedFooterPictureArgs.endsWith(`.webp`)) {
                    embedFooterPicture = embedFooterPictureArgs;
                } else if (embedFooterPictureArgs.startsWith(`https://` || `http://`) && embedFooterPictureArgs.endsWith(`.png`)) {
                    embedFooterPicture = embedFooterPictureArgs;
                } else if (embedFooterPictureArgs.startsWith(`https://` || `http://`) && embedFooterPictureArgs.endsWith(`.jpg`)) {
                    embedFooterPicture = embedFooterPictureArgs;
                } else if (embedFooterPictureArgs.startsWith(`https://` || `http://`) && embedFooterPictureArgs.endsWith(`.jpeg`)) {
                    embedFooterPicture = embedFooterPictureArgs;
                } else if (embedFooterPictureArgs.startsWith(`https://` || `http://`) && embedFooterPictureArgs.endsWith(`.gif`)) {
                    embedFooterPicture = embedFooterPictureArgs;
                } else {
                    return message.reply(`Vous devez spécifiez une image !`);
                }
                message.channel.send(`L'image pour le footer de l'embed est ${embedFooterPicture}`)
            }
            /*if (commandeType === "field-name") {
                const embedAddFieldNameArgs = args.slice(1).join(' ');
                embedAddFieldName = embedAddFieldNameArgs;
                message.channel.send(`Le nom du field est ${embedAddFieldName}`)
            }
            if (commandeType === "field-description") {
                const embedAddFieldValueArgs = args.slice(1).join(' ');
                embedAddFieldValue = embedAddFieldValueArgs;
                message.channel.send(`La description du field est ${embedAddFieldValue}`)
            }
            if (commandeType === "field-inline") {
                const embedAddFieldInlineArgs = args[1];
                embedAddFieldInline = embedAddFieldInlineArgs;
                message.channel.send(`L'alignement du field est ${embedAddFieldInline ? `Activé` : 'Désactivé'}`)
            }
            if (commandeType === "field-create") {
                if (!embedAddFieldInline) embedAddFieldInline = false;
                embedCreator.addField(`${embedAddFieldName}`, `${embedAddFieldValue}`, embedAddFieldInline)
                embedAddFieldName = undefined;
                embedAddFieldValue = undefined;
                embedAddFieldInline = undefined;
                message.channel.send(`Field ajoutés à l'embed.`)
            }*/
            if (commandeType === "create") {
                const embedCreator = new MessageEmbed();
                if (embedColor) embedCreator.setColor(`${embedColor}`);
                if (embedTitle) embedCreator.setTitle(`${embedTitle}`);
                if (embedTitleURL) embedCreator.setURL(`${embedTitleURL}`);
                if (embedAuthor && !embedAuthorPicture && !embedAuthorURL) {
                    embedCreator.setAuthor(`${embedAuthor}`);
                } else if (embedAuthor && embedAuthorPicture && !embedAuthorURL) {
                    embedCreator.setAuthor(`${embedAuthor}`, `${embedAuthorPicture || null}`);
                } else if (embedAuthor && !embedAuthorPicture && embedAuthorURL) {
                    embedCreator.setAuthor(`${embedAuthor}`, null, `${embedAuthorURL || null}`);
                } else if (embedAuthor && embedAuthorPicture && embedAuthorURL) {
                    embedCreator.setAuthor(`${embedAuthor}`, `${embedAuthorPicture || null}`, `${embedAuthorURL || null}`);
                };
                if (embedDescription) embedCreator.setDescription(`${embedDescription}`);
                if (embedThumbnail) embedCreator.setThumbnail(`${embedThumbnail}`);
                if (embedPicture) embedCreator.setImage(`${embedPicture}`);
                if (!embedTime) embedTime = false;
                if (embedTime === true) embedCreator.setTimestamp();
                if (embedFooter && !embedFooterPicture) {
                    embedCreator.setFooter(`${embedFooter}`);
                } else if (embedFooter && embedFooterPicture) {
                    embedCreator.setFooter(`${embedFooter}`, `${embedFooterPicture || null}`);
                }
                message.channel.send(embedCreator);
            }
            if (commandeType === "test") {
                const randomDiscordAvatar = [
                    'https://cdn.discordapp.com/embed/avatars/0.png',
                    'https://cdn.discordapp.com/embed/avatars/1.png',
                    'https://cdn.discordapp.com/embed/avatars/2.png',
                    'https://cdn.discordapp.com/embed/avatars/3.png',
                    'https://cdn.discordapp.com/embed/avatars/4.png',
                    ]
                const embedTest = new MessageEmbed()
                    .setColor(`#2a5ee8`)
                    .setTitle(`Titre`)
                    .setURL(`https://discord.js.org/#/`)
                    .setAuthor(`Nom de l'auteur`, `${randomDiscordAvatar[Math.floor(Math.random() * randomDiscordAvatar.length)]}`, `https://example.com/`)
                    .setDescription(`Description`)
                    .setThumbnail(`https://i.imgur.com/wSTFkRM.png`)
                    .setImage(`https://i.imgur.com/wSTFkRM.png`)
                    .setTimestamp()
                    .setFooter(`${client.user.tag}`, `${client.user.displayAvatarURL({
                        dynamic: true
                    })}`)
                message.channel.send(embedTest);
            }
            if (commandeType === "help") {
                const embedhelp = new MessageEmbed()
                    .setColor(`${config.colorembed}`)
                    .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                        dynamic: true
                    }) || "")
                    .setTitle('Help Embed Creator')
                    .setDescription(`__**Si une commande n'as pas d'exemple cela veut dire qu'il ne faut pas spécifier d'argument !**__`)
                    .addField(`${guildConf[message.guild.id].prefix}embed color`, `Définit la couleur de l'embed\nExemple: ${guildConf[message.guild.id].prefix}embed color <la couleur en hexadécimal>`)
                    .addField(`${guildConf[message.guild.id].prefix}embed author`, `Définit l'auteur de l'embed\nExemple: ${guildConf[message.guild.id].prefix}embed author <l'auteur>`)
                    .addField(`${guildConf[message.guild.id].prefix}embed author-picture`, `Définit l'image de l'auteur de l'embed\nExemple: ${guildConf[message.guild.id].prefix}embed author-picture <l'image de l'auteur>\nPossibilité: Upload d'une image via discord, mention de l'utilisateur ou l'url de l'image en https ou http et se terminant par le format de l'image, exemple: .png, .jpg, .jpeg, .webp, .gif`)
                    .addField(`${guildConf[message.guild.id].prefix}embed author-url`, `Définit l'url l'auteur de l'embed\nExemple: ${guildConf[message.guild.id].prefix}embed author-url <l'url de l'auteur en https ou http'>`)
                    .addField(`${guildConf[message.guild.id].prefix}embed title`, `Définit le titre de l'embed\nExemple: ${guildConf[message.guild.id].prefix}embed title <le titre>`)
                    .addField(`${guildConf[message.guild.id].prefix}embed title-url`, `Définit l'url du titre de l'embed\nExemple: ${guildConf[message.guild.id].prefix}embed title-url <l'url du titre en https ou http>`)
                    .addField(`${guildConf[message.guild.id].prefix}embed description`, `Définit la description de l'embed\nExemple: ${guildConf[message.guild.id].prefix}embed description <la description>`)
                    .addField(`${guildConf[message.guild.id].prefix}embed thumbnail`, `Définit la vignette de l'embed\nExemple: ${guildConf[message.guild.id].prefix}embed thumbnail <la vignette>\nPossibilité: Upload d'une image via discord, mention de l'utilisateur ou l'url de l'image en https ou http et se terminant par le format de l'image, exemple: .png, .jpg, .jpeg, .webp, .gif`)
                    .addField(`${guildConf[message.guild.id].prefix}embed picture`, `Définit l'image de l'embed\nExemple: ${guildConf[message.guild.id].prefix}embed picture <l'image>\nPossibilité: Upload d'une image via discord, mention de l'utilisateur ou l'url de l'image en https ou http et se terminant par le format de l'image, exemple: .png, .jpg, .jpeg, .webp, .gif`)
                    .addField(`${guildConf[message.guild.id].prefix}embed time`, `Affiche le temps de l'embed\nExemple: ${guildConf[message.guild.id].prefix}embed time <true ou false>\ntrue = activé - false = désactivé`)
                    .addField(`${guildConf[message.guild.id].prefix}embed footer`, `Définit le footer de l'embed\nExemple: ${guildConf[message.guild.id].prefix}embed footer <le footer>`)
                    .addField(`${guildConf[message.guild.id].prefix}embed footer-picture`, `Définit l'image du footer de l'embed\nExemple: ${guildConf[message.guild.id].prefix}embed footer-picture <l'image du footer>\nPossibilité: Upload d'une image via discord, mention de l'utilisateur ou l'url de l'image en https ou http et se terminant par le format de l'image, exemple: .png, .jpg, .jpeg, .webp, .gif`)
                    .addField(`${guildConf[message.guild.id].prefix}embed create`, `Génère l'embed`)
                    .addField(`${guildConf[message.guild.id].prefix}embed test`, `Génère un embed TEST`)
                    .setTimestamp()
                    .setFooter(client.user.tag, client.user.displayAvatarURL({
                        dynamic: true
                    }));
                message.channel.send(embedhelp)
            }
        }
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
});

// TODO Commands - Custom Prefix
client.on("message", message => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    try {
        if (command === "new-prefix") {
            if (!message.member.hasPermission('ADMINISTRATOR')) return message.reply("Désolé, Vous n'avez pas les permissions !");
            let newPrefix = message.content.split(" ").slice(1, 2)[0];
            guildConf[message.guild.id].prefix = newPrefix;
            if (!guildConf[message.guild.id].prefix) {
                guildConf[message.guild.id].prefix = guildConf[message.guild.id].prefix;
            }
            message.reply(`Le prefix est maintenant: ${newPrefix}`)
            fs.writeFile('./config.json', JSON.stringify(guildConf, null, 2), (err) => {
                if (err) console.log(err) // 📕 - If this is triggered, the database has encountered an error!
            })
        }
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
});

// TODO Commands - Economy Bot
client.on('message', async message => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const application = await client.fetchApplication()
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    try {
        if (command === "money") {
            const commandeType = args[0];
            if (commandeType === "add") {
                if (message.author.id !== application.owner.id) return message.reply("Désolé, Vous n'avez pas les permissions !");
                if (!args[1]) return message.reply(`S'il vous plaît, veuillez spécifier une valeur.`)
                if (isNaN(args[1])) return message.reply(`Ce n'est pas un nombre valide !`)
        
                let user = message.mentions.users.first() || client.users.cache.get(args[2]) || message.author;
                message.channel.send(`Ajouté avec succès, ${args[1]} à ${user}`)
                db.add(`money_${message.guild.id}_${message.author.id}`, args[1])
            }
            if (commandeType === "remove") {
                if (message.author.id !== application.owner.id) return message.reply("Désolé, Vous n'avez pas les permissions !");
                if (!args[1]) return message.reply(`S'il vous plaît, veuillez spécifier une valeur.`)
                if (isNaN(args[1])) return message.reply(`Ce n'est pas un nombre valide !`)
        
                let user = message.mentions.users.first() || client.users.cache.get(args[2]) || message.author;
                message.channel.send(`Supprimés avec succès, ${args[1]} à ${user}`)
                db.subtract(`money_${message.guild.id}_${message.author.id}`, args[1])
            }
            if (commandeType === "daily") {
                let timeout = 86400000
                let amount = 500
                let daily = await db.fetch(`daily_${message.author.id}`);
        
                if (daily !== null && timeout - (Date.now() - daily) > 0) {
                    let time = ms(timeout - (Date.now() - daily));
                    return message.reply(`Vous avez déjà récupéré votre récompense journalière, vous pouvez revenir la récupérer dans **${time.hours}:${time.minutes}:${time.seconds}**!`)
                } else {
                    let user = message.author
                    message.channel.send(`Récompense Quotidienne Ajoutés avec succès, ${amount} à ${user}`)
                    db.add(`money_${message.author.id}`, amount)
                    db.set(`daily_${message.author.id}`, Date.now())
                }
            }
            if (commandeType === "weekly") {
                let timeout = 604800000
                let amount = 1000
                let weekly = await db.fetch(`weekly_${message.author.id}`);
        
                if (weekly !== null && timeout - (Date.now() - weekly) > 0) {
                    let time = ms(timeout - (Date.now() - weekly));
                    return message.reply(`Vous avez déjà récupéré votre récompense hebdomadaire, vous pouvez revenir la récupérer dans **${time.days} jours et ${time.hours}:${time.minutes}:${time.seconds}**!`)
                } else {
                    let user = message.author
                    message.channel.send(`Récompense Hebdomadaire Ajoutés avec succès, ${amount} à ${user}`)
                    db.add(`money_${message.author.id}`, amount)
                    db.set(`weekly_${message.author.id}`, Date.now())
                }
            }
            if (commandeType === "monthly") {
                let timeout = 2592000000
                let amount = 5000
                let monthly = await db.fetch(`monthly_${message.author.id}`);
        
                if (monthly !== null && timeout - (Date.now() - monthly) > 0) {
                    let time = ms(timeout - (Date.now() - monthly));
                    return message.reply(`Vous avez déjà récupéré votre récompense mensuelle, vous pouvez revenir la récupérer dans **${time.days} jours et ${time.hours}:${time.minutes}:${time.seconds}**!`)
                } else {
                    let user = message.author
                    message.channel.send(`Récompense Mensuelle Ajoutés avec succès, ${amount} à ${user}`)
                    db.add(`money_${message.author.id}`, amount)
                    db.set(`monthly_${message.author.id}`, Date.now())
                }
            }
            if (commandeType === "info") {
                let money = await db.fetch(`money_${message.guild.id}_${message.author.id}`);
                const embedmoney = new MessageEmbed()
                    .setColor(`${config.colorembed}`)
                    .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                        dynamic: true
                    }) || "")
                    .setTitle('Argents sur le compte')
                    .setDescription(`${money}`)
                    .setTimestamp()
                    .setFooter(client.user.tag, client.user.displayAvatarURL({
                        dynamic: true
                    }));
                message.channel.send(embedmoney)
            }
            if (commandeType === "help") {
                const embedmoneyhelp = new MessageEmbed()
                    .setColor(`${config.colorembed}`)
                    .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                        dynamic: true
                    }) || "")
                    .setTitle('Help Argents')
                    .setDescription(`__**Si une commande n'as pas d'exemple cela veut dire qu'il ne faut pas spécifier d'argument !**__`)
                    .addField(`${guildConf[message.guild.id].prefix}money daily`, `Reçoit une récompense quotidienne.`)
                    .addField(`${guildConf[message.guild.id].prefix}money monthly`, `Reçoit une récompense mensuelle.`)
                    .addField(`${guildConf[message.guild.id].prefix}money weekly`, `Reçoit une récompense hebdomadaire.`)
                    .addField(`${guildConf[message.guild.id].prefix}money info`, `Affiche le solde de votre compte.`)
                    .setTimestamp()
                    .setFooter(client.user.tag, client.user.displayAvatarURL({
                        dynamic: true
                    }));
                message.channel.send(embedmoneyhelp)
            }
        }
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
});

// TODO Commands - Config info
client.on("message", message => {
    if (message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if (command === "config-info") {
        const channelName = message.guild.channels.cache.get(guildConf[message.guild.id].logs_channel);
        const embed = new MessageEmbed()
            .setColor(`${config.colorembed}`)
            .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                dynamic: true
            }) || "")
            .setTitle('Informations de la base de donnée', true)
            .addField("Logs", `${guildConf[message.guild.id].logs ? "Activé" : "Désactivé"}`)
            .addField("Salon des logs", `${channelName || "Aucun salon"}`)
            .addField("Actualités DiscordBot.js", `${guildConf[message.guild.id].news ? "Activé" : "Désactivé"}`)
            if (guildConf[message.guild.id].serverinvite == "undefined") {
                embed.addField("Invitation publique", `Aucune invitation`)
            } else if (guildConf[message.guild.id].serverinvite !== "undefined") {
                embed.addField("Invitation publique", `${guildConf[message.guild.id].serverinvite ? `https://${guildConf[message.guild.id].serverinvite}` : "Aucune invitation"}`)
            }
            embed.setTimestamp()
            embed.setFooter(client.user.tag, client.user.displayAvatarURL({
                dynamic: true
            }));
        message.channel.send(embed)
    }
});

// TODO Commands - DiscordBot.js Canary
client.on("message", message => {
    if (!message.guild) return;
    if (!message.guild.available) return;
    if (message.author.bot) return;
    if (message.content.indexOf(guildConf[message.guild.id].prefix) !== 0) return;
    const args = message.content.slice(guildConf[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    try {
        if (command === "canary") {
            const embed = new MessageEmbed()
                .setColor(`${config.colorembed}`)
                .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({
                    dynamic: true
                }) || "")
                .setTitle(`${client.users.cache.get("612614416776560671").username}`)
                .setDescription(`Inviter le dans vos serveurs pour avoir en temps réelle les changements de la prochaine mise à jour de ${client.user}.\nLien de l'invitation: [${client.users.cache.get("612614416776560671").username}](${config.CANARY})`)
                .setThumbnail(client.users.cache.get("612614416776560671").avatarURL({
                    dynamic: true
                }))
                .setTimestamp()
                .setFooter(client.user.tag, client.user.displayAvatarURL({
                    dynamic: true
                }));
            message.channel.send(embed);
        }
    } catch (err) {
        console.error(`❌ - ${client.user.username} (${client.user.id}) a rencontré une erreur dans le serveur ${message.guild.name} (${message.guild.id}) !\n`, err);
    };
});
