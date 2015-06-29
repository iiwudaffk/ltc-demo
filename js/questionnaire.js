function questionnaire(){
	$('.content-header h1').text('แบบสอบถาม');
	$('.row').empty();
    $('.content').empty();
}

function bindQuestionnaireContent() {
    loadContentPage('.content', contentPath + "questionnarireContent.html", bindSearchContent_callBack);
}