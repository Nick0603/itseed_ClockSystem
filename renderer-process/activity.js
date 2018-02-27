const createFileBtn = document.getElementById('createFileBtn')
const server_activity = require('../server/server-activity.js')
const server_attendance = require('../server/server-attendance.js')
const settings = require('electron-settings')
const swal = require('sweetalert2');
const tbody = document.getElementById('js-file-tbody')

function callbackUpdateFileMangerView(err) {
    if (err) {
        console.log(err);
        return;
    }
    server_activity.selectAllActivity(showActivityData);
}

createFileBtn.addEventListener('click', function () {
    swal({
        title: '創造簽到表',
        html:
            `
            名稱：<input type="text"           id="swal-attendeeFile-name"      class="swal2-input" >
            日期：<input type="date"           id="swal-attendeeFile-date"      class="swal2-input">
            值日組別：<input type="text"        id="swal-attendeeFile-executor" class="swal2-input">
            簽到截止時間：<input type="time"    id="swal-attendeeFile-signIn"    class="swal2-input"   value="12:55">
            簽退開始時間：<input type="time"    id="swal-attendeeFile-signOut"       class="swal2-input"   value="17:30" >
            `,
        focusConfirm: false,
        preConfirm: () => {

            var data = [
                document.getElementById('swal-attendeeFile-name').value,
                document.getElementById('swal-attendeeFile-date').value,
                document.getElementById('swal-attendeeFile-executor').value,
                document.getElementById('swal-attendeeFile-signIn').value,
                document.getElementById('swal-attendeeFile-signOut').value
            ]
            server_activity.insertActivity(data, callbackUpdateFileMangerView);
        }
    })
});

tbody.addEventListener('click', function (event) {
    const classList = event.target.classList;
    const targetTr = event.target.parentElement.parentElement;
    const id = targetTr.dataset.id;
    if (classList.contains("deleteBtn")) {
        server_activity.deleteActivity(id, callbackUpdateFileMangerView)
    } else if (classList.contains("exportBtn")) {
        console.log(id);
        server_attendance.selectAttendanceByActivityId(id,function(err,data){
            console.log(data);
        })
    }
})


tbody.addEventListener('click', function (event) {
    const classList = event.target.classList;
    const targetTr = event.target.parentElement;
    const id = targetTr.dataset.id;

    const file_manager_section = document.getElementById('file-manager-section')
    const attendance_section = document.getElementById('attendance-section')
    const queryTotal = document.getElementById('query-total')
    if (classList.contains("name")) {
        settings.set('activity_id', id);
        // change section
        file_manager_section.classList.remove('is-shown');
        attendance_section.classList.add('is-shown');
        queryTotal.click();
    }
})

function showActivityData(err,activityArr) {
    let tbody = document.getElementById('js-file-tbody')
    function showOne(activity) {
        let newTr = document.createElement('tr');
        newTr.innerHTML = `
            <td class="name" >${activity.name}</td>
            <td class="create-time">${activity.create_time}</td>
            <td class="operate">
                <button class="deleteBtn">刪除</button>
                <button class="exportBtn">匯出</button>
            </td>
        `
        newTr.dataset.id = activity.ID;
        tbody.appendChild(newTr);
    }
    tbody.innerHTML = `<tr class="emptyTr">
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
    </tr>`;
    activityArr.forEach(showOne);
}

function initialize() {
    server_activity.selectAllActivity(showActivityData);
}
initialize();