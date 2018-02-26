var path = require("path");
var file = path.join(__dirname, './database.sqlite3')
var sqlite3 = require("sqlite3").verbose();

var db = new sqlite3.Database(file);

db.serialize(function () {
    db.run(`
        CREATE TABLE IF NOT EXISTS Attendees(
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        isDayOff        BOOLEAN     DEFAULT 0,
        sign_in         DATETIME    ,
        sign_out        DATETIME    ,
        file_id         INTEGER     NOT NULL,
        user_id         INTEGER     NOT NULL
    )`);
});
db.close();



module.exports = {
    selectAttendee: function (id, callback) {
        var db = new sqlite3.Database(file);
        var SQL = "SELECT * FROM Attendees Where id = $id";
        db.get(SQL, { $id: id }, callback);
        db.close();
    },
    selectAttendeeByFileId: function (file_id, callback) {
        var db = new sqlite3.Database(file);
        var SQL = "SELECT * FROM Attendees Where file_id = $file_id";
        db.all(SQL, { $file_id: file_id }, callback);
        db.close();
    },
    selectAllAttendee: function (callback) {
        var db = new sqlite3.Database(file);
        var SQL = "SELECT * FROM Attendees";
        db.all(SQL, callback);
        db.close();
    },
    createAttendeeList:function(file_id,userIDArr,callback){
        db.serialize(function () {
            var db = new sqlite3.Database(file);
            var SQL = "INSERT INTO Attendees(file_id,user_id) VALUES (?,?)";
            userIDArr.forEach(function (user_id) {
                db.run(SQL, [file_id, user_id]);
            })
            db.close();
        });
    },
    insertAttendee: function (data) {
        var db = new sqlite3.Database(file);
        var SQL = "INSERT INTO Attendees(file_id,user_id) VALUES (?,?)";
        db.run(SQL,data)
        db.close();
    },
    updateAttendee: function (id, callback) {
        var db = new sqlite3.Database(file);
        var SQL = "UPDATE Attendees SET  WHERE ID=$id";
        db.run(SQL, { $id: id, $card: card }, callback);
        db.close();
    },
    deleteAttendee: function (id, callback) {
        var db = new sqlite3.Database(file);
        var deleteUser = "DELETE FROM Attendees WHERE ID = $id";
        db.run(deleteUser, { $id: id }, callback);
        db.close();
    },
    deleteAttendeeByFileId: function (file_id, callback) {
        var db = new sqlite3.Database(file);
        var deleteUser = "DELETE FROM Attendees WHERE file_id = $id";
        db.run(deleteUser, { $id: file_id }, callback);
        db.close();
    },
    deleteAllAttendee: function (callback) {
        var db = new sqlite3.Database(file);
        var deleteUser = "DELETE FROM Attendees";
        db.run(deleteUser);
        db.close();
    },
}