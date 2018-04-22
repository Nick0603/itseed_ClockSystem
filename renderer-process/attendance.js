const settings = require('electron-settings');
const swal = require('sweetalert2');
const server_user = require('../server/server-user');
const server_attendance = require('../server/server-attendance');
const titleName = document.querySelector('.title-name');
const inputCard = document.getElementById('input-card');
const dashboardPresent = document.getElementById('dashboard-present');
const dashboardLeave = document.getElementById('dashboard-leave');
const dashboardNoPresent = document.getElementById('dashboard-no-present');
const queryTotal = document.getElementById('query-total');
const queryLeave = document.getElementById('query-leave');
const queryNoPresent = document.getElementById('query-no-present');
const tbody = document.getElementById('js-attendance-tbody');
const checkboxIsSignOut = document.getElementById('checkbox-is-sign-out');
const searchInput = document.getElementById('attendance-search-input');
const searchBtn = document.getElementById('attendance-search-btn');
const dashboardPresentDataName = document.querySelector('#dashboard-present .data-name');
const dashboardNoPresentDataName = document.querySelector('#dashboard-no-present .data-name');
let golbal = this;


// the switch_btn's event
checkboxIsSignOut.addEventListener('change', function () {
	let isSignOut = this.checked;
	settings.set('isSignOut', isSignOut);
	if (isSignOut) {
		golbal.signModeName = 'sign-out';
		golbal.signKeyName = 'sign_out';
		titleName.innerText = '簽退頁面';
		dashboardPresentDataName.innerText = '已簽退人數';
		dashboardNoPresentDataName.innerText = '未簽退人數';
	} else {
		golbal.signModeName = 'sign-in';
		golbal.signKeyName = 'sign_in';
		titleName.innerText = '簽到頁面';
		dashboardPresentDataName.innerText = '已簽到人數';
		dashboardNoPresentDataName.innerText = '未簽到人數';
	}
	updateAttandanceView();
});

// search for special content 
searchInput.addEventListener('keypress', function (event) {
	if (event.key === 'Enter') {
		searchBtn.click();
	}
});
searchBtn.addEventListener('click', function () {
	let attendance_arr = golbal.attendance_arr;
	let search_key = searchInput.value;
	if (!search_key) {
		showAttendanceData(attendance_arr);
		return;
	}
	let filter_attendance_arr = attendance_arr
        .filter(attendee => {
	return attendee.ID.includes(search_key) ||
                attendee.name.includes(search_key);
});
	showAttendanceData(attendance_arr, filter_attendance_arr);
});

function showMessage(content){
	let {
        title,
        user,
        description
    } = content;
	let message_div = document.getElementById('swipe-message');
	let ele_title = message_div.querySelector('.title');
	let ele_user_name = message_div.querySelector('.user-name');
	let ele_description = message_div.querySelector('.description');
	ele_title.innerText = title;
	ele_user_name.innerText = !user? '無' : `${user.ID} ${user.name}` ;
	ele_description.innerText = description;
	if (this.timeout){
		clearTimeout(this.timeout);
		message_div.classList.remove('swipe-message-show');
		setTimeout(() => {
			message_div.classList.add('swipe-message-show');
			golbal.message_hidden_time = new Date();
			this.timeout = setTimeout(() => {
				if (new Date() - golbal.message_hidden_time >= 1950) {
					message_div.classList.remove('swipe-message-show');
				}
			}, 3000);
		}, 200);
	}else{
		message_div.classList.add('swipe-message-show');
		golbal.message_hidden_time = new Date();
		this.timeout = setTimeout(() => {
			if (new Date() - golbal.message_hidden_time >= 1950) {
				message_div.classList.remove('swipe-message-show');
			}
		}, 3000);
	}

}

// swipe the card to sign the attendance
inputCard.addEventListener('keypress', function (event) {
	if (event.key === 'Enter') {
		let activity_id = settings.get('activity_id');
		let swipeCard = this.value;
		this.value = '';
		let sign_name = '';
		server_attendance.verifyByCard(swipeCard,activity_id,function (err, targetUser){
			if (err) {
				return;
			}
			let isSignOut = settings.get('isSignOut');
			if (isSignOut) {
				sign_name = '簽退';
			} else {
				sign_name = '簽到';
			}
			if (!targetUser){
				showMessage({
					title: `${sign_name}失敗`,
					description: '無此卡號資訊'
				});
				return;
			} else if (!isSignOut && targetUser.sign_in) {
				showMessage({
					title: `${sign_name}失敗`,
					user: targetUser,
					description: `重複${sign_name}，已於 ${targetUser.sign_in} 完成${sign_name}`
				});
				return;
			} else if (isSignOut && targetUser.sign_out) {
				showMessage({
					title: `${sign_name}失敗`,
					user: targetUser,
					description: `重複${sign_name}，已於 ${targetUser.sign_out} 完成${sign_name}`
				});
				return;
			}
			server_attendance.swipeById(targetUser.ID, activity_id, isSignOut, function (err) {
				if (err){
					alert(err);
					return;
				}
				server_attendance.selectAttendanceOnly(activity_id, targetUser.ID,function(err,user){
					let description = '';
					if (isSignOut) {
						description = `於 ${user.sign_out} 完成${sign_name}`;
					} else {
						description = `於 ${user.sign_in} 完成${sign_name}`;
					}
					showMessage({
						title: `${sign_name}成功`,
						user: user,
						description: description
					});
					updateAttandanceView();
				});
			});
		});
	}
});

// (click event) dashboard and attendace's tab
function cancelQueryControlSeleted() {
	var queryControlArr = document.querySelectorAll('.query-control-ul li');
	queryControlArr.forEach((query) => { query.classList.remove('is-selected'); });
}
function changeTab(tabElement, attendance_mode) {
	return function () {
		cancelQueryControlSeleted();
		tabElement.classList.add('is-selected');
		searchInput.value = '';
		settings.set('attendance_display_type', attendance_mode);
		var activity_id = settings.get('activity_id');
		server_attendance.selectAttendanceByActivityId(activity_id, storeAttendanceArrAndShow);
	};
}
queryTotal.addEventListener('click', changeTab(queryTotal, 'total'));
queryLeave.addEventListener('click', changeTab(queryLeave, 'leave'));
queryNoPresent.addEventListener('click', changeTab(queryNoPresent, 'no-present'));

dashboardPresent.addEventListener('click', ()=>{queryTotal.click();});
dashboardLeave.addEventListener('click', () => {queryLeave.click();});
dashboardNoPresent.addEventListener('click', () => {queryNoPresent.click();});


// using the way of clicking tab to update the lastest attendance
function updateAttandanceView() {
	var showMode = settings.get('attendance_display_type');
	if (showMode == 'total') {
		queryTotal.click();
	} else if (showMode == 'leave') {
		queryLeave.click();
	} else if (showMode == 'no-present') {
		queryNoPresent.click();
	}
}

function storeAttendanceArrAndShow(err, attendance_arr) {
	if (err) {
		alert(err);
		return;
	}
	golbal.attendance_arr = attendance_arr;
	showAttendanceData(attendance_arr);
	updateDashboard(attendance_arr);
}

function updateDashboard(attendance_arr) {
	let dashboardPresentData = document.querySelector('#dashboard-present .data');
	let dashboardLeaveData = document.querySelector('#dashboard-leave .data');
	let dashboardNoPresentData = document.querySelector('#dashboard-no-present .data');
	function countAttendance(counter, attendance) {
		if (attendance.is_leave) {
			counter.leave += 1;
		} else if (attendance[golbal.signKeyName]) {
			counter.present += 1;
		} else {
			counter.noPresent += 1;
		}
		return counter;
	}
	let attCounter = {
		present: 0,
		leave: 0,
		noPresent: 0
	};
	attCounter = attendance_arr.reduce(countAttendance, attCounter);
	dashboardPresentData.innerText = attCounter.present;
	dashboardLeaveData.innerText = attCounter.leave;
	dashboardNoPresentData.innerText = attCounter.noPresent;
}
function showAttendanceData(attendance_arr, filter_attendance_arr) { 
	let tbody = document.getElementById('js-attendance-tbody');
    // get the attandace mode ( sign-in or sign-out )
	let isSignOut = settings.get('isSignOut') || false;
	if (isSignOut) {
		golbal.signModeName = 'sign-out';
		golbal.signKeyName = 'sign_out';
		titleName.innerText = '簽退頁面';
	} else {
		golbal.signModeName = 'sign-in';
		golbal.signKeyName = 'sign_in';
		titleName.innerText = '簽到頁面';
	}
    // filter the attandce depending on how_type
	var attendance_display_type = settings.get('attendance_display_type');
	if (attendance_display_type == 'leave') {
		attendance_arr = attendance_arr.filter(attendance => attendance.is_leave);
	}
	if (attendance_display_type == 'no-present') {
		attendance_arr = attendance_arr.filter((attendance) => {
			return !attendance.is_leave && !attendance[golbal.signKeyName];
		});
	}
	if (filter_attendance_arr) {
		if (attendance_display_type == 'leave') {
			filter_attendance_arr = filter_attendance_arr.filter(attendance => attendance.is_leave);
		}
		if (attendance_display_type == 'no-present') {
			filter_attendance_arr = filter_attendance_arr.filter((attendance) => {
				return !attendance.is_leave && !attendance[golbal.signKeyName];
			});
		}
	}
    // initital the display attendace to empty
	tbody.innerHTML = `<tr class="emptyTr">
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
    </tr>`;
	if (filter_attendance_arr) {
		filter_attendance_arr.forEach(showOne);
	} else {
		attendance_arr.forEach(showOne);
	}
}

function showOne(attendance) {
	let newTr = document.createElement('tr');
	let isSignOut = settings.get('isSignOut') || false;
	newTr.innerHTML = `
            <td class="user_id" >${attendance.user_id}</td>
            <td class="name">${attendance.name}</td>
            <td class="${golbal.signModeName}-status"></td>
            <td class="${golbal.signModeName}-time">--:--</td>
            <td class="operate"></td>
        `;
	const operateTd = newTr.querySelector('.operate');
	const statusTd = newTr.querySelector(`.${golbal.signModeName}-status`);
	const signTimeTd = newTr.querySelector(`.${golbal.signModeName}-time`);
	if (attendance.is_leave) {
		statusTd.innerText = '請假';
		if (!isSignOut) {
			operateTd.innerHTML = `
                    <button class="cancelLeaveBtn">取消請假</button>
                `;
		}
		newTr.classList.add('is-leave');
	} else {
		if (attendance[golbal.signKeyName]) {
			var signDate = new Date(attendance[golbal.signKeyName]);
			var hours = signDate.getHours();
			var minutes = signDate.getMinutes();
			hours = (hours < 10) ? '0' + hours : hours;
			minutes = (minutes < 10) ? '0' + minutes : minutes;
			signTimeTd.innerText = `${hours}:${minutes}`;
			if (isSignOut) {
				statusTd.innerText = '已簽退';
				operateTd.innerHTML += `
                        <button class="signOutBtn" disabled>手動簽退</button>
                    `;
			} else {
				statusTd.innerText = '已簽到';
				operateTd.innerHTML += `
                        <button class="setLeaveBtn" disabled>請假</button>
                        <button class="signInBtn" disabled>手動簽到</button>
                    `;
			}
		} else {
			if (isSignOut) {
				statusTd.innerText = '未簽退';
				operateTd.innerHTML += `
                        <button class="signOutBtn">手動簽退</button>
                    `;
			} else {
				statusTd.innerText = '未簽到';
				operateTd.innerHTML += `
                        <button class="setLeaveBtn">請假</button>
                        <button class="signInBtn">手動簽到</button>
                    `;
			}
		}
		if (!attendance.card) {
			operateTd.innerHTML += `
                    <button class="setCardBtn">新增卡號</button>
                `;
		}
	}
	newTr.dataset.user_id = attendance.user_id;
	newTr.dataset.activity_id = attendance.activity_id;
	newTr.dataset.name = attendance.name;
	tbody.appendChild(newTr);
}

tbody.addEventListener('click', function (event) {
	const classList = event.target.classList;
	const targetTr = event.target.parentElement.parentElement;
	const self = this;
	self.user_id = targetTr.dataset.user_id;
	self.activity_id = targetTr.dataset.activity_id;
	self.name = targetTr.dataset.name;
	if (classList.contains('cancelLeaveBtn')) {
		dialogCancelLeave.call(self);
	} else if (classList.contains('setLeaveBtn')) {
		dialogSetLeave.call(self);
	} else if (classList.contains('signInBtn')) {
		dialogSignIn.call(self);
	} else if (classList.contains('signOutBtn')) {
		dialogSignOut.call(self);
	} else if (classList.contains('setCardBtn')) {
		dialogSetCard.call(self);
	}
});

function dialogCancelLeave(){
	swal({
		title: '取消請假',
		text: `${this.user_id} ${this.name} 取消請假`,
		type: 'info',
		showCancelButton: true,
		confirmButtonColor: '#010180',
		cancelButtonColor: '#aaa',
		cancelButtonText: '取消',
		confirmButtonText: '確認',
		reverseButtons: true
	}).then((result) => {
		if (result.value) {
			server_attendance.cancelLeaveById(this.user_id, this.activity_id, function (err) {
				if (err) {
					alert(err);
					return;
				}
				updateAttandanceView();
			});
		}
	});
}

function dialogSetLeave(){
	swal({
		title: '確定請假',
		text: `${this.user_id} ${this.name} 設定請假`,
		type: 'info',
		showCancelButton: true,
		confirmButtonColor: '#010180',
		cancelButtonColor: '#aaa',
		cancelButtonText: '取消',
		confirmButtonText: '確認',
		reverseButtons: true
	}).then((result) => {
		if (result.value) {
			server_attendance.setLeaveById(this.user_id, this.activity_id, function (err) {
				if (err) {
					alert(err);
					return;
				}
				updateAttandanceView();
			});
		}
	});
}

function dialogSignIn(){
	swal({
		title: '確定簽到',
		text: `${this.user_id} ${this.name} 手動簽到`,
		type: 'info',
		showCancelButton: true,
		confirmButtonColor: '#010180',
		cancelButtonColor: '#aaa',
		cancelButtonText: '取消',
		confirmButtonText: '簽到',
		reverseButtons: true
	}).then((result) => {
		if (result.value) {
			server_attendance.signInById(this.user_id, this.activity_id, function (err) {
				if (err) {
					alert(err);
					return;
				}
				updateAttandanceView();
			});
		}
	});
}

function dialogSignOut(){
	swal({
		title: '確定簽退',
		text: `${this.user_id} ${this.name} 手動簽退`,
		type: 'info',
		showCancelButton: true,
		confirmButtonColor: '#010180',
		cancelButtonColor: '#aaa',
		cancelButtonText: '取消',
		confirmButtonText: '簽退',
		reverseButtons: true
	}).then((result) => {
		if (result.value) {
			server_attendance.signOutById(this.user_id, this.activity_id, function (err) {
				if (err) {
					alert(err);
					return;
				}
				updateAttandanceView();
			});
		}
	});
}

function dialogSetCard(){
	swal({
		title: `${this.user_id} ${this.name}`,
		input: 'text',
		inputPlaceholder: '請刷卡或輸入卡號',
		showCancelButton: true,
		confirmButtonColor: '#010180',
		cancelButtonColor: '#aaa',
		confirmButtonText: '確定',
		cancelButtonText: '取消',
		showLoaderOnConfirm: true,
		reverseButtons: true
	}).then((result) => {
		if (result.value) {
			let card = result.value;
			server_user.updateUserCard(this.user_id, card, function (err) {
				if (err) {
					alert(err);
					return;
				}
				alert(err);
				updateAttandanceView();
				inputCard.focus();
			});
		}
	});
}

(function initital() {
	let isSignOut = settings.get('isSignOut')  || false;
	checkboxIsSignOut.checked = isSignOut;
	if (isSignOut) {
		golbal.signModeName = 'sign-out';
		golbal.signKeyName = 'sign_out';
		titleName.innerText = '簽退頁面';
		dashboardPresentDataName.innerText = '已簽退人數';
		dashboardNoPresentDataName.innerText = '未簽退人數';
	} else {
		golbal.signModeName = 'sign-in';
		golbal.signKeyName = 'sign_in';
		titleName.innerText = '簽到頁面';
		dashboardPresentDataName.innerText = '已簽到人數';
		dashboardNoPresentDataName.innerText = '未簽到人數';
	}

	updateAttandanceView();
})();