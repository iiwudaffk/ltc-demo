$(document).ready(function () {
    checkButtonVisibility_as();
});


function checkButtonVisibility_as () {
    if(sessionStorage.getItem('ASSESSMENT_EDIT_QTSID')){
    } else {
        $('#assessment-edit-btn').hide();
    }
}



function redirectToAssessmentEdit(QTSID) {
    if(sessionStorage.getItem('ASSESSMENT_EDIT_QTSID')){
        for (var i = 1; i < 7; i++) {
            sessionStorage.removeItem('ASSESSMENT_USER_DATA' + i);
        }
        sessionStorage.setItem("section", 1);
        loadContentPage('#content', contentPath + "assessmentContent.html", null);
    } else {
        alert('ต้องทำการประเมินก่อน');
    }    
}

function redirectToAssessment() {
    if(sessionStorage.getItem('SCREENING_EDIT_QTSID')){
        for (var i = 1; i < 7; i++) {
            sessionStorage.removeItem('ASSESSMENT_USER_DATA' + i);
        }
        sessionStorage.setItem("section", 1);
        sessionStorage.removeItem("ASSESSMENT_EDIT_QTSID"); // 
        loadContentPage('#content', contentPath + "assessmentContent.html", null);
    } else {
        alert('ต้องทำการคัดกรองก่อน');
    }  

    
    
}
