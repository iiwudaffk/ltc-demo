var page = 0;

var peoplePerPage = 12;

function load_window () {
	// clearAllSession();
    
    loadContentPage('#content', contentPath + "searchContent.html", getRemainingList);
    bindDefaultMenu(); // add to sidebar
    
    sessionStorage.removeItem('CURRENTPERSON');
    
    $('#search_button').click ( function (){    	
    	onSearch_button_click();
    });

	 $('#search_input').keyup ( function (event) {
	 	if ( event.which == 13 ) {
	 		
	    	event.preventDefault();
	    	onSearch_button_click();
	 	}
	 });
}

function onSidebarMenu_click(cardName, element) {
	if (getCurrentCID()) {
		setActiveSession(element);
	    clearContent();
	    setCurrentTask(cardName); 
	    updatePersonProgress();
	 
	} else {
		alert('กรุณาเลือกคน');
	}
	// loadContentPage('#content', contentPath + "searchContent.html", getRemainingList); // load task
}

function onSearch_button_click () {
	startAjaxLoader();
	page = 0;
	loadContentPage('#content', contentPath + "searchContent.html");
	$('#progress-box').hide();
	
	var jdata = new Object();
        jdata['text'] = $('#search_input').val();
        jdata['host'] = getCurrentHostID();
        jdata['offset'] = page * peoplePerPage;
        jdata['next'] = peoplePerPage;
        jdata['task'] = 'ltc';
    ajaxCallGet(config_serviceEndPoint + 'getSearchPerson', jdata, onSearch_callback, 'Ajax call search.', onSearch_callbackError); 
}

function bulkScreening (element) {
	setActiveSession(element)
	loadContentPage('#content', contentPath + "importscreeningContent.html"); // load task
}


function main_search_click() {
	startAjaxLoader();
    page =  0;
	$('#searchContent').empty();
	getRemainingList();	
    
}

function sidebarSearch(element) {
	setActiveSession(element);

	loadContentPage('#content', contentPath + "searchContent.html", getRemainingList); // load task
}

function onLoadTaskComplete (formName) {
	getRemainingList();
}

function loadCurrentTaskForm(element) {		
	var cPerson = new Object();
        cPerson['CID'] = $(element).find('.personcard-cid h')[0].innerHTML;
        cPerson['name'] = $(element).find('.personcard-name h')[0].innerHTML;
        cPerson['img'] = 'img';
        
    sessionStorage.setItem("CURRENTPERSON", JSON.stringify(cPerson));

	setSidebarProfile(cPerson['CID'], cPerson['name'], 'http://nuqlis.blob.core.windows.net/pic/' + cPerson['CID']);
	clearContent();	
	 
	updatePersonProgress();
}

function load_person_timeline (element) { // from menu;
	if (getCurrentCID()) {
		setActiveSession(element);
		$('#progress-box').hide();
		loadContentPage('#content', contentPath + "timelineContent.html"); 
	} else {
		alert('กรุณาเลือกคน');
	}
}

function updatePersonProgress () {
	$('#progress-box').show(); // show
	ajaxCrossDomainGet(config_serviceEndPoint + 'GetCmStepProg?CID=' + getCurrentCID(), onUpdatePersonProgress_callback, 'updatePerson_error');
}

function onUpdatePersonProgress_callback(msg) {
	var progress = JSON.parse(msg);
	sessionStorage.removeItem("SCREENING_EDIT_QTSID");
	sessionStorage.removeItem("ASSESSMENT_EDIT_QTSID");
	sessionStorage.removeItem("NEED_EDIT_QTSID");
	sessionStorage.removeItem("PLANNING_EDIT_ENABLE");
	sessionStorage.removeItem("CM_PLANNO");

	if (progress) {
        if (progress.Data.Sc_QTSID) {
            sessionStorage.setItem("SCREENING_EDIT_QTSID", progress.Data.Sc_QTSID);
            sessionStorage.setItem("SCREENING_RECDATE", progress.Data.Sc_RecDate);
        }
        if (progress.Data.Ass_QTSID) {
            sessionStorage.setItem("ASSESSMENT_EDIT_QTSID", progress.Data.Ass_QTSID);
            sessionStorage.setItem("ASSESSMENT_RECDATE", progress.Data.Ass_RecDate);
        }
        if (progress.Data.Need_QTSID) {
            sessionStorage.setItem("NEED_EDIT_QTSID", progress.Data.Need_QTSID);
            sessionStorage.setItem("NEED_RECDATE", progress.Data.Need_RecDate);
        }
        if (progress.Data.Plan == "OK") {
            sessionStorage.setItem("PLANNING_EDIT_ENABLE",  true);
            sessionStorage.setItem("PLAN_RECDATE", progress.Data.Plan_RecDate);
        } 
        if (progress.PlanNo) { sessionStorage.setItem("CM_PLANNO",  progress.PlanNo); } 
    }
	
	$('#progress-box .box-body .progress-indicator').empty();
	
	if($.isEmptyObject(progress)){
		$('#progress-box .box-body .progress-indicator').append('<li><span class="bubble"></span> คัดกรอง </li>');
		$('#progress-box .box-body .progress-indicator').append('<li><span class="bubble"></span> ประเมิน </li>');
		$('#progress-box .box-body .progress-indicator').append('<li><span class="bubble"></span> ประเมินความต้องการ </li>');
		$('#progress-box .box-body .progress-indicator').append('<li><span class="bubble"></span> วางแผน </li>');
		$('#progress-box .box-body .progress-indicator').append('<li><span class="bubble"></span> แผนการดูแล </li>');
	} else {
		var data_ = progress.Data;
		if (data_.Screening == 'OK'){
			$('#progress-box .box-body .progress-indicator').append('<li class="completed"><span class="bubble"></span> คัดกรอง </li>');
		} else {
			$('#progress-box .box-body .progress-indicator').append('<li><span class="bubble"></span> คัดกรอง </li>');
		}

		if (data_.Assessment == 'OK'){
			$('#progress-box .box-body .progress-indicator').append('<li class="completed"><span class="bubble"></span> ประเมิน </li>');
		} else {
			$('#progress-box .box-body .progress-indicator').append('<li><span class="bubble"></span> ประเมิน </li>');
		}

		if (data_.NeedAssessment == 'OK'){
			$('#progress-box .box-body .progress-indicator').append('<li class="completed"><span class="bubble"></span> ประเมินความต้องการ </li>');
		} else {
			$('#progress-box .box-body .progress-indicator').append('<li><span class="bubble"></span> ประเมินความต้องการ </li>');
		}

		if (data_.Plan == 'OK'){
			$('#progress-box .box-body .progress-indicator').append('<li class="completed"><span class="bubble"></span> วางแผนบริการ </li>');
		} else {
			$('#progress-box .box-body .progress-indicator').append('<li><span class="bubble"></span> วางแผนบริการ </li>');
		}

		if (data_.Agreement == 'OK'){
			$('#progress-box .box-body .progress-indicator').append('<li class="completed"><span class="bubble"></span> แผนการดูแล </li>');
		} else {
			$('#progress-box .box-body .progress-indicator').append('<li><span class="bubble"></span> แผนการดูแล </li>');
		}
	}
	$('#progress-box').show();
	switch (sessionStorage.getItem("CURRENTTASK")) {
            case "profile" :
                loadContentPage('#content', contentPath + "profileContent.html");
                break;
			case "screening" :			
				loadContentPage('#content', contentPath + "screeningOldContent.html");
				break;
			case "assessment" :			
				loadContentPage('#content', contentPath + "assessmentOldContent.html");
				break;
			case "need" :		
				loadContentPage('#content', contentPath + "needOldContent.html");
				break;
			case "plan" :			
				loadContentPage('#content', contentPath + "planningOldContent.html");
				break;
			case "care" :
                sessionStorage.setItem('PDF_TYPE', 'CARE_AGREEMENT');
				//loadContentPage('#content', contentPath + "pdfReport.html");
        loadContentPage('#content', contentPath + "reportPerPersonContent.html");
        //        $('#content').attr('style','height: 450px;');
				break;		
			default:
				break;
	}
}


//get
function getRemainingList () {
	startAjaxLoader();
	$('#progress-box').hide();
	$('#main_search_group').show();

	$('#main_search_input').unbind();
	$('#main_search_input').keyup ( function (event) {
     	if ( event.which == 13 ) {
     		startAjaxLoader();
	    	$('#searchContent').empty();
			getRemainingList();	
	 	}

     });
	// do get remaing list (people)
    
    var result_type = $('#result-type').val();
    console.log(result_type);
    
    if (result_type == '99999') {
        var jdata = new Object();
        jdata['text'] = $('#main_search_input').val();
        jdata['host'] = getCurrentHostID();
        jdata['offset'] = page * peoplePerPage;
        jdata['next'] = peoplePerPage;
        jdata['task'] = 'ltc';
    
    ajaxCallGet(config_serviceEndPoint + 'getSearchPerson', jdata, getRemainingList_callback, 'Ajax call search.', getRemainingList_callbackError); 
    } else {
        var offset = page * peoplePerPage;
        
        ajaxCrossDomainGet(config_serviceEndPoint +
        'GetPersonFromReportCategory?hostid=' + getCurrentHostID() +
        '&category=00033' +
        '&result=' + result_type +
        '&text=' + $('#main_search_input').val() +
        '&year=1&month=0&day=0&timeoption=ge&offset=' + offset + '&next='+ peoplePerPage +'&src=00&type=qtid',
        getRemainingList_callback);
    }
    
}

function getRemainingList_callbackError () {
	stopAjaxLoader();
}

function getRemainingList_callback (result) {
    var result_type = $('#result-type').val();
    
	var data = [];
	var imgLink = "/img/avatar-placeholder.png";

	data_ = JSON.parse(result);
    
    $('#totalPersonCount').empty().append('จำนวน ' + data_['count_data'] + ' คน');
    var total = data_['count_data'];
    
    $('#search-paging').empty().append( String(page + 1) + '/' + Math.ceil( total / 12));
    
    console.log(data_);
	if (data_.status != 'error') {
	    if (result_type == '99999') {
            data = data_.data;
        } else {
            data = data_['data']['personlist'];
        }
        
        console.log(data);
         
	    var $container = $('#searchContent');

	    // people card
	    if (data.length > 0) {
	        for (var i = 0; i < data.length; i++) {
	            var $divCol = $("<div>", { class: "col-lg-2 col-xs-6" }); // card-container

	            var $divCard = $("<div>", { class: "personcard" });
	            var $divAvatar = $("<div>", { class: "personcard-avatar" });
	            $divAvatar.append('<img style="width:120px; height:120px; border-radius:50%" src="' + data[i].PIC + '" onerror="imgError(this)" />');

	            var $divName = $("<div>", { class: "personcard-name" });
	            $divName.append("<h>" + data[i].firstname + " " + data[i].lastname + "</h>");

	            var $divCID = $("<div>", { class: "personcard-cid" });
                if (result_type == '99999'){
                    var cid = data[i].CID;
                } else {
                    var cid = data[i].cid;
                }
	            $divCID.append("<h>" + cid + "</h>");
	            // $divSmallBox.append(data[i].Desc);
	            $divCard.append($divAvatar);
	            $divCard.append($divName);
	            $divCard.append($divCID);

	            $divCard.attr("onclick", "viewTimeline(this)");

	            $divCol.append($divCard);
	            $container.append($divCol);
	        }
	    }
	    else {
	        var $divCol = $("<div>", { class: "col-md-12" });
	        $container.append($divCol.append($("<div>").append("<h>ไม่พบข้อมูล</h>")));
	        console.log("data is empty array");
	    }
	    stopAjaxLoader();
	}
	stopAjaxLoader();

}

function setActiveSession(target_){
	$('.sidebar-menu li').each( function (){
		$(this).removeClass("active");
	});

	var $target = $(target_);
	$target.parent().addClass("active");
}

function getCareAgreementList (element) {
	setActiveSession(element);

	$('#content').empty();
	$('#progress-box').hide();	
}

function getCareAgreementList_callback () {
	var data = [];
	var imgLink = "/img/avatar-placeholder.png";

	$.getJSON('../js/careAgreementList.txt', function (data_) {
		
		data = data_.data;
		var $container = $('#searchContent');

		// people card
		for (var i = 0; i < data.length; i++) {         
	            var $divCol = $("<div>", { class : "col-lg-2 col-xs-3"}); // card-container

	            var $divCard = $("<div>", { class : "personcard"});
	            var $divAvatar = $("<div>", { class : "personcard-avatar"});
	           	$divAvatar.append('<img style="width:120px; height:120px; border-radius:50%" src="http://nuqlis.blob.core.windows.net/pic/' + data[i].CID + '" onerror="imgError(this)" />');

	            var $divName = $("<div>", {class : "personcard-name"});
	            $divName.append("<h>" + data[i].firstname+" "+ data[i].lastname + "</h>");

	            var $divCID = $("<div>", {class : "personcard-cid"});
	            $divCID.append("<h>" + data[i].CID+ "</h>");
	            // $divSmallBox.append(data[i].Desc);
	            $divCard.append($divAvatar);
	            $divCard.append($divName);
	            $divCard.append($divCID);

	            $divCard.attr("onclick", 'viewCareAgreement("'+String(data[i].CID)+'","'+data[i].firstname+'")');

	            $divCol.append($divCard);
	            $container.append($divCol);
	    }  
	});
	$('.box-footer').remove();
	$('#main_search_group').empty();
	$('#main_search_group').append('เลือกคนที่ต้องการดูแผนการดูแล');
}

function viewCareAgreement(element) {
	if (getCurrentCID()) {
		setActiveSession(element);
		$('#content').empty().attr('style', 'height:500px');
		loadContentPage('#content', contentPath + "careAgreementContent.html");
	} else {
		alert('กรุณาเลือกคน');
	}
}

function viewTimeline(element) {
	var cPerson = new Object();
        cPerson['CID'] = $(element).find('.personcard-cid h')[0].innerHTML;
        cPerson['name'] = $(element).find('.personcard-name h')[0].innerHTML;
        cPerson['img'] = 'img';

    setSidebarProfile(cPerson['CID'], cPerson['name'], 'http://nuqlis.blob.core.windows.net/pic/' + cPerson['CID']);
        
    sessionStorage.setItem("CURRENTPERSON", JSON.stringify(cPerson));

	loadContentPage('#content', contentPath + "timelineContent.html");
}

function prev_click () {	
	if(page >= 1) {
		page--;
	}
	$('#searchContent').empty();
	getRemainingList();

}

function next_click () {	
	page++;
	$('#searchContent').empty();
	getRemainingList();
}

function redirectToCareAgreement (msg) {
	var r = JSON.parse(msg);
	$('#progress-box').hide();
	if (Number(r.Val) != 0 && Number(r.Val)){
		$('#content').empty();		

		var $content = $('#content');
		var $box = $('<div>', { class : 'box'});
		var $box_header = $('<div>', { class : 'box-header'});
		$box_header.attr ('style', 'border-bottom: 1px solid #f4f4f4; padding: 10px;');
		$box_header.append ('แผนการดูแลของ&nbsp;' + getCurrentName());

		var $box_body = $('<div>', { class : 'box-body'});
		var $iframe = $('<iframe>');
		$iframe.attr('src', 'http://newtestnew.azurewebsites.net/Report/LongTermCare/CareAgreement/CareAgreement.aspx?CID='+getCurrentCID()+'&CMPlanNo='+ r.Val);
		$iframe.attr('style', 'width:100%; height:550px');
		$iframe.attr('frameBorder', 0);

		$iframe.ready(function () {
		    
		    startAjaxLoader();
		});
		$iframe.load(function () {
		    stopAjaxLoader();
		});

		$box_body.append($iframe);

		$box.append($box_header);
		$box.append($box_body);

		$content.append($box);
	} 	else {
		alert('กรุณาทำแบบประเมิน 5 ด้านก่อน');
	}
	
}	

function main_dashboard (element) {
    if (element) { setActiveSession(element); }
    loadContentPage('#content', contentPath + "main-dashboard.html", getRemainingList);
}

function loadServiceProvision(element) {
    if (element) { setActiveSession(element); }
    loadContentPage('#content', contentPath + "serviceProvisionContent.html" );
}

function loadHealthAssessment (fid, qtid) {
    if ( getCurrentCID()){
        startAjaxLoader();
        sessionStorage.removeItem('HEALTH_ASSESSMENT_QTID');
        if (qtid) { sessionStorage.setItem('HEALTH_ASSESSMENT_QTID', qtid); }
        ajaxCrossDomainGet(config_serviceEndPoint + 'GetFormHistory?CID=' + getCurrentCID() + '&fid=' + fid + '&src=00&offset=0&next=1', loadHealthAssessment_callback);
    } else {
        alert('กรุณาเลือกคน');
    }    
}

function loadHealthAssessment_callback (msg) {
    var data = JSON.parse(msg);
    
    console.log(data);
    
    sessionStorage.removeItem('HEALTH_ASSESSMENT_QTSID');
    sessionStorage.removeItem('HEALTH_ASSESSMENT_EDIT');
    
    if (data.length > 0) {
        if (data[0]['QTSID']) { sessionStorage.setItem('HEALTH_ASSESSMENT_QTSID', data[0]['QTSID']); }
    }
    stopAjaxLoader();
    loadContentPage('#content', contentPath + "healthAssessmentOld.html" );
}

function loadBulkHealthAssessment(element) {
    if (element) { setActiveSession(element); }
    loadContentPage('#content', contentPath + "bulkHealthAssessment.html" );
}

function loadFormTemplate (fid, qtid, header) {
    console.log(header);
    if ( getCurrentCID()){
        startAjaxLoader();
        sessionStorage.setItem('FORM_TEMPLATE_HEADER', header);
        sessionStorage.removeItem('FORM_TEMPLATE_QTID');
        if (qtid) { sessionStorage.setItem('FORM_TEMPLATE_QTID', qtid); }
        ajaxCrossDomainGet(config_serviceEndPoint + 'GetFormHistory?CID=' + getCurrentCID() + '&fid=' + fid + '&src=00&offset=0&next=1', loadFormTemplate_callback);
    } else {
        alert('กรุณาเลือกคน');
    }    
}

function loadFormTemplate_callback(msg) {
    var data = JSON.parse(msg);
    
    console.log(data);
    
    sessionStorage.removeItem('FORM_TEMPLATE_QTSID');
    sessionStorage.removeItem('FORM_TEMPLATE_EDITABLE');
    
    if (data.length > 0) {
        if (data[0]['QTSID']) { sessionStorage.setItem('FORM_TEMPLATE_QTSID', data[0]['QTSID']); }
    }
    stopAjaxLoader();
    loadContentPage('#content', contentPath + "formTemplateOld.html" );
}

function getOPTReport () {
    sessionStorage.setItem('PDF_TYPE', 'OPT');
    getReportData(sessionStorage.getItem('PDF_TYPE'));
}