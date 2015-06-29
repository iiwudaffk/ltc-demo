
// SessionStorage -> EXPAND_PAGE, FORM_QTID, FORM_RESULT
var screeningStr = 'SCREENING', assessmentStr = 'ASSESSMENT', needStr = 'NEEDASSESSMENT';
var session_form_type = 'FORM_TYPE'; // is SCREENING or ASSESSMENT or NEEDASSESSMENT
var session_form_qtid = 'FORM_QTID';
var session_form_result = 'FORM_RESULT';
var page = 0;

$(document).ready(function () {
	console.clear();
    sessionStorage.setItem('EXPAND_PAGE', 0);
    $('a#expand_prev_button').hide();
	
	var form_type = sessionStorage.getItem('FORM_TYPE');
	if(form_type.split('_').length == 2){  
		// is not complete task
		$('#assessment-qtid').remove();
		$('#result-type').remove();
		$('#submit-button').remove();
		getInitPersonListInComplete(form_type.split('_')[0].toLowerCase(), getCurrentHostID(), 0);
	}
	else{	
		if (form_type == "SCREENING") {
			$('#assessment-qtid').remove();
		} else if (form_type == "NEED" ){
			$('#assessment-qtid').remove();
			$('#result-type').remove();
			$('#submit-button').remove();
		} else if (form_type == "PLAN" ){
			$('#assessment-qtid').remove();
			$('#result-type').remove();
			$('#submit-button').remove();  
		}
		
		sessionStorage.removeItem('FORM_QTID');
		sessionStorage.removeItem('FORM_RESULT');
		
		getInitPersonList(sessionStorage.getItem('FORM_TYPE'), getCurrentHostID(), 0);
		//getExpandPersonList('00033', '00002', 'HT1020001', 0);

		$('#assessment-qtid').change ( function () {
				if ($(this).val() == "00002") {
					$('#result-type').empty();
					$('#result-type').append('<option value="99999">ทุกกลุ่ม</option>');
					$('#result-type').append('<option value="00001">กลุ่มที่ 1 ผู้สูงอายุที่ช่วยเหลือตัวเองได้ (ติดสังคม)</option>');
					$('#result-type').append('<option value="00002">กลุ่มที่ 2 ผู้สูงอายุที่ช่วยเหลือตัวเองได้บ้าง (ติดบ้าน)</option>');
					$('#result-type').append('<option value="00003">กลุ่มที่ 3 ผู้สูงอายุที่ช่วยเหลือตัวเองไม่ได้ (ติดเตียง)</option>');
				} else {
					$('#result-type').empty();
					$('#result-type').append('<option value="99999">ทุกกลุ่ม</option>');
					$('#result-type').append('<option value="00028">ไม่จำเป็นต้องส่งผู้เชี่ยวชาญ</option>');
					$('#result-type').append('<option value="00029">จำเป็นต้องส่งผู้เชี่ยวชาญ</option>');
				}
		});
	}
});

function getInitPersonListInComplete(formType, hostID, offset){
	var url = config_serviceEndPoint+ 'GetListPersonReportCategory?HostID=' + getCurrentHostID() +'&category=' + formType + '&result&offset=' + offset + '&next=10&src=00&complete=no';
	ajaxCrossDomainGet(url, getInitPersonListInComplete_callBack);
}
function getInitPersonListInComplete_callBack(msg){	
	if (msg) {        
        var data = JSON.parse(msg);
        if (data['status'].toUpperCase() == 'OK') {            
			var form_type = (sessionStorage.getItem('FORM_TYPE').split('_')[0]).toUpperCase();
			if(form_type == 'SCREENING'){
				$('#expand-header h2').text('รายชื่อผู้ที่ยังไม่ได้ดำเนินการคัดกรองศักยภาพ');
			}
			else if(form_type == 'ASSESSMENT'){
				$('#expand-header h2').text('รายชื่อผู้ที่ยังไม่ได้ดำเนินการประเมินสำหรับการดูแลระยะยาว');
			}
			else if(form_type == 'NEED'){
				$('#expand-header h2').text('รายชื่อผู้ที่ยังไม่ได้ดำเนินการประเมินความต้องการ');
			}
			else if(form_type == 'PLAN'){
				$('#expand-header h2').text('รายชื่อผู้ที่ยังไม่ได้ดำเนินการจัดทำแผนการดูแล');
			}
			
            var tmp = data['data']['personlist'];            
            var person = new Array();
            for (var i = 0; i < tmp.length; i++) {
                var obj = new Object();
                obj['CID'] = tmp[i]['cid'];
                obj['NAME'] = tmp[i]['firstname'] + ' ' + tmp[i]['lastname'];
                obj['IMG'] = tmp[i]['pic'];
                person.push(obj);
            }
            bindExpandListIncomplete(person);
        }
        else {
            alert('Status error : ' + data['errorMessage']);
        }
    }
    else {
        alert('ไม่สามารถโหลดรายชื่อได้!');
    }
}

function pdfPrint() {   
    sessionStorage.setItem('PDF_TYPE', sessionStorage.getItem('FORM_TYPE'));
    loadContentPage('#content', contentPath + "pdfReport.html");
    $('#content').attr('style','height: 450px;');    
}

function summary_filter () {
    var formType = sessionStorage.getItem('FORM_TYPE');
    if (formType == "SCREENING"){
        var result_type = $('#result-type').val();
        if (result_type == "99999") { // all
            getInitPersonList(formType, getCurrentHostID(), 0);
        } else {
            getExpandPersonList("00033", result_type, getCurrentHostID(), 0) ;
        }
    } else if (formType == "ASSESSMENT"){
        var result_type = $('#result-type').val();
        var formID = $('#assessment-qtid').val();

        if (result_type == "99999"){
            getInitPersonList(formType, getCurrentHostID(), 0);
        } else {
            getExpandPersonList(formID, result_type, getCurrentHostID(), 0) ;
        }
    }
}

function getInitPersonList(formType, hostID, offset) { // cat SCREENING 00001 ; ASSESSMENT 00002
    console.log('init list');
    if (formType === "SCREENING") {
        var formID = '00001';
        var type = 'fid';
    } else if (formType === "ASSESSMENT") {
        var formID = '00001';
        var type = 'qtid';
        // sessionStorage.setItem('FORM_RESULT', "00001");
    } else if (formType === "NEED") {
        var formID = '00012';
        var type = 'fid';
    } else if (formType === "PLAN") {
        var formID = 'plan';
        var type = 'plan';
    }
    

    ajaxCrossDomainGet(config_serviceEndPoint +
        'GetPersonFromReportCategory?hostid=' + hostID +
        '&result=&category=' + formID +
        '&year=1&month=0&day=0&timeoption=ge&offset=' + offset + '&next=10&src=00&type=' + type,
        getExpandPersonList_callBack);
}

function getExpandPersonList(formID, resultType, hostID, offset) {
    
    ajaxCrossDomainGet(config_serviceEndPoint +
        'GetPersonFromReportCategory?hostid=' + hostID +
        '&category=' + formID +
        '&result=' + resultType +
        '&year=1&month=0&day=0&timeoption=ge&offset=' + offset + '&next=10&src=00&type=qtid',
        getExpandPersonList_callBack);
}


function getExpandPersonList_callBack(msg) {
     console.log(msg);
    if (msg) {        
        var data = JSON.parse(msg);
        if (data['status'].toUpperCase() == 'OK') {
            $('#expand-header h2').text(data['data']['qtdesc'] + ' : ' + data['data']['resultdesc']);
            var tmp = data['data']['personlist'];            
            var person = new Array();
            for (var i = 0; i < tmp.length; i++) {
                var obj = new Object();
                obj['CID'] = tmp[i]['cid'];
                obj['NAME'] = tmp[i]['firstname'] + ' ' + tmp[i]['lastname'];
                obj['IMG'] = tmp[i]['pic'];
                person.push(obj);
            }
            bindExpandList(person);
        }
        else {
            alert('Status error : ' + data['errorMessage']);
        }
    }
    else {
        alert('ไม่สามารถโหลดรายชื่อได้!');
    }

    if (!sessionStorage.getItem('FORM_QTID') && !sessionStorage.getItem('FORM_RESULT')) {
        $('#expand-header h2').hide();
    } else {
        $('#expand-header h2').show();
    }

}

function bindExpandListIncomplete(data) {
    var pageIndex = Number(sessionStorage.getItem("EXPAND_PAGE"));
    if (pageIndex == 0) {
        $('a#expand_prev_button').hide();
    }
    else {
        $('a#expand_prev_button').show();
    }

    if (data.length < 10) {
        $('a#expand_next_button').hide();
    }
    else {
        $('a#expand_next_button').show();
    }
    var $expand = $('#integration-list ul').last().empty();
    for (var i = 0; i < data.length; i++) {
        $expand.append(createExpand_li_incomplete(data[i]['CID'], data[i]['NAME'], data[i]['IMG']));
    }
}

function bindExpandList(data) {
    var pageIndex = Number(sessionStorage.getItem("EXPAND_PAGE"));
    if (pageIndex == 0) {
        $('a#expand_prev_button').hide();
    }
    else {
        $('a#expand_prev_button').show();
    }

    if (data.length < 10) {
        $('a#expand_next_button').hide();
    }
    else {
        $('a#expand_next_button').show();
    }
    var $expand = $('#integration-list ul').last().empty();
    for (var i = 0; i < data.length; i++) {
        $expand.append(createExpand_li(data[i]['CID'], data[i]['NAME'], data[i]['IMG']));
    }
    $(".expand").on("click", function () {
        $(this).next().slideToggle(100);
        $expand = $(this).find(">:first-child");
        var isExpand = false;
        if ($expand.text() == "+") {
            isExpand = true;
            $expand.text("-");
        } else {
            $expand.text("+");
        }

        if (isExpand) {
            var CID = $(this).find('span').text();
            $('#detail-' + CID).find('.box.box-warning div').empty();
            $.ajax({
                url: config_serviceEndPoint + 'GetMaxCMPlanNo?CID=' + CID + '&src=00',
                dataType: 'jsonp',
                success: function (msg) {
                    getMaxPlan_callBack((JSON.parse(msg))['Val'], CID);
                },
                error: function (request, status, error) {
                    alert('ไม่สามารถโหลดข้อมูล เลขที่แผนบริการได้!');
                }
            });
        }
    });
}
function getMaxPlan_callBack(planID, cid) {
    ajaxCrossDomainGet(config_serviceEndPoint + 'GetCMElderTLDetail?CID=' + cid + '&cmPlanNo=' + planID, getPlanDetails_callBack);
}

function getPlanDetails_callBack(data) {
    var jdata = JSON.parse(data);
    var CID = jdata['CID'];
    var type = sessionStorage.getItem(session_form_type);
    if (type) {
        if (type.toUpperCase() == screeningStr) {
            getExpandData(CID, jdata['Screening']);
        }
        else if (type.toUpperCase() == assessmentStr) {
            getExpandData(CID, jdata['Assessment']);
        }
        else if (type.toUpperCase() == needStr) {
            getExpandData(CID, jdata['NeedAssessment']);
        }
    }
}
function getExpandData(CID, jdata) {
    var recDate = jdata['RecDate'];
    var staff = jdata['Staff'];
    var qtsid = jdata['QTSID'];

    var data = jdata['DATA'];
    var $panel = $('#detail-' + CID).find('.box.box-warning div');
    for (var i = 0; i < data.length; i++) {
        var QTDesc = data[i]['QTDesc'];
        var qtid = data[i]['QTID'];
        var result = data[i]['Result'];
        var resultID = data[i]['ResultID'];
        
            if (i == 0) {
                $panel.append(createExpand_li_header(CID, QTDesc, resultID, result, recDate, staff, qtid, qtsid, true));
            }
            else {
                $panel.append(createExpand_li_header(CID, QTDesc, resultID, result, recDate, staff, qtid, qtsid, false));
            }
    }  
}

function createExpand_li_header(CID, text, resultID, result, date, staff, qtid, qtsid, hasHeader) {
    var $li = $("<li>", { class: "timeline-wrapper", 'data-toggle': true });
    var $item_body = $("<div>", { class: "timeline-body" });
    $item_body.append('<div style="width: 350px; display: inline-block;">' + text + '</div>');
    var id = CID + ':' + qtid + ':' + qtsid;

    switch (resultID) {
        case "00001":
            $item_body.append('<div id="' + id + '" onclick="expandDetailClick(this);" style="cursor:pointer; color:green; display: inline-block;"><i class="fa fa-smile-o"></i> &nbsp;' + result + '</div>');
            break;
        case "00002":
            $item_body.append('<div id="' + id + '" onclick="expandDetailClick(this);" style="cursor:pointer; color:orange; display: inline-block;"><i class="fa fa-meh-o"></i> &nbsp;' + result + '</div>');
            break;
        case "00003":
            $item_body.append('<div id="' + id + '" onclick="expandDetailClick(this);" style="cursor:pointer; color:red; display: inline-block;"><i class="fa fa-frown-o"></i> &nbsp;' + result + '</div>');
            break;
        case "00028":
            $item_body.append('<div id="' + id + '" onclick="expandDetailClick(this);" style="cursor:pointer; color:green; display: inline-block;"><i class="fa fa-smile-o"></i> &nbsp;' + result + '</div>');
            break;
        case "00029":
            $item_body.append('<div id="' + id + '" onclick="expandDetailClick(this);" style="cursor:pointer; color:red; display: inline-block;"><i class="fa fa-frown-o"></i> &nbsp;' + result + '</div>');
            break;
        default:
            break;
    }

    var $item = $("<div>", { class: "timeline-item" });
    if (hasHeader) {
        $item.append('<h2 class="timeline-header">' + date + ' : คัดกรอง โดย ' + staff + '</h2>');
    }
    $item.append($item_body);

    return $li.append($item);
}

function expandDetailClick(div) {
    var id = $(div).attr('id').split(':'); // cid qtid qtsid
    if (id.length == 3) {
        var $li = $(div).parent().parent().parent();
        var toggle = $li.attr('data-toggle');
        if (toggle == 'true') {
            $li.attr('data-toggle', false);
        }
        else {
            $li.attr('data-toggle', true);
        }
        $li.find(".timeline-body:gt(0), hr").remove();
        if (toggle == 'true') {
            // get all Q&A
            $.ajax({
                url: config_serviceEndPoint + 'GetQShowData?CID=' + id[0] + '&qtid=' + id[1] + '&qtsid=' + id[2] + '&src=00',
                dataType: 'jsonp',
                success: function (msg) {
                    getExpandQA_callBack($li, msg, id[0]);
                },
                error: function (request, status, error) {
                    alert('ไม่สามารถโหลดข้อมูล คำตอบเก่า!');
                }
            });
        }
    }
    else {
        alert('ไม่สามารถดูข้อมูลได้ ข้อมูล CID QTID  QTSID ไม่ครบ');
    }
}

function getExpandQA_callBack($panel, data, CID) {
    var jdata = JSON.parse(data);
   // var $panel = $('#detail-' + CID).find('.box.box-warning div li').last();
    $panel.append('<hr />');

    for (var i = 0; i < jdata.length; i++) {
        var Q = jdata[i]['text'];
        var A = jdata[i]['answer'][0]['text'];
        $panel.append(createExpand_li_QA((i + 1), Q, A));
    }
}

function createExpand_li_QA(index, Q, A) {
    var $screening_item_body = $("<div>", { class: "timeline-body" });
    $screening_item_body.append('<div style="width: 50%; display: inline-block;">' + index + '.&nbsp;' + Q + '</div>');
    $screening_item_body.append('<div style="width: 50%; display: inline-block;"> &nbsp;' + A + '</div>');
    return $screening_item_body;
}

function createExpand_li(cid, name, img) {
    return $("<li>").append(
            '<a class="expand">' +
                '<div class="right-arrow">+</div>' +
                '<div class="icon">' +
                '    <img src="' + img + '" onerror="imgError(this);" />' +
                '</div>' +
                '<h2>' + name + '</h2>' +
                '<span>' + cid + '</span>' +
            '</a>' +
            '<div class="detail" id="detail-' + cid + '">' +
            '    <div>' +
            '        <div class="row">' +
            '            <div class="col-md-12">' +
            '                <div class="box box-warning">' +
            '                    <div style="padding:15px"></div>' +
            '                </div>' +
            '            </div>' +
            '        </div>' +
            '    </div>' +
            '</div>');
}

function createExpand_li_incomplete(cid, name, img) {
    return $("<li>").append(
            '<a class="expand" style="cursor:default;width:35%;display:inline-block">' +
                '<div class="icon">' +
                '    <img src="' + img + '" onerror="imgError(this);" />' +
                '</div>' +
                '<h2>' + name + '</h2>' +
                '<span>' + cid + '</span>' +
            '</a>' +
			'<a style="width:100px;margin-top:-30px" onclick="expand_person_click(this);" class="btn btn-primary">รายละเอียด</a>'
			);
}

function expand_person_click(ele){
	var a = $(ele).prev();
	var CID = a.find('span').text();
    var name = a.find('h2').text();
    var img = a.find('div img').attr('src');
	
	var cPerson = new Object();
    cPerson['CID'] = CID;
    cPerson['name'] = name;
    cPerson['img'] = img;
    sessionStorage.setItem("CURRENTPERSON", JSON.stringify(cPerson));
	setSidebarProfile(CID, name, img);
	var menu = $('.sidebar-menu li a span').filter(function() {
		return $(this).text() == "ไทม์ไลน์";
	}).parent();
	onSidebarMenu_click("timeline", menu);
	loadContentPage('#content', contentPath + "timelineContent.html");
}

function expandprev_click() {
    var pageIndex = Number(sessionStorage.getItem("EXPAND_PAGE"));
    pageIndex--;
    sessionStorage.setItem("EXPAND_PAGE", pageIndex);
    if (page > 0) {
        page--;
    }
    var offset = page * 10;
    var formType = sessionStorage.getItem('FORM_TYPE');
    if(formType.split('').length == 2){
        getInitPersonListInComplete(formType.split('_')[0].toLowerCase(), getCurrentHostID(), offset);
    }
    else{
        if (formType == "SCREENING"){
            var result_type = $('#result-type').val();
            if (result_type == "99999") { // all
                getInitPersonList(formType, getCurrentHostID(), offset);
            } else {
                getExpandPersonList("00033", result_type, getCurrentHostID(), offset) ;
            }
        } else if (formType == "ASSESSMENT"){
    var result_type = $('#result-type').val();
    var formID = $('#assessment-qtid').val();

        if (result_type == "99999"){
            getInitPersonList(formType, getCurrentHostID(), offset);
        } else {
            getExpandPersonList(formID, result_type, getCurrentHostID(), offset) ;
        }
    } else  {
        getInitPersonList(formType, getCurrentHostID(), offset);
    }
    }
}

function expand_next_click() {
	var pageIndex = Number(sessionStorage.getItem("EXPAND_PAGE"));
	pageIndex++;
	sessionStorage.setItem("EXPAND_PAGE", pageIndex);
    page++;
    var offset = page * 10;
    var formType = sessionStorage.getItem('FORM_TYPE');
	if(formType.split('_').length == 2){  
		getInitPersonListInComplete(formType.split('_')[0].toLowerCase(), getCurrentHostID(), offset);
	}
	else{
		if (formType == "SCREENING"){
			var result_type = $('#result-type').val();
			if (result_type == "99999") { // all
				getInitPersonList(formType, getCurrentHostID(), offset);
			} else {
				getExpandPersonList("00033", result_type, getCurrentHostID(), offset) ;
			}
		} else if (formType == "ASSESSMENT"){
			var result_type = $('#result-type').val();
			var formID = $('#assessment-qtid').val();

			if (result_type == "99999"){
				getInitPersonList(formType, getCurrentHostID(), offset);
			} else {
				getExpandPersonList(formID, result_type, getCurrentHostID(), offset) ;
			}
		}
	}
}