
"use strict";
const cache = require("./cache-db");
const fs = require("graceful-fs");

function Database(path, spawnOptions) {
	const databases = {};
	const options = spawnOptions || {};

	// load the files and the directory
	if (!fs.existsSync(path)) {
		fs.mkdirSync(path);
	}

	fs.readdir(path, (err, files) => {
		if (!files || err) return; // nothing intialized!
		// eslint-disable-next-line no-useless-escape
		files.forEach(f => spawndb(f.replace(/\_?\.json$/i, "")));
	});

	function spawndb(id) {
		if (databases[id]) return;
		// eslint-disable-next-line new-cap
		const db = new cache();
		db.load(path + "/" + id);
		if (options.timer) db.setTimer(spawnOptions.timer);
		databases[id] = db;
	}

	// the actual database
	function db(id) {
		if (!databases[id]) spawndb(id);
		return databases[id];
	}

	db.write = function () {
		for (const i in databases) {
			databases[i].write(true);
		}
	};
	db.save = db.write;

	db.keys = function () {
		return Object.keys(databases);
	};

	db.hasKey = function (id) {
		return id in databases;
	};

	db.config = function (id, value) {
		options[id] = value;
	};

	db.drop = function (id) {
		if (!this.hasKey(id)) return;
		databases[id].drop();

		// drop the timer
		clearInterval(databases[id].writeInterval);
		databases[id].writeInterval = null;

		delete databases[id]; // do not track anymore
	};

	db.spawn = spawndb;

	return db;
}

module.exports = Database;