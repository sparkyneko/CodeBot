"use strict";

global.Config = require('./config.js');

global.Commands = global.Db = require('./database.js')(`data`, { timer: false });

const bot = require('./bot.js');

global.toId = function(s) {
    return "" + (s && typeof s === "string" ? s : "").toLowerCase().replace(/[^a-z0-9]+/g, "");
};

// set up global tools
global.Tools = require('./tools.js');

// load commands
global.Commands = require('./commandhandler.js')();

global.Bot = new bot();

// overwrite console.log to include a timestamp
console._log = console.log;
console.log = function(...args) {
    let date = new Date();
    let offset = date.getTimezoneOffset() / -60;
    return console._log('[', date.toLocaleString(), `UTC${offset > 0 ? '+' : "-"}${Math.abs(offset)}`, ']', ...args);
}