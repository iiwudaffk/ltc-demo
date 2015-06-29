
// sessionStorage key =  CURRENTPERSON

var idleTime = 0;
var idleInterval;

$(document).ready(function () {
    idleInterval = setInterval(timerIncrement(idleTime), 60000);
    $(this).click(function (e) {
        idleTime = 0;
    });
    $(this).keypress(function (e) {
        idleTime = 0;
    });

    bindCurrentPerson();
});

function timerIncrement(time) {
    var temptime = time + 1;
    if (temptime > 14) { // 15 minutes
        alert("Session หมดอายุ.. ระบบกำลังพากลับไปหน้าแรก..");
        ClearSessionWithOutRoleIndex('');
        window.location = "/Default.aspx";
    }
}

function bindCurrentPerson() {
    var person = sessionStorage.getItem("CURRENTPERSON");
    if (person != null) {
        var data = JSON.parse(person);
        setSidebarProfile(data['CID'], data['name'], data['img']);
        bindDefaultMenu(data['CID']);
    }
}

