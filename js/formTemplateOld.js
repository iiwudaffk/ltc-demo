$(document).ready(function () {
    checkButtonVisibility_formTemplate();
}); 



function checkButtonVisibility_formTemplate () {
    if(sessionStorage.getItem('FORM_TEMPLATE_QTSID')){
    } else {
        $('#formTemplate-edit-btn').remove();
    }
    $('#formTemplate-new-btn').append('ทำ' + sessionStorage.getItem('FORM_TEMPLATE_HEADER'));
    $('#formTemplate-header').append(sessionStorage.getItem('FORM_TEMPLATE_HEADER'));
}

function redirectToFormTemplateEdit() {
    if(sessionStorage.getItem('FORM_TEMPLATE_QTSID')){
        sessionStorage.setItem('FORM_TEMPLATE_EDIT', true);
        loadContentPage('#content', contentPath + "formTemplate.html", null);
    } else {
        
    }
}

function redirectToFormTemplate() {
    sessionStorage.setItem("section", 1);
    sessionStorage.removeItem("FORM_TEMPLATE_QTSID");
    loadContentPage('#content', contentPath + "formTemplate.html", null);
}