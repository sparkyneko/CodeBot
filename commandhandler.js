"use strict";

const fs = require("fs");

function uncacheTree(root) {
    let uncache = [require.resolve(root)];
    do {
        let newuncache = [];
        for (let i = 0; i < uncache.length; ++i) {
            if (require.cache[uncache[i]]) {
                newuncache.push.apply(
                    newuncache,
                    require.cache[uncache[i]].children.map(module => module.filename)
                );
                delete require.cache[uncache[i]];
            }
        }
        uncache = newuncache;
    } while (uncache.length > 0);
}

const COMMAND_RECURSION = 10; // how deep command search recursion can go.

class CommandHandler {
    constructor() {
        this.commands = {};

        this.load();
    }
    
    load() {
        this.commands = {};
        
        const files = fs.readdirSync('./commands/');
        for (const file of files) {
            if (file === 'command-data') continue; // skip the localized database files specifically for commands
            uncacheTree('./commands/' + file);
            const tempCmds = require(`./commands/${file}`);
            Object.assign(this.commands, tempCmds);
        }
        console.log('Loaded Commands');
    }

    get(cmd) {
        if (!this.commands[cmd]) return null;
        for (let i = 0; i < COMMAND_RECURSION; i++) {
            if (typeof cmd === 'string') {
                cmd = this.commands[cmd];
            } else {
                return cmd;
            }
        }
        return null;
    }
}

module.exports = function() {
    const coms = new CommandHandler();

    return coms;
}