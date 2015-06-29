// sessionStorage -> section
// sessionStorage -> NEEDSECTIONNAME[1...6]=section name 1...6
// sessionStorage -> NEEDQA[1...6]=section name 1...6
// sessionStorage -> NEED_USER_DATA[1...6]

var needQTID = ["00040", "00041","00042","00043"]; //*
var assessmentURL = 'http://localhost:2591/ServiceControl/GetService.svc/'; //**

var needResultArr = [];
$(document).ready(function () {
    // getMaxCMPlanNo_ajax();
    $('.content-header h1').text('ประวัติการทำแบบประเมินผู้สูงอายุ สำหรับ ' + getCurrentName());
    $('#recdate-input').datepicker({
        language: 'th-en',
        format: 'dd-mm-yyyy'
    });
    $('.datepicker.datepicker-dropdown.dropdown-menu').css('width', '250px');
    for (var i = 1; i < needQTID.length + 1; i++) {
        sessionStorage.removeItem('NEED_USER_DATA' + i);
    }
    bindSectionName();
    bindQuestion();
    checkAssessmentButtonAndVisible();
    
});

function loadUserData(section, qtsid) {
    $.ajax({
        url: config_serviceEndPoint + 'GetQShowData?CID=' + getCurrentCID() + '&qtid=' + needQTID[section - 1] + '&src=00&qtsid=' + qtsid,
        dataType: 'jsonp',
        success: function (msg) {
            loadUserData_callBack(msg, section, qtsid);
        },
        error: function (request, status, error) {
            return;
        }
    });
}

function loadUserData_callBack(msg, section, qtsid) {    
    var data = JSON.parse(msg);
    var userData = new Array();
    for (var i = 0 ; i < data.length; i++) {
        
        var qtid = data[i]['QTID'];
        var aid = data[i]['answer'][0]['id'];  

        for (var j = 0; j < data[i]['answer'].length; j++){
            var obj = {};
            obj['full-answer'] = qtid + ':' + data[i]['QID'] + ':' + data[i]['answer'][j]['id'];

            if (data[i]['answer']['0']['note']) { 
                obj['full-answer'] += ":" +  data[i]['answer'][0]['note'];
            }

            userData.push(obj);
        }
        
    }
    sessionStorage.setItem("NEED_USER_DATA" + section, JSON.stringify(userData));  
    bindUserData();
    
}

function bindSectionName() {
    var section = Number(sessionStorage.getItem("section"));
    if (section == 0) {
        section = 1;
        sessionStorage.setItem("section", section);
    }
    var storedData = sessionStorage.getItem("ADLSNAME" + section);
    if (storedData == null) {
        ajaxCrossDomainGet(serviceEndPoint + 'getQTIDDesc?QTID=' + needQTID[section - 1], bindSectionName_callBack);
    }
    else {
        bindSectionName_callBack(storedData);
    }    
}
function bindSectionName_callBack(msg) {
    sectionName = JSON.parse(msg);
    var section = Number(sessionStorage.getItem("section"));
    if (section < needQTID.length + 1) {
        $('.box-header .box-title').text('ด้านที่ ' + section + ' : ' + sectionName['Val']);
    }
}

function bindQuestion() {
    var section = Number(sessionStorage.getItem("section"));
    if (section < needQTID.length + 1) {
        var storedData = sessionStorage.getItem("NEEDQA" + section);
        if (storedData == null) {
            ajaxCrossDomainGet(serviceEndPoint + 'GetQData?QTID=' + needQTID[section - 1] + '&descOrder=true', bindQuestion_callBack);
        }
        else {
            bindQuestion_exec(JSON.parse(storedData));
        }
    }


}

function bindQuestion_callBack(msg) {
    var data = JSON.parse(msg);
    var section = Number(sessionStorage.getItem("section"));
    bindQuestion_exec(data);
}

function bindQuestion_exec(data) {
    $('#questionPanel').empty();
    for (var i = 0; i < data.length; i++) {
        var answers = data[i]['answer'];
        var $div = $("<div>", { class: "form-group" });
        $div.append('<label value="' + data[i]['QID'] + '">' + (i + 1) + '. ' + data[i]['text'] + '</label>');
        
        if (data[i]['QTID'] == "00040"){
            if (data[i]['QID'] == "00002") {
                var $select = $("<select>", { class: "form-control" });
                $select.attr("id", "select-00002");
                $select.append('<option value="99999">--กรุณาเลือก--</option>');
                for (var j = 0; j < answers.length; j++) {
                    $select.append('<option value="' + answers[j]['id'] + '">- ' + answers[j]['text']  +'</option>');               
                }
            } else {
                var $select = $("<div>");
                for (var j = 0; j < answers.length; j++) { 
                    var n = answers[j].text.indexOf("(");
                    var txt = answers[j].text;
                    if (answers[j].text.length > 30 && n > 0){
                        txt = answers[j].text.slice(0, n) + "<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + answers[j].text.slice(n);
                    }               
                    $select.append('<div style="padding-bottom:10px;"><input style="margin-right:5px;" type="checkbox" value="' + data[i]['QTID']+':'+data[i]['QID']+':'+answers[j].id+'" />' + txt + '</div>');
                }
            }
        } else if (data[i]['QTID'] == "00041") {
            var $select = $("<div>");
            for (var j = 0; j < answers.length; j++) { 
                var n = answers[j].text.indexOf("(");
                var txt = answers[j].text;
                if (answers[j].text.length > 30 && n > 0){
                    txt = answers[j].text.slice(0, n) + "<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + answers[j].text.slice(n);
                }               
                $select.append('<div style="padding-bottom:10px;"><input style="margin-right:5px;" type="checkbox" value="' + data[i]['QTID']+':'+data[i]['QID']+':'+answers[j].id+'" />' + txt + '</div>');
            }
        } else if (data[i]['QTID'] == "00042" ){
            var $select = $("<div>");
            $select.append('<div class="box-body no-padding"><textarea id="part-3-textarea" class="form-control" rows="5" id="comment"></textarea></div>');
        } else if (data[i]['QTID'] == "00043") {
            if (data[i]['QID'] == "00001"){
                var $select = $("<select>", { class: "form-control" });
                $select.append('<option value="99999">--กรุณาเลือก--</option>');
                for (var j = 0; j < answers.length; j++) {
                    $select.append('<option value="' + answers[j]['id'] + '">- ' + answers[j]['text']  + '</option>');               
                }
            } else {
                var $select = $("<div>");
                
                
                var $span = $("<span>");
                $span.on("click" , function () {
                    $("#form-4-datepicker").datepicker("show");
                });
                $span.append('วันที่ <input id="form-4-datepicker" type="text" class="form-control" placeholder="วันที่ดำเนินการ" style="width:250px; display:inline;" />');
                $select.append($span);    
            }
        }
        $div.append($select);
        $('#questionPanel').append($div);
    }
    
    bindUserData();

    var qtsid = sessionStorage.getItem("NEED_EDIT_QTSID");
    if (qtsid) {
        setDateToDatePicker('recdate-input', sessionStorage.getItem("NEED_RECDATE"));
        if (Number(qtsid)) {
            var section = Number(sessionStorage.getItem("section"));                
            loadUserData(section, qtsid);
        }
    }
    else {
        getSectionNameAUTO(1);
    }       
}

function bindUserData() { 
    var section = Number(sessionStorage.getItem("section"));
    var userData = sessionStorage.getItem("NEED_USER_DATA" + section);
    if (userData != null) {
        if (section == 1) {
            var data = JSON.parse(userData);
                for(var i = 0; i < data.length; i++){
                    if (data[i]['full-answer'].split(/[:]/)[1] == "00002") {
                        $('#select-00002').val(data[i]['full-answer'].split(/[::]/)[2]);
                    } else {
                        $('input[type="checkbox"][value="'+ data[i]['full-answer']  +'"]').attr('checked', true);
                    }
                }
        } else if (section == 2) {
            var data = JSON.parse(userData);
                for(var i = 0; i < data.length; i++){
                    $('input[type="checkbox"][value="'+ data[i]['full-answer']  +'"]').each(function () {
                        $(this).checked = true;
                });
            }
        } else if (section == 3) {
            var data = JSON.parse(userData);
            $('#part-3-textarea').val(data[0]['full-answer'].split(/[:]/)[3]);
        } else if (section == 4) {
            var data = JSON.parse(userData);

            for(var i = 0; i < data.length; i++){
                if (data[i]['full-answer'].split(/[:]/)[1] == "00001") {
                    $('#questionPanel .form-group select').val(data[i]['full-answer'].split(/[::]/)[2]);
                } else {
                    var dateString = data[i]['full-answer'].split(':');
                    dateString = dateString[3];
                    
                    var dateArr = dateString.split('/');



                    $('#form-4-datepicker').datepicker("setDate", new Date(dateArr[2], Number(dateArr[0]) - 1, dateArr[1]) );
                }
            }
        }
    } 
}
function findAnswerID(key, array) {
    for (var i = 0; i < array.length; i++) {
        if (array[i]['QID'] == key) {
            return array[i]['AID'];
        }
    }
    return '9999';
}

function button_assessment_prev_click() {
    storeUserData();
    var section = Number(sessionStorage.getItem("section"));
    section--;
    sessionStorage.setItem("section", section);
    bindSectionName();
    bindQuestion();
    $('#resultPanel').hide();
    checkAssessmentButtonAndVisible();
}

function button_assessment_next_click() {
    storeUserData();
    var section = Number(sessionStorage.getItem("section"));
    section++;
    sessionStorage.setItem("section", section);
    bindSectionName();
    bindQuestion();
    checkAssessmentButtonAndVisible();
}

function checkAssessmentButtonAndVisible() {
    var section = Number(sessionStorage.getItem("section"));
    $('#button-assessment-prev').hide();
    $('#button-assessment-next').hide();
    $('#button-assessment-save').hide();
    $('#button-assessment-home').hide();

    if (section == 4) { //*********
        $('#panel-button').css('width', '350');
        $('#button-assessment-prev').show();
        $('#button-assessment-save').show();
    }
    else {
        if (section > 1) {
            if (section < needQTID.length + 1) {
                $('#panel-button').css('width', '350');
                $('#button-assessment-prev').show();
                $('#button-assessment-next').show();
            }
            else {
                $('#button-assessment-home').show();
            }
        }
        else {
            $('#panel-button').css('width', '150');
            $('#button-assessment-next').show();
        }
    }
}

function storeUserData() {
    var section = Number(sessionStorage.getItem("section"));
    var QTID = needQTID[section - 1];
    var userData = new Array();
    if (section < 3){
        if  (section == 1){
            $('#questionPanel .form-group div div input').each(function () {
                if (this.checked){
                    var obj = {};        
                    obj['full-answer'] = this.value;
                    userData.push(obj);
                }
                
            });

            var obj = {};
            obj['full-answer'] = "00040:00002:" + $('#select-00002').val();
            userData.push(obj);        // get select box

        } else {
            $('#questionPanel .form-group div div input').each(function () {
                if (this.checked){
                    var obj = {};        
                    obj['full-answer'] = this.value;
                    userData.push(obj);
                }
                
            });
        }
    } 
    else if (section == 3) {
        obj = {};
        obj['full-answer'] = "00042:00001:99999:" + $('#part-3-textarea').val();
        userData.push(obj);

    } else if (section == 4) {
        obj = {};
        obj['full-answer'] = "00043:00001:" + $('#questionPanel .form-group:eq(0) .form-control').find('option:selected').val();
        userData.push(obj);

        obj = {};
        obj['full-answer'] = "00043:00002:99998:" + getDateFromDatePicker('form-4-datepicker') ;
        userData.push(obj);

    }

    sessionStorage.setItem("NEED_USER_DATA" + section, JSON.stringify(userData));
}

function showResult() {   
    $('#panel-button').css('width', '150');
    $('#button-assessment-home').show();
    $('.box-header .box-title').text('ด้านที่ 3. ความต้องการในการดูแลด้านอื่นๆ (กรุณาใส่เป็นข้อความ)');
    $('#questionPanel').empty();
    $('#questionPanel').append($('.box-body.no-padding'));   

    $('.box-body.no-padding').show();// ajaxCrossDomainGet(serviceEndPoint + 'GetAllQResultInForm?CID=' + getCurrentCID() + '&fid=00002&qtsid=' + 1, showResult_callBack);
}

function saveNeedResult(){    
    startAjaxLoader();
    storeUserData();

    var array = JSON.parse(sessionStorage.getItem('NEED_USER_DATA1'));
    array = array.concat(JSON.parse(sessionStorage.getItem('NEED_USER_DATA2')));    
    array = array.concat(JSON.parse(sessionStorage.getItem('NEED_USER_DATA3'))); 
    array = array.concat(JSON.parse(sessionStorage.getItem('NEED_USER_DATA4')));     

    answer = buildJSONAnswer(array);

    if (sessionStorage.getItem("NEED_EDIT_QTSID")){
        post_url = (config_serviceEndPoint + 'SaveRecord?Mode=0001&CID=' + getCurrentCID() + '&StaffId=' + getCurrentStaffID() + '&HostId=' + getCurrentHostID() + '&RecDate=' + getDateFromDatePicker('recdate-input') + '&src=00&Data=' + encodeURIComponent(JSON.stringify(answer)) + '&QTSID=' + sessionStorage.getItem("NEED_EDIT_QTSID"));
    } else {
        post_url = (config_serviceEndPoint + 'SaveRecord?Mode=0000&CID=' + getCurrentCID() + '&StaffId=' + getCurrentStaffID() + '&HostId=' + getCurrentHostID() + '&RecDate=' + getDateFromDatePicker('recdate-input') + '&src=00&Data=' + encodeURIComponent(JSON.stringify(answer)));
    }

    ajaxCrossDomainGet(post_url, showResult, 'post error');
    
}

function isNotNull(element, index, array) {
  if (element){
    return true;
  } else {
    return false;
  }
}


function getMaxQTSID (msg) {
    if ( (JSON.parse(msg)).Val = "OK"){
        ajaxCrossDomainGet(config_serviceEndPoint + 'getQTSID?CID=' + getCurrentCID() + '&src=00&QTID=00041' , showResult, 'post error');
    } else {
        alert('save error');
    }
    
}

function showResult (msg) {
    if ( (JSON.parse(msg)).Val = "OK"){
        if(!debug_mode) { msg = " ";}
        bootbox.dialog({
          message: msg,
          title: "การบันทึกเสร็จสมบูรณ์",
          buttons: {
            toScreening: {
              label: "ตกลง",
              className: "btn-primary",
              callback: function() {
                setCurrentTask("need"); 
                loadContentPage('#content', contentPath + "searchContent.html", getRemainingList);
              }
            }
          }
        });
        stopAjaxLoader();
    } else {
        stopAjaxLoader();
        alert('save error');
    }
}

function showResult_callBack(msg) {
    
    

}

// automatic : fetch data
function getSectionNameAUTO(section) {    
    /*
    $.ajax({
        url: assessmentURL + 'getQTIDName?QTID=' + needQTID[section - 1],
        dataType: 'jsonp',
        success: function (msg) {
            getSectionNameAUTO_callBack(msg, section);
        },
        error: function (request, status, error) {
            return;
        }
    });
    */    
}
function getSectionNameAUTO_callBack(msg, section) {
    if (section < needQTID.length + 1) {
        sessionStorage.setItem("NEEDSECTIONNAME" + section, msg);
        getSectionNameAUTO(Number(section) + 1);
    }
    else {
        // automatic : fetch questions and answers
        getQuestionAUTO(1);
    }
}
function getQuestionAUTO(section) {
    $.ajax({
        url: serviceEndPoint + 'GetQData?QTID=' + needQTID[section - 1] + '&descOrder=true',
        dataType: 'jsonp',
        success: function (msg) {
            getQuestionAUTO_callBack(msg, section);
        },
        error: function (request, status, error) {
            return;
        }
    });
}
function getQuestionAUTO_callBack(msg, section) {
    if (section < needQTID.length + 1) {
        sessionStorage.setItem("NEEDQA" + section, msg);
        getQuestionAUTO(Number(section) + 1);
    }
}
// end automatic : fetch data