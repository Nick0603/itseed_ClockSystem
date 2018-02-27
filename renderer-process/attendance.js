const BrowserWindow = require('electron').remote.BrowserWindow
const path = require('path')
const settings = require('electron-settings')
const swal = require('sweetalert2');
const server_user = require("../server/server-user");
const server_attendance = require('../server/server-attendance')


const cardInput = document.getElementById('card-input');
const queryTotal = document.getElementById('query-total');
const tbody = document.getElementById('js-attendance-tbody');
const card_input = document.getElementById('card-input');

card_input.addEventListener('keypress',function(event){
    if(event.key === "Enter"){
        let activity_id = settings.get('activity_id');
        let swipeCard =  this.value;
        this.value = "";
        let attendanceArr = window.attendanceArr;
        let targetUser = attendanceArr.filter((attendance)=>{
            return attendance.card == parseInt(swipeCard);
        })[0];
        console.log(targetUser);
        server_attendance.swipeById(targetUser.user_id, activity_id,function(err){
            queryTotal.click();
        })
    }
})

tbody.addEventListener('click', function (event) {
    const classList = event.target.classList;
    const targetTr = event.target.parentElement.parentElement;
    const user_id = targetTr.dataset.user_id;
    const activity_id = targetTr.dataset.activity_id;
    const name = targetTr.dataset.name;

    if (classList.contains("cancelLeaveBtn")) {
        swal({
            title: '取消請假',
            text: `${user_id} ${name} 取消請假`,
            type: 'info',
            showCancelButton: true,
            confirmButtonColor: '#010180',
            cancelButtonColor: '#aaa',
            cancelButtonText: '取消',
            confirmButtonText: '確認',
            reverseButtons: true
        }).then((result) => {
            if (result.value) {
                server_attendance.cancelLeaveById(user_id, activity_id, function (err) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    queryTotal.click();
                })
            }
        })
    } else if (classList.contains("setLeaveBtn")) {
        swal({
            title: '確定請假',
            text: `${user_id} ${name} 設定請假`,
            type: 'info',
            showCancelButton: true,
            confirmButtonColor: '#010180',
            cancelButtonColor: '#aaa',
            cancelButtonText: '取消',
            confirmButtonText: '確認',
            reverseButtons: true
        }).then((result) => {
            if (result.value) {
                server_attendance.setLeaveById(user_id,activity_id,function(err){
                    if(err){
                        console.log(err);
                        return;
                    }
                    queryTotal.click();
                })
            }
        })
    } else if (classList.contains("registerBtn")){
        swal({
            title: '確定簽到',
            text: `${user_id} ${name} 手動簽到`,
            type: 'info',
            showCancelButton: true,
            confirmButtonColor: '#010180',
            cancelButtonColor: '#aaa',
            cancelButtonText: '取消',
            confirmButtonText: '簽到',
            reverseButtons: true
        }).then((result) => {
            if (result.value) {
                server_attendance.signInById(user_id, activity_id, function (err) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    queryTotal.click();
                })
            }
        })
    } else if (classList.contains("setCardBtn")){
        swal({
            title: `${user_id} ${name}`,
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
                server_user.updateUserCard(user_id, card,function(err){
                    if (err) {
                        console.log(err);
                        return;
                    }
                    queryTotal.click();
                    card_input.focus();
                })
            }
        })
    }
})

queryTotal.addEventListener('click', function (event) {
    var activity_id = settings.get('activity_id');
    server_attendance.selectAttendanceByActivityId(activity_id, showAttendanceData);
})

function showAttendanceData(err, attendanceArr) {
    window.attendanceArr = attendanceArr;
    console.log(attendanceArr);
    let dashboardPresent = document.getElementById('dashboard-present')
    let dashboardLeave = document.getElementById('dashboard-leave')
    let dashboardNoPresent = document.getElementById('dashboard-no-present')
    let tbody = document.getElementById('js-attendance-tbody')
    attendanceCount = {
        present: 0,
        leave: 0,
        noPresent: 0
    }  

    function showOne(attendance) {
        let newTr = document.createElement('tr');
        newTr.innerHTML = `
            <td class="user_id" >${attendance.user_id}</td>
            <td class="name">${attendance.name}</td>
            <td class="sign-in-status"></td>
            <td class="sign-in-time">--:--</td>
            <td class="operate"></td>
        `;
        const operateTd = newTr.querySelector(".operate");
        const statusTd = newTr.querySelector(".sign-in-status");
        const signInTimeTd = newTr.querySelector(".sign-in-time");
        if (attendance.is_leave){
            statusTd.innerText = "請假";
            attendanceCount.leave += 1;
            operateTd.innerHTML = `
                <button class="cancelLeaveBtn">取消請假</button>
            `;
            newTr.classList.add("is-leave");
        }else{
            if (attendance.sign_in){
                var signInDate = new Date(attendance.sign_in);
                var hours = signInDate.getHours();
                var minutes = signInDate.getMinutes();
                hours = (hours < 10) ? '0' + hours : hours;
                minutes = (minutes < 10) ? '0' + minutes : minutes;
                signInTimeTd.innerText = `${hours}:${minutes}`;
                attendanceCount.present += 1;
                statusTd.innerText = "已簽到";
                operateTd.innerHTML += `
                    <button class="setLeaveBtn">請假</button>
                `;
            } else {
                attendanceCount.noPresent += 1;
                statusTd.innerText = "未簽到";
                operateTd.innerHTML += `
                    <button class="setLeaveBtn">請假</button>
                    <button class="registerBtn">手動簽到</button>
                `;
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
    tbody.innerHTML = `<tr class="emptyTr">
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
    </tr>`;
    attendanceArr.forEach(showOne);
    dashboardPresent.innerText = attendanceCount.present;
    dashboardLeave.innerText = attendanceCount.leave;
    dashboardNoPresent.innerText = attendanceCount.noPresent;
}