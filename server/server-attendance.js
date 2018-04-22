const path = require('path');
const file = path.join(__dirname, './database.sqlite3');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const secret = 'itseedsAreAlawayHere';

module.exports = {
	selectAttendance: function (id, callback) {
		var db = new sqlite3.Database(file);
		var SQL = 'SELECT * FROM Attendances Where id = $id';
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
	selectAttendanceOnly: function (activity_id,user_id,callback) {
		var db = new sqlite3.Database(file);
		var SQL = `
            SELECT *
            FROM Attendances
            Join Users
            ON Attendances.user_id=Users.ID
            Where activity_id = $activity_id AND
                  user_id = $user_id
        `;
		db.get(SQL, {
			$activity_id: activity_id,
			$user_id: user_id
		}, callback);
		db.close();
	},
	selectAllAttendance: function (callback) {
		var db = new sqlite3.Database(file);
		var SQL = 'SELECT * FROM Attendances';
		db.all(SQL, callback);
		db.close();
	},
	createAttendanceList:function(activity_id,userIDArr,callback){
		var db = new sqlite3.Database(file);
		var SQL = 'INSERT INTO Attendances(activity_id,user_id) VALUES (?,?)';
		db.serialize(function () {
			userIDArr.forEach(function (user_id) {
				db.run(SQL, [activity_id, user_id]);
			});
		});
		db.close();
		callback();
	},
	insertAttendance: function (data) {
		var db = new sqlite3.Database(file);
		var SQL = 'INSERT INTO Attendances(activity_id,user_id) VALUES (?,?)';
		db.run(SQL,data);
		db.close();
	},
	setLeaveById: function (user_id,activity_id,callback) {
		var db = new sqlite3.Database(file);
		var SQL = 'UPDATE Attendances SET  is_leave=$status WHERE user_id=$user_id and activity_id=$activity_id';
		db.run(SQL, {
			$user_id: user_id,
			$activity_id: activity_id,
			$status: true
		},callback);
		db.close();
	},
	cancelLeaveById: function (user_id, activity_id, callback) {
		var db = new sqlite3.Database(file);
		var SQL = 'UPDATE Attendances SET  is_leave=$status WHERE user_id=$user_id and activity_id=$activity_id';
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
			$activity_id: activity_id
		}, callback);
		db.close();
	},
	signOutById: function (user_id, activity_id, callback) {
		var db = new sqlite3.Database(file);
		var SQL = `
            UPDATE Attendances 
            SET sign_out=(datetime('now','localtime'))
            WHERE user_id=$user_id and activity_id=$activity_id;
        `;
		db.run(SQL, {
			$user_id: user_id,
			$activity_id: activity_id
		}, callback);
		db.close();
	},
	swipeById: function (user_id, activity_id,isSignOut,callback) {
		var db = new sqlite3.Database(file);
		var SQL = `
            UPDATE Attendances 
            SET is_swipe=1,is_leave=0,${isSignOut ?'sign_out':'sign_in'}=(datetime('now','localtime'))
            WHERE user_id=$user_id and activity_id=$activity_id;
        `;
		db.run(SQL, {
			$user_id: user_id,
			$activity_id: activity_id,
		},callback);
	},
	deleteAttendance: function (id, callback) {
		var db = new sqlite3.Database(file);
		var deleteUser = 'DELETE FROM Attendances WHERE ID = $id';
		db.run(deleteUser, { $id: id }, callback);
		db.close();
	},
	deleteAttendanceByActivityId: function (activity_id, callback) {
		var db = new sqlite3.Database(file);
		var deleteUser = 'DELETE FROM Attendances WHERE activity_id = $id';
		db.run(deleteUser, { $id: activity_id }, callback);
		db.close();
	},
	deleteAllAttendance: function (callback) {
		var db = new sqlite3.Database(file);
		var deleteUser = 'DELETE FROM Attendances';
		db.run(deleteUser);
		db.close();
		callback();
	},
	verifyByCard: function (input_card,activity_id,callback) {
		var db = new sqlite3.Database(file);
		const hash_input_card = crypto.createHmac('sha256', secret)
            .update(input_card)
            .digest('hex');
		var SQL = `
            SELECT *
            FROM Attendances
            Join Users
            ON Attendances.user_id=Users.ID
            Where activity_id = $activity_id AND card = $hash_input_card
        `;
		db.get(SQL, {
			$hash_input_card: hash_input_card,
			$activity_id: activity_id
		}, callback);
		db.close();
	}
};

