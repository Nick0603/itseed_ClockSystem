const path = require('path');
const file = path.join(__dirname, './database.sqlite3');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(file);

db.serialize(function () {
	db.run(`
        CREATE TABLE IF NOT EXISTS Activities(
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        name            TEXT        NOT NULL,
        date            DATETIME    NOT NULL,
        executor        TEXT        NOT NULL,
        update_time     DATETIME    NOT NULL,
        create_time     DATETIME    DEFAULT (datetime('now','localtime'))
    )`);

	db.run(`
        CREATE TABLE IF NOT EXISTS Attendances(
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            is_leave         BOOLEAN     DEFAULT 0,
            is_swipe         BOOLEAN     DEFAULT 0,
            sign_in         DATETIME    ,
            sign_out        DATETIME    ,
            activity_id     INTEGER     NOT NULL,
            user_id         INTEGER     NOT NULL
        )
    `);

	db.run(`
        CREATE TABLE IF NOT EXISTS Users(
        ID TEXT PRIMARY KEY NOT NULL,
        name            TEXT        NOT NULL,
        card            TEXT,
        update_time     DATETIME DEFAULT (datetime('now','localtime'))
    )`);
});
db.close();