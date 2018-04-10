const BrowserWindow = require('electron').remote.BrowserWindow
const server = require('../server/server-user.js')
const tbody = document.getElementById('js-user-tbody')

const { dialog } = require('electron').remote;
const fs = require('fs'); // Load the File System to execute our common tasks (CRUD)
const uploadBtn = document.getElementById('upload')
const searchInput = document.getElementById('user-search-input');
const searchBtn = document.getElementById('user-search-btn');


uploadBtn.addEventListener('click',function(){
    dialog.showOpenDialog((fileNames) => {
        // fileNames is an array that contains all the selected
        if (fileNames === undefined) {
            console.log("No file selected");
            return;
        }
        const filepath = fileNames[0];
        fs.readFile(filepath, 'utf-8', (err, data) => {
            if (err) {
                alert("An error ocurred reading the file :" + err.message);
                return;
            }
            /* csv */
            user_arr = data.split('\n');
            user_arr.shift(); //remove title
            user_arr = user_arr
                .map((userStr)=>{
                    return userStr.split(',').slice(0,3);
                })
                .filter(user => { return user[0] != "" })
            console.log(user_arr);
            server.loadUserData(user_arr, function (err, user_arr) {
                console.log(user_arr);
                showUserData(user_arr);
            });
        });
    });
});

function cancelOtherSeletedTr(){
    const SeletedTrs = document.querySelectorAll('tr.is-selected');
    SeletedTrs.forEach(function (isSeletedTr){
        var cancelBtn = isSeletedTr.querySelector(".cancelUpdate");
        cancelBtn.click();
    })
}

tbody.addEventListener('click', function (event) {
    const classList = event.target.classList;
    const targetTr = event.target.parentElement.parentElement;
    const targetCardTd = targetTr.querySelector("td.card-number");
    const targetUpdateTimeTd = targetTr.querySelector("td.update-time");
    const targetOperateTd = targetTr.querySelector("td.operate");
    const id = targetTr.dataset.id;

    if (classList.contains("updateCard")){
        cancelOtherSeletedTr();
        targetTr.classList.add('is-selected')
        targetOperateTd.innerHTML = `
            <button class="finishUpdate">完成</button>
            <button class="cancelUpdate">取消</button>
        `
        targetCardTd.innerHTML = `<input class="inputCard" type="TEXT">`;
        targetTr.querySelector("td.card-number input").focus();
    } else if (classList.contains("cancelUpdate")){
        targetTr.classList.remove('is-selected')
        targetOperateTd.innerHTML = `
            <button class="updateCard">修改</button>
        `
        server.selectUser(id,function(err,user){
            targetCardTd.innerHTML = user.card;
        })

    } else if (classList.contains("finishUpdate")) {
        const newCardNumber = targetTr.querySelector(".inputCard").value;
        targetTr.classList.remove('is-selected')
        targetOperateTd.innerHTML = `
            <button class="updateCard">修改</button>
        `
        server.updateUserCard(id,newCardNumber, function () {
            server.selectUser(id, function (err, user) {
                targetCardTd.innerHTML = user.card;
                targetUpdateTimeTd.innerHTML = user.update_time;
            })
        })
    }
})

tbody.addEventListener('keypress', function (event) {
    const classList = event.target.classList;
    const targetTr = event.target.parentElement.parentElement;
    const finishUpdateBtn = targetTr.querySelector(".finishUpdate");
    if (event.key==="Enter" && classList.contains("inputCard")) {
        finishUpdateBtn.click();
    }
});


function showUserData(user_arr) {
    var tbody = document.getElementById('js-user-tbody')
    function showOneUser(user) {
        let newTr = document.createElement('tr');
        newTr.innerHTML = `
        <td>${user.ID}</td>
        <td>${user.name}</td>
        <td class="card-number">${!user.card ? "" : user.card}</td>
        <td class="update-time">${user.update_time}</td>
        <td class="operate">
            <button class="updateCard">修改</button>
        </td>
    `
        newTr.dataset.id = user.ID;
        tbody.appendChild(newTr);
    }
    tbody.innerHTML = `<tr class="emptyTr">
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
    </tr>`;
    user_arr.forEach(showOneUser);
}


searchInput.addEventListener('keypress', function (event) {
    if (event.key === "Enter") {
        searchBtn.click();
    }
})
searchBtn.addEventListener('click',function(){
    server.selectAllUser(function (err, user_arr) {
        let search_key = searchInput.value;
        if (!search_key) {
            showUserData(user_arr);
            return;
        }
        let filter_user_arr = user_arr
            .filter(user => {
                return user.ID.includes(search_key) ||
                    user.name.includes(search_key)
            })
        showUserData(filter_user_arr);
    });
})

function initialize() {
    server.selectAllUser(function(err,user_arr){
        showUserData(user_arr);
    });
}

initialize();