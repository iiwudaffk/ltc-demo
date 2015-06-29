$(document).ready(function () {
    checkButtonVisibility_sc();
}); 


function checkButtonVisibility_sc () {
    console.log($('#screening-edit-btn'));
    if(sessionStorage.getItem('SCREENING_EDIT_QTSID')){
    } else {
        $('#screening-edit-btn').remove();
    }
}

function redirectToScreeningEdit() {
    if(sessionStorage.getItem('SCREENING_EDIT_QTSID')){
        sessionStorage.setItem("section", 1);
        loadContentPage('#content', contentPath + "screeningContent.html", null);
    } else {
        alert('ต้องทำการคัดกรองก่อน');
    }
    
}

function redirectToScreening() {
    sessionStorage.setItem("section", 1);
    sessionStorage.removeItem("SCREENING_EDIT_QTSID");
    loadContentPage('#content', contentPath + "screeningContent.html", null);
}