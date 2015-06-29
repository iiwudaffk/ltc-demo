$(document).ready(function () {
    checkButtonVisibility_health();
}); 



function checkButtonVisibility_health () {
    if(sessionStorage.getItem('HEALTH_ASSESSMENT_QTSID')){
    } else {
        $('#healthAssessment-edit-btn').remove();
    }
}

function redirectToHealthAssessmentEdit() {
    if(sessionStorage.getItem('HEALTH_ASSESSMENT_QTSID')){
        sessionStorage.setItem('HEALTH_ASSESSMENT_EDIT', true);
        loadContentPage('#content', contentPath + "healthAssessment.html", null);
    } else {
        
    }
}

function redirectToHealthAssessment() {
    sessionStorage.setItem("section", 1);
    sessionStorage.removeItem("SCREENING_EDIT_QTSID");
    loadContentPage('#content', contentPath + "healthAssessment.html", null);
}