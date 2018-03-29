const createFileBtn = document.getElementById('createFileBtn')
const server_activity = require('../server/server-activity.js')
const server_attendance = require('../server/server-attendance.js')
const settings = require('electron-settings')
const swal = require('sweetalert2');
const tbody = document.getElementById('js-file-tbody')
const searchInput = document.getElementById('activity-search-input');
const searchBtn = document.getElementById('activity-search-btn');

function callbackUpdateFileMangerView(err) {
    if (err) {
        console.log(err);
        return;
    }
    server_activity.selectAllActivity(function (err, activity_arr) {
        if (err) {
            console.log(err);
            return;
        }
        window.activity_arr = activity_arr;
        showActivityData(activity_arr);
    });
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
    const name = targetTr.querySelector('.name').innerText;
    const id = targetTr.dataset.id;
    if (classList.contains("deleteBtn")) {
        swal({
            title: '確定刪除',
            text: `刪除「${name}」`,
            showCancelButton: true,
            imageUrl: 'assets/img/trash.png',
            imageWidth: '80px',
            imageHeight: '80px',
            confirmButtonClass: 'modal-btn modal-fileDelete-confirm',
            cancelButtonClass: 'modal-btn modal-fileDelete-cancel',
            cancelButtonText: '取消',
            confirmButtonText: '刪除',
            buttonsStyling: false,
            reverseButtons: true
        }).then((result) => {
            if (result.value) {
                server_activity.deleteActivity(id, function(){
                    swal({
                        title: '已刪除',
                        imageUrl: 'assets/img/confirm-red.png',
                        imageWidth: '80px',
                        imageHeight: '80px',
                        timer: 1000,
                        showConfirmButton: false,
                    })
                    callbackUpdateFileMangerView();
                })
            
            }
        })
        
    } else if (classList.contains("exportBtn")) {
        server_attendance.selectAttendanceByActivityId(id,function(err,data){
            let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
            csvContent += "標號,名字,簽到時間,簽退時間,\r\n";
            data.map(function(user){
                let ID = user.ID ? user.ID : "";
                let name = user.name ? user.name : "";
                if (user.is_leave){
                    var sign_in = "請假";
                    var sign_out = "請假";
                }else{
                    if (user.sign_in){
                        let d = new Date(user.sign_in);
                        var sign_in = `${d.getHours()}:${d.getMinutes()}`
                    }else{
                        var sign_in = "";
                    }
                    if (user.sign_out) {
                        let d = new Date(user.sign_out);
                        var sign_out = `${d.getHours()}:${d.getMinutes()}`
                    } else {
                        var sign_out = "";
                    }
                }
                return [ID,name,sign_in,sign_out]
            }).forEach(function (rowArray) {
                let row = rowArray.join(",");
                csvContent += row + "\r\n";
            }); 

            var encodedUri = encodeURI(csvContent);
            var link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "itseed_attendance.csv");
            document.body.appendChild(link); // Required for FF
            link.click();
            document.body.removeChild(link);

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

function showActivityData(activity_arr) {
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
    </tr>`;
    activity_arr.forEach(showOne);
}

searchInput.addEventListener('keypress', function (event) {
    if (event.key === "Enter") {
        searchBtn.click();
    }
})
searchBtn.addEventListener('click', function () {
    let activity_arr = window.activity_arr;
    let search_key = searchInput.value;
    if (!search_key) {
        showActivityData(activity_arr);
        return;
    }
    let filter_activity_arr = activity_arr
        .filter(activity => activity.name.includes(search_key))
    showActivityData(filter_activity_arr);
})

function initialize() {
    callbackUpdateFileMangerView();
}
initialize();