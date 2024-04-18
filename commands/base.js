"use strict";

const admin = {
    eval(msg, server, channel, user) {
        if (!Tools.isSysop(user.id)) return false
        try {
            const res = eval(msg);
            channel.send(`<< \`\`${msg}\`\`\n>> \`\`${res}\`\``);

        } catch (e) {
            channel.send('```' + e.stack + '```');
        }
    },

    ping(msg, server, channel, user) {
        Bot.sendToUser(user, 'Pong!');
    },
}

module.exports = admin;