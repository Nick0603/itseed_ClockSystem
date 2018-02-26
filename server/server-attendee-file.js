var path = require("path");
var file = path.join(__dirname, './database.sqlite3')
var sqlite3 = require("sqlite3").verbose();
var server_user = require("./server-user");
var server_attendee = require("./server-attendee");

var db = new sqlite3.Database(file);

db.serialize(function () {
    db.run(`
        CREATE TABLE IF NOT EXISTS AttendeeFiles(
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        name            TEXT        NOT NULL,
        date            DATETIME    NOT NULL,
        executor        TEXT        NOT NULL,
        sign_in         DATETIME    NOT NULL,
        sign_out        DATETIME    NOT NULL,
        create_time     DATETIME    DEFAULT (datetime('now','localtime'))
    )`);
});
db.close();


module.exports = {
    selectAllAttendeeFile: function (callback) {
        var db = new sqlite3.Database(file);
        var SQL = "SELECT * FROM AttendeeFiles";
        db.all(SQL, callback);
        db.close();
    },
    insertAttendeeFile: function (attendeeFile,callback) {
        var db = new sqlite3.Database(file);
        var SQL = "INSERT INTO AttendeeFiles(name,date,executor,sign_in,sign_out) VALUES (?,?,?,?,?)";
        db.run(SQL,attendeeFile,function(err){
            var file_id = this.lastID;
            server_user.selectAllUser(function (err, users) {
                let userIds = users.map((user) => user.ID)
                server_attendee.createAttendeeList(file_id, userIds);
            });
            callback();
        })
        db.close();
    },
    deleteAttendeeFile: function (id,callback) {
        var db = new sqlite3.Database(file);
        var SQL = "DELETE FROM AttendeeFiles WHERE ID = $id";
        server_attendee.deleteAttendeeByFileId(id);
        db.run(SQL, { $id: id }, callback)
        db.close();
    },
    deleteAllAttendeeFile: function (callback) {
        var db = new sqlite3.Database(file);
        var SQL = "DELETE FROM AttendeeFiles";
        db.run(SQL);
        db.close();
    }
}