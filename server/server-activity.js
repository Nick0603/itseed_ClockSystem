const path = require('path');
const file = path.join(__dirname, './database.sqlite3');
const sqlite3 = require('sqlite3').verbose();
const server_user = require('./server-user');
const server_attance = require('./server-attendance');

module.exports = {
	selectAllActivity: function (callback) {
		var db = new sqlite3.Database(file);
		var SQL = 'SELECT * FROM Activities';
		db.all(SQL, callback);
		db.close();
	},
	insertActivity: function (activity,callback) {
		var db = new sqlite3.Database(file);
		var SQL = 'INSERT INTO Activities(name,date,executor,sign_in,sign_out) VALUES (?,?,?,?,?)';
		db.run(SQL, activity,function(err){
			if(err){
				callback(err);
			}
			var file_id = this.lastID;
			server_user.selectAllUser(function (err, users) {
				let userIds = users.map((user) => user.ID);
				server_attance.createAttendanceList(file_id, userIds);
			});
			callback();
		});
		db.close();
	},
	deleteActivity: function (id,callback) {
		var db = new sqlite3.Database(file);
		var SQL = 'DELETE FROM Activities WHERE ID = $id';
		server_attance.deleteAttendanceByActivityId(id);
		db.run(SQL, { $id: id }, callback);
		db.close();
	},
	deleteAllActivity: function (callback) {
		var db = new sqlite3.Database(file);
		var SQL = 'DELETE FROM Activities';
		db.run(SQL);
		db.close();
		callback();
	}
};