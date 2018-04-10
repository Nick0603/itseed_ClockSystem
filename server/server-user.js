const path = require("path");
const file = path.join(__dirname, './database.sqlite3')
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(file);
const crypto = require('crypto');
const secret = 'itseedsAreAlawayHere';

db.serialize(function () {
    db.run(`
        CREATE TABLE IF NOT EXISTS Users(
        ID TEXT PRIMARY KEY NOT NULL,
        name            TEXT        NOT NULL,
        card            TEXT,
        update_time     DATETIME DEFAULT (datetime('now','localtime'))
    )`);
});
db.close();


module.exports = {
    selectUser: function (id,callback) {
        var db = new sqlite3.Database(file);
        var SQL = "SELECT * FROM Users Where id = $id";
        db.get(SQL,{$id:id},callback);
        db.close();
    },
    selectAllUser:function(callback){
        var db = new sqlite3.Database(file);
        var SQL = "SELECT * FROM Users";
        db.all(SQL, callback);     
        db.close();
    },
    insertUser:function(user){
        var db = new sqlite3.Database(file);
        var SQL = "INSERT INTO Users(ID,name,card) VALUES (?,?,?)";
        db.run(SQL,user)
        db.close();
    },
    updateUserCard:function(id,card,callback){
        var db = new sqlite3.Database(file);
        const hash_card = crypto.createHmac('sha256', secret)
            .update(card)
            .digest('hex');
        var SQL = "UPDATE Users SET card=$card,update_time=datetime('now','localtime')  WHERE ID=$id";
        db.run(SQL, { $id: id, $card: hash_card},callback);
        db.close();
    },
    loadUserData:function(userArr,callback){
        db.serialize(function () {
            var db = new sqlite3.Database(file);
            var deleteUser = "DELETE FROM Users";
            var insertUser = "INSERT INTO Users(ID,name,card) VALUES (?,?,?)";
            db.run(deleteUser);
            userArr.forEach(function(user){
                console.log(user);
                db.run(insertUser,user);
            })
            db.close();
        });
    },
    deleteUser:function(id,callback){
        var db = new sqlite3.Database(file);
        var deleteUser = "DELETE FROM Users WHERE ID = $id";
        db.run(deleteUser,{ $id: id}, callback);
        db.close();
    },
    deleteAllUser: function (callback) {
        var db = new sqlite3.Database(file);
        var deleteUser = "DELETE FROM Users";
        db.run(deleteUser);
        db.close();
    },
    verifyByCard:function(input_card,callback){
        var db = new sqlite3.Database(file);
        const hash_input_card = crypto.createHmac('sha256', secret)
            .update(input_card)
            .digest('hex');
        var SQL = "SELECT * FROM Users Where card = $hash_input_card";
        let user = db.get(SQL, { $hash_input_card: hash_input_card },callback);
        db.close();
    }
}