var path = require("path");
var file = path.join(__dirname, './database.sqlite3')
var sqlite3 = require("sqlite3").verbose();

var db = new sqlite3.Database(file);

db.serialize(function () {
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
});
db.close();



module.exports = {
    selectAttendance: function (id, callback) {
        var db = new sqlite3.Database(file);
        var SQL = "SELECT * FROM Attendances Where id = $id";
        db.get(SQL, { $id: id }, callback);
        db.close();
    },
    selectAttendanceByActivityId: function (activity_id, callback) {
        var db = new sqlite3.Database(file);
        var SQL = `
            SELECT *
            FROM Attendances
            Join Users
            ON Attendances.user_id=Users.ID
            Where activity_id = $activity_id
        `;
        db.all(SQL, { $activity_id: activity_id }, callback);
        db.close();
    },
    selectAllAttendance: function (callback) {
        var db = new sqlite3.Database(file);
        var SQL = "SELECT * FROM Attendances";
        db.all(SQL, callback);
        db.close();
    },
    createAttendanceList:function(activity_id,userIDArr,callback){
        db.serialize(function () {
            var db = new sqlite3.Database(file);
            var SQL = "INSERT INTO Attendances(activity_id,user_id) VALUES (?,?)";
            userIDArr.forEach(function (user_id) {
                db.run(SQL, [activity_id, user_id]);
            })
            db.close();
        });
    },
    insertAttendance: function (data) {
        var db = new sqlite3.Database(file);
        var SQL = "INSERT INTO Attendances(activity_id,user_id) VALUES (?,?)";
        db.run(SQL,data)
        db.close();
    },
    updateAttendance: function (id, callback) {
        var db = new sqlite3.Database(file);
        var SQL = "UPDATE Attendances SET  WHERE ID=$id";
        db.run(SQL, { $id: id, $card: card }, callback);
        db.close();
    },
    setLeaveById: function (user_id,activity_id,callback) {
        var db = new sqlite3.Database(file);
        var SQL = "UPDATE Attendances SET  is_leave=$status WHERE user_id=$user_id and activity_id=$activity_id";
        db.run(SQL, {
            $user_id: user_id,
            $activity_id: activity_id,
            $status: true
        },callback);
        db.close();
    },
    cancelLeaveById: function (user_id, activity_id, callback) {
        var db = new sqlite3.Database(file);
        var SQL = "UPDATE Attendances SET  is_leave=$status WHERE user_id=$user_id and activity_id=$activity_id";
        db.run(SQL, {
            $user_id: user_id,
            $activity_id: activity_id,
            $status: false
        }, callback);
        db.close();
    },
    signInById: function (user_id, activity_id, callback) {
        var db = new sqlite3.Database(file);
        var SQL = `
            UPDATE Attendances 
            SET sign_in=(datetime('now','localtime'))
            WHERE user_id=$user_id and activity_id=$activity_id
        `;
        db.run(SQL, {
            $user_id: user_id,
            $activity_id: activity_id,
        }, callback);
        db.close();
    },
    swipeById: function (user_id,activity_id, callback) {
        var db = new sqlite3.Database(file);
        var SQL = `
            UPDATE Attendances 
            SET is_swipe=1,sign_in=(datetime('now','localtime'))
            WHERE user_id=$user_id and activity_id=$activity_id;
        `;
        db.run(SQL, {
            $user_id: user_id,
            $activity_id: activity_id,
        }, callback);
        db.close();
    },
    deleteAttendance: function (id, callback) {
        var db = new sqlite3.Database(file);
        var deleteUser = "DELETE FROM Attendances WHERE ID = $id";
        db.run(deleteUser, { $id: id }, callback);
        db.close();
    },
    deleteAttendanceByActivityId: function (activity_id, callback) {
        var db = new sqlite3.Database(file);
        var deleteUser = "DELETE FROM Attendances WHERE activity_id = $id";
        db.run(deleteUser, { $id: activity_id }, callback);
        db.close();
    },
    deleteAllAttendance: function (callback) {
        var db = new sqlite3.Database(file);
        var deleteUser = "DELETE FROM Attendances";
        db.run(deleteUser);
        db.close();
    },
}