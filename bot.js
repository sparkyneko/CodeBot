
const { Client, Intents } = require('discord.js');

class DiscordBot {
    constructor() {
        this.client = new Client({
            intents: [
                Intents.FLAGS.GUILDS, 
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.DIRECT_MESSAGES,
                Intents.FLAGS.GUILD_MEMBERS,
                Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
                Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS
            ], 
            partials : ['MESSAGE', 'CHANNEL', 'REACTION'] 
        });
        this.connect();
    }


    connect() {
        this.client.on('ready', async () => {
            console.log('The bot is ready!');
        });
        this.client.login(Config.token);
        this.client.on('messageCreate', message => {
            this.parse(message);
        });
    }

    parse(msg) {
        const server = msg.guildId;
        const channel = msg.channel;
        let content = msg.content;
        const user = msg.author;
        const channel_type = msg.channel.type;
        const isDM = channel_type === 'DM';

        console.log(user.id, isDM ? 'dms' : 'server', content);
        
        if (!['GUILD_TEXT', 'DM'].includes(channel_type)) return;  // drop unknown message types
        
        // handle commands.
        let res = false;        
        if (Config.command_token.includes(content.charAt(0))) {
            const parts = content.split(' ');
            const command = toId(parts[0]);
            content = parts.slice(1).join(' ');

            let exec = Commands.get(command);
            try {
                if (exec) res = exec.call(msg, content, server, channel, user, isDM, command);
            } catch (e) {
                channel.send('The command crashed...');
                console.log(e.stack);
            }
        }
    }

    async getUser(id) /* returns <Promise> */ {
        let user = await this.client.users.fetch(id);
        return user;
    }

    async sendToUser(user, msg) {
        let new_message = null;
        let u = await this.getUser(user.id);
        try {
            new_message = await u.send(msg);
        } catch (e) {
            return { error: `Failed to send to user: <@${user.id}>` } 
        };
        return { success: new_message };
    }
}

module.exports = DiscordBot;