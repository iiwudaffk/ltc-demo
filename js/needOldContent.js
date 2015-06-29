
// sessionStorage -> NEED_EDIT_QTSID

var timelineIndex = 0;
var serviceEndPoint = 'http://newtestnew.azurewebsites.net/servicecontrol/gethpservice.svc/';

$(document).ready(function () {
    checkButtonVisibility();
});

function checkButtonVisibility () {
    if(sessionStorage.getItem('NEED_EDIT_QTSID')){
    } else {
        $('#need-edit-btn').hide();
    }
}



function redirectToNeedEdit(QTSID) {
    if(sessionStorage.getItem('NEED_EDIT_QTSID')){
        for (var i = 1; i < 7; i++) {
            sessionStorage.removeItem('NEED_USER_DATA' + i);
        }        
        sessionStorage.setItem("section", 1);
        loadContentPage('#content', contentPath + "needContent.html", null);
    } else {
        alert('ยังไม่ได้รับการประเมิณความต้องการ');
    }
}

function redirectToNeed() {
    if(sessionStorage.getItem('ASSESSMENT_EDIT_QTSID')){
        sessionStorage.setItem("section", 1);
        sessionStorage.removeItem("NEED_EDIT_QTSID");
        loadContentPage('#content', contentPath + "needContent.html", null);
    } else {
        alert('ต้องทำประเมินก่อน');
    }

    
}

