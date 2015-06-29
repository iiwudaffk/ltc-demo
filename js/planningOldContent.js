$(document).ready(function () {
    checkButtonVisibility_plan();
}); 

function checkButtonVisibility_plan () {
    if(sessionStorage.getItem('PLANNING_EDIT_ENABLE')){
    } else {
        $('#planning-edit-btn').remove();
    }
}

function redirectToPlanningEdit(QTSID) {
    if(sessionStorage.getItem('PLANNING_EDIT_ENABLE')){
        sessionStorage.setItem("section", 1);
        sessionStorage.setItem("PLANNING_IS_EDIT", true);
        loadContentPage('#content', contentPath + "planningContent.html", null);
    } else {
        alert('ต้องทำการวางแผนก่อน');
    }
    
}

function redirectToPlanning() {
    if(sessionStorage.getItem('ASSESSMENT_EDIT_QTSID')){
        sessionStorage.setItem("section", 1);
        loadContentPage('#content', contentPath + "planningContent.html", null);
    } else {
        alert('ต้องทำการประเมินก่อน');
    }
}