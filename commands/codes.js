"use strict";

module.exports = {
    adduser: 'addusers',
    async addusers(msg, server, channel, user, isDM, cmd) {
        if (!Tools.isSysop(user.id)) return false;
        
        if (isDM) return channel.send('This command cannot be used in DMs as it may need to search a discord server for members.');
        
        let targets = msg.split(/[\n|,]/).map(arg => arg.trim());

        channel.send('Processing... Please wait as the bot converts discord usernames into user IDs.');

        let userids = [];
        for (let target of targets) {
            if (/[a-z]/i.test(target)) {
                // this is a discord tag.  convert to userid
                let targetUsers = await this.guild.members.search({ query: target, limit: 1 }); // returns a maps

                if (!targetUsers.size) {
                    channel.send(`Unable to find user @${target}`);
                    continue;
                }

                for (let id of targetUsers.keys()) {
                    // first user is the one you want
                    userids.push(id);
                }
            } else {
                target = target.replace(/[^0-9]/g, '');
                if (!target || target.length < 10) continue;
                userids.push(target);
            }
        }

        for (const id of userids) {
            Db('saved_users').set(id, true);
        }
        Db.save();

        channel.send(`Added ${userids.length} of ${targets.length} users.  Please use !userlist to review the list of all the added users.`);
    },

    async userlist(msg, server, channel, user) {
        if (!Tools.isSysop(user.id)) return false;

        let all = Object.keys(Db('saved_users').cache)

        let str = [`Total users (${all.length}): `];

        for (const key of all) {
            let index = str.length - 1;
            let bit = `<@${key}>`
            if (str[index].length > 1900) {
                str.push(key);
            } else {
                str[index] += bit;
            }
        }
        
        for (const line of str) {
            await channel.send(line);
        }
    },

    addcode: 'addcodes',
    addcodes(msg, server, channel, user) {
        if (!Tools.isSysop(user.id)) return false;

        let targets = msg.split(/[\n|,]/).map(arg => arg.trim());

        for (const code of targets){
            Db('saved_codes').set(code, true);
        }
        Db.save();

        channel.send('All codes have been saved. Please use !userlist to review the list of all the saved codes.');
    },

    async codelist(msg, server, channel, user) {
        if (!Tools.isSysop(user.id)) return false;

        let all = Object.keys(Db('saved_codes').cache)

        let str = [`Total codes (${all.length}): `];

        for (const key of all) {
            let index = str.length - 1;
            let bit = `${key} `
            if (str[index].length > 1900) {
                str.push(key);
            } else {
                str[index] += bit;
            }
        }
        
        for (const line of str) {
            await channel.send(line);
        }
    },

    sendcodes(msg, server, channel, user) {
        if (!Tools.isSysop(user.id)) return false;

        const pms_per_second = 40;
        const wait = 1000 / pms_per_second;

        const codes = Object.keys(Db('saved_codes').cache);
        const users = Object.keys(Db('saved_users').cache);

        if (users.length > codes.length) return channel.send('Uh oh!  You seem to have less codes than users listed to receive a unique code.');
        
        let length = users.length + 0;

        let message = Db('saved_message').get('message', `Your weekly code to claim gifts as a Unity tester is: #code.  Thank you for your continued support of our game and our beta tester program!`);
        if (!message.includes('#code')) message += ` Your redeemable code is: #code`;
        const interval = setInterval(async () => {
            let target = users.pop();
            if (!target) {
                clearInterval(interval);
                channel.send(`Done!  Attempted to send to ${length} users.  ${codes.length} code(s) were left over.  Please remember to use \`\`!resetcodes\`\` to delete all of the saved (single-use) codes before the next use.`);

            } else {
                let res = await Bot.sendToUser({ id: target }, message.replace(/#code/g, codes.pop()));
                if (res.error) channel.send(res.error);
            }
        }, wait);
    },

    setmessage(msg, server, channel, user) {
        if (!Tools.isSysop(user.id)) return false;

        Db('saved_message').set('message', msg);

        channel.send('You have updated the message that will be used when distributing redeem codes.  ``#code`` in your saved message will be replaced with a redeemable code.');
    },

    resetcodes(msg, server, channel, user) {
        if (!Tools.isSysop(user.id)) return false;

        Db('saved_codes').cache = {};
        Db.save();

        channel.send('All saved codes have been removed.');
    },
    resetusers(msg, server, channel, user) {
        if (!Tools.isSysop(user.id)) return false;

        Db('saved_users').cache = {};
        Db.save();

        channel.send('All saved users have been removed.');
    }
}