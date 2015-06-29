// sessionStorage -> section
// sessionStorage -> ASSESSMENTSECTIONNAME[1...6]=section name 1...6
// sessionStorage -> ASSESSMENTQA[1...6]=section name 1...6
// sessionStorage -> ASSESSMENT_USER_DATA[1...6]

var sectionQTID = ["00000", "00002", "00001", "00003", "00004", "00005"];
var skip00050 = ["00017", "00018", "00019", "00020", "00021", "00022"]; //5. การคิดเลขในใจ
var skip00049 = ["00042", "00043"]; //4. การเขียนได้
var skip00048 = ["00023", "00024", "00040", "00041", "00042", "00043"]; //3. การอ่านออก
var skipType = []; // ['การอ่าน':'ได้/ไม่ได้' ] -> 00034=ทำไม่ได้  00033  ทำได้

$(document).ready(function () {
    $('.content-header h1').text('ประวัติการทำแบบประเมินผู้สูงอายุ สำหรับ ' + getCurrentName());
    $('#recdate-input').datepicker({
        language: 'th-en',
        format: 'dd-mm-yyyy'
    });
    $('#recdate-input').focus().focus();
    $('.datepicker.datepicker-dropdown.dropdown-menu').css('width', '250px');
    $('.datepicker.datepicker-dropdown.dropdown-menu').click(function () {
        $(this).hide();
    });
    bindSectionName();
    bindQuestion();
    checkAssessmentButtonAndVisible();
    
});

function loadUserData(section, qtsid) {
    //console.log('loadUserData ' + qtsid);
    $.ajax({
        url: serviceEndPoint + 'GetQShowData?CID=' + getCurrentCID() + '&qtid=' + sectionQTID[section - 1] + '&qtsid=' + qtsid,
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
    console.log(data);
    if (data) {
        if (section <= sectionQTID.length) {
            
            var userData = new Array();
            for (var i = 0 ; i < data.length; i++) {
                var obj = new Object();
                var qtid = data[i]['QTID'];
                var aid = data[i]['answer']['0']['id'];
                obj['QID'] = data[i]['QID'];
                obj['AID'] = aid;
                obj['full-answer'] = qtid + ':' + data[i]['QID'] + ':' + aid;
                userData.push(obj);
            }
            sessionStorage.setItem("ASSESSMENT_USER_DATA" + section, JSON.stringify(userData));
            loadUserData(Number(section) + 1, qtsid);
        }
        else {
            bindUserData();
            getSectionNameAUTO(1);
        }
    } 
}

function bindSectionName() {
    var section = Number(sessionStorage.getItem("section"));
    if (section == 0) {
        section = 1;
        sessionStorage.setItem("section", section);
    }
    var storedData = sessionStorage.getItem("ADLSNAME" + section);
    if (storedData == null) {
        ajaxCrossDomainGet(serviceEndPoint + 'GetQtidDesc?QTID=' + sectionQTID[section - 1], bindSectionName_callBack);
    }
    else {
        bindSectionName_callBack(storedData);
    }
}
function bindSectionName_callBack(msg) {
    var section = Number(sessionStorage.getItem("section"));
    if (section <= sectionQTID.length) {
        $('.box-header .box-title').text('ด้านที่ ' + section + ' : ' + (JSON.parse(msg))['Val']);
    }
}

function bindQuestion() {
    var section = Number(sessionStorage.getItem("section"));
    if (section <= sectionQTID.length) {
        var storedData = sessionStorage.getItem("ASSESSMENTQA" + section);
        if (storedData == null) {
            ajaxCrossDomainGet(serviceEndPoint + 'GetQData?QTID=' + sectionQTID[section - 1] + '&descOrder=true', bindQuestion_callBack);
        }
        else {
            bindQuestion_exec(JSON.parse(storedData));
        }
    }
    else {
        // show result
        //showResult();
    }
}
function bindQuestion_callBack(msg) {
    var data = JSON.parse(msg);
    var section = Number(sessionStorage.getItem("section"));
    bindQuestion_exec(data);
}
function skipQuestion(QID) {
    for (var i = 0; i < skipType.length; i++) {
        var type = skipType[i];
        if (type['AID'] == '00034') {
            var tmp = [];
            if (type['QID'] == '00048') {
                tmp = skip00048;
            }
            else if (type['QID'] == '00049') {
                tmp = skip00049;
            }
            else if (type['QID'] == '00050') {
                tmp = skip00050;
            }

            for (var j = 0; j < tmp.length; j++) {
                if (QID == tmp[j]) {
                    return true;
                }
            }
        }
    }
    return false;
}
function bindQuestion_exec(data) {
    console.log(data);

    $('#questionPanel').empty();
    var qIndex = 1;
    var qqIndex = 1;

    for (var i = 0; i < data.length; i++) {
        if (skipQuestion(data[i]['QID'])) {
            continue;
        }
        
        var answers = data[i]['answer'];
        var $div = $("<div>", { class: "form-group" });

        if (data[i]['QTID'] != "00003"){
            $div.append('<label value="' + data[i]['QID'] + '">' + qqIndex + '. ' + data[i]['text'] + '</label>');
            qqIndex++;
        } else {
            if (data[i]['QUI'] != "00000"){
                $div.append('<label value="' + data[i]['QID'] + '">'  + data[i]['text'] + '</label>');
                $div.attr("style", "padding-left: 20px;")
            }
        }

        if (data[i]['QID'] == '00047') {
            //bind check box         
            var $select = $("<div>", { class: "checkbox" });
            for (var j = 0; j < answers.length; j++) {
                var $checkbox = $("<div>", { class: "checkbox" });
                var $label = $("<label>");
                if (j == answers.length - 1) {
                    $label.append('<input value="' + answers[j]['id'] + '" onclick="enableInputText(this.checked)" style="width:18px;height:18px;" type="checkbox"/>');
                }
                else {
                    $label.append('<input value="' + answers[j]['id'] + '" style="width:18px;height:18px;" type="checkbox"/>');
                }
                $label.append(answers[j]['text']);

                if (j == answers.length - 1) {
                    $label.append('<input style="width:200px;" id="inputOther" type="text" name="firstname" disabled="true">');
                }
                $div.append($select.append($checkbox.append($label)));
            }
            
        }
        else {
            if (data[i]['QUI'] != "00000"){
                if (data[i]['QTID'] != "00003") {
                    var $select = $("<select>", { class: "form-control" });
                    $select.append('<option value="99999">--กรุณาเลือก--</option>');
                    for (var j = 0; j < answers.length; j++) {
                        $select.append('<option value="' + answers[j]['id'] + '">- ' + ' (' + answers[j]['value'] +' คะแนน) ' + answers[j]['text']  + '</option>');
                    }
                    $div.append($select);
                } else {
                    var $select = $("<select>", { class: "form-control" });
                    $select.append('<option value="99999">--กรุณาเลือก--</option>');
                    for (var j = 0; j < answers.length; j++) {
                        $select.append('<option value="' + answers[j]['id'] + '">- ' + ' (' + answers[j]['value'] +' คะแนน) ' + answers[j]['text'] + '</option>');
                    }
                    $div.append($select);
                }

            } else {
                var $select = $("<div>");
                $select.append('<h4 style="margin-top: 0px;">'+ qIndex +'.'+ data[i].text + '</h3>');
                $div.append($select);
                qIndex++;                
            }            
        }        
        $('#questionPanel').append($div);
    }

    bindUserData();

    var qtsid = sessionStorage.getItem("ASSESSMENT_EDIT_QTSID");
    if (qtsid) {
        setDateToDatePicker('recdate-input', sessionStorage.getItem("ASSESSMENT_RECDATE"));
        if (Number(qtsid)) {
            var section = Number(sessionStorage.getItem("section"));
            loadUserData(section, qtsid);
        }
    }
    else {
        getSectionNameAUTO(1);
    }


}
function enableInputText(isCheck) {
    $('#inputOther').val('');
    if (isCheck) {
        $("#inputOther").attr('disabled', false);
    }
    else {
        $("#inputOther").attr('disabled', true);
    }
}
function bindUserData() {
    var section = Number(sessionStorage.getItem("section"));
    var userData = sessionStorage.getItem("ASSESSMENT_USER_DATA" + section);
    
    if (userData != null) {
        var data = JSON.parse(userData);  
        if (userData.length > 0) {                  
            $('#questionPanel .form-group').each(function () {
                var fgroup = $(this);
                var QID = fgroup.find('label').attr('value');
                var selectedValue = findAnswerID(QID, data);
                if (QID == '00047') {
                    for (var i = 0; i < selectedValue.length; i++) {
                        var id = selectedValue[i].split(':')[2];
                        $(this).find('div div input[type="checkbox"]').each(function () {
                            if ($(this).val() == id) {
                                $(this).attr('checked', true);
                                if (id == '99999') {
                                    $("#inputOther").attr('disabled', false);
                                    $('#inputOther').val(selectedValue[i].split(':')[3]);
                                }
                            }
                        });
                    }
                }
                else {
                    fgroup.find('select').val(selectedValue);
                }
            });
        } else {
              $('#questionPanel .form-group').each(function () {
                var fgroup = $(this);            
                fgroup.find('select').val('99999');
            });
        }
    }
}

function findAnswerID(key, array) {
    var keyMap = 'AID';
    if (key == '00047') {
        keyMap = 'full-answer';
    }
    for (var i = 0; i < array.length; i++) {
        if (array[i]['QID'] == key) {
            return array[i][keyMap];
        }
    }
    return '99999';
}

function checkCompleteTask() {
    var section = Number(sessionStorage.getItem("section"));
    if ( sectionQTID[section - 1] == '00000' || sectionQTID[section - 1]  == '00002') {
        var isComplete = true;
        $('#questionPanel .form-group select').each(function () {        
            if ($(this).find('option:selected').val() == 99999) {
                isComplete = false;
            }     
        });
        return isComplete;
    } else {
        var isComplete = true;
        var isSkip = true;
        $('#questionPanel .form-group select').each(function () {        
            if ($(this).find('option:selected').val() == 99999) {
                isComplete = false;
            } else {
                console.log($(this));
                isSkip = false;

            }        
        });
        console.log(isComplete, isSkip);
        return isComplete | isSkip;
    }
}

function button_assessment_prev_click() {
    storeUserData();
    var section = Number(sessionStorage.getItem("section"));
    section--;
    sessionStorage.setItem("section", section);
    bindSectionName();
    bindQuestion();
    // bindUserData();
    checkAssessmentButtonAndVisible();
}

function button_assessment_next_click() {
    if (checkCompleteTask()) {
        storeUserData();
        var section = Number(sessionStorage.getItem("section"));
        section++;
        sessionStorage.setItem("section", section);
        bindSectionName();
        bindQuestion();
        // bindUserData();
        checkAssessmentButtonAndVisible();
    }
    else {
        alert('ตอบคำถามไม่ครบ');
    }
}

function saveAssessmentResult(){
    startAjaxLoader();
    storeUserData();
    answer = buildAnswer();
    
    if (sessionStorage.getItem("ASSESSMENT_EDIT_QTSID")){
        console.log('edit mode');
        post_url = (config_serviceEndPoint + 'SaveRecord?Mode=0101&CID=' + getCurrentCID() + '&StaffId=' + getCurrentStaffID() + '&HostId=' + getCurrentHostID() + '&RecDate=' + getDateFromDatePicker('recdate-input') + '&System=00002&src=00&Data=' + encodeURIComponent(JSON.stringify(answer)) + '&QTSID=' + sessionStorage.getItem("ASSESSMENT_EDIT_QTSID"));
    } else {
        console.log('insert mode');
        post_url = (config_serviceEndPoint + 'SaveRecord?Mode=0100&CID=' + getCurrentCID() + '&StaffId=' + getCurrentStaffID() + '&HostId=' + getCurrentHostID() + '&RecDate=' + getDateFromDatePicker('recdate-input') + '&SystemType=00002&src=00&Data=' + encodeURIComponent(JSON.stringify(answer)));
    }
    
    console.log(post_url);
    ajaxCrossDomainGet(post_url, getMaxQTSID, 'post error');
}

function getMaxQTSID (msg) {
    console.log(msg);
    ajaxCrossDomainGet(config_serviceEndPoint + 'getQTSID?CID=' + getCurrentCID() + '&src=00&QTID=00001' , showResult, 'post error');
}

function buildAnswer () {
    var array = [];
    for(var i = 1; i < sectionQTID.length + 2; i++){
        var sectionData = sessionStorage.getItem('ASSESSMENT_USER_DATA' + i);
        if(sectionData){
            var jdata = JSON.parse(sectionData);
            for(var j = 0; j < jdata.length; j++){
                var QID = jdata[j]['QID']
                if (QID == '00047'){
                    var tmp = jdata[j]['full-answer'];
                    for(var k = 0; k < tmp.length; k++){
                        array.push(tmp[k]);
                    }
                }
                else{
                    array.push(jdata[j]['full-answer']);
                }
            }
        }
    }
    return array;
}

function checkAssessmentButtonAndVisible() {
    var section = Number(sessionStorage.getItem("section"));
    $('#button-assessment-prev').hide();
    $('#button-assessment-next').hide();
    $('#button-assessment-save').hide();
    $('#button-assessment-home').hide();

    if (section == 6) {
        $('#panel-button').css('width', '350');
        $('#button-assessment-prev').show();
        $('#button-assessment-save').show();
    }
    else {
        if (section > 1) {
            if (section <= sectionQTID.length) {
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
    var QTID = sectionQTID[section - 1];
    var userData = new Array();
    if (section == 1) {
        skipType = [];
    }
    $('#questionPanel .form-group').each(function () {
        var QID = $(this).find('label').attr('value');
        if (QID != undefined){
            var AID = $(this).find('select option:selected').val();
            if ( AID != '99999'){
                console.log(AID);
                var obj = new Object();
                obj['QID'] = QID;
                
                // skip question type
                if (section == 1) {
                    if (QID == '00048' || QID == '00049' || QID == '00050') {
                        var objskip = new Object();
                        objskip['QID'] = QID;
                        objskip['AID'] = AID;
                        skipType.push(objskip);
                    }
                }

                if (QID == '00047') {
                    var AIDlist = new Array();
                    var fullAns = new Array();
                    $(this).find('div div input:checked').each(function () {              
                        if ($(this).val() == '99999') {
                            AIDlist.push($('#inputOther').val());
                            fullAns.push(QTID + ':' + QID + ':' + '99999' + ':' + $('#inputOther').val());
                        }
                        else {
                            AIDlist.push($(this).val());
                            fullAns.push(QTID + ':' + QID + ':' + $(this).val());
                        }
                    });
                    obj['AID'] = AIDlist;
                    obj['full-answer'] = fullAns;
                }
                else {            
                    obj['AID'] = AID;
                    obj['full-answer'] = QTID + ':' + QID + ':' + AID;
                }            
                userData.push(obj);
            }
        }
    });
    sessionStorage.setItem("ASSESSMENT_USER_DATA" + section, JSON.stringify(userData));
}

function showResult(msg) {
    
    var r = JSON.parse(msg);
    if ((JSON.parse(msg)).Val = "OK"){
        
        var QTSID = (JSON.parse(msg).Val) ;
        //alert(QTSID);
        if (Number(QTSID) == 1) {
            console.log(config_serviceEndPoint + 'GetAllQResultInForm?CID=' + getCurrentCID() + '&fid=00002&src=00&qtsid=' + QTSID);
            ajaxCrossDomainGet(config_serviceEndPoint + 'GetAllQResultInForm?CID=' + getCurrentCID() + '&fid=00002&src=00&qtsid=' + QTSID, showResult_callBack);
        } else if (Number(QTSID) > 0) {
            console.log(config_serviceEndPoint + 'GetAllQResultInForm?CID=' + getCurrentCID() + '&fid=00002&src=00&qtsid=' + (QTSID - 1));
            ajaxCrossDomainGet(config_serviceEndPoint + 'GetAllQResultInForm?CID=' + getCurrentCID() + '&fid=00002&src=00&qtsid=' + (QTSID - 1), showResult_callBack);
        }   
    } else {
        stopAjaxLoader();
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองอีกครั้ง');
    }

        
}
function showResult_callBack(msg) {
    var data = JSON.parse(msg);
    console.log(data);

    var $wrapper = $("<div>");
    $wrapper.attr ("style", "width: 100%; height: 130px;");
    var $col = $("<div>", { class : "col-lg-6 col-xs-6"});
    $col.attr ("style", "font-size: 14px");
    

    var $col2 = $("<div>", { class : "col-lg-6 col-xs-6 text-center"});
    $col2.attr ("style", "font-size: 14px");
    
    for (var i = 0; i < data.length; i++ ) {
        $col.append('<div style="width:100%">' + data[i]['QTDesc'] + '</div>');
        
        var $icon = $("<div>");
        switch( data[i]['ResultID'] ) {
            case '00001':
                $icon.attr("style", "color:green");
                $icon.append('<i class="fa fa-smile-o"></i>' + data[i]['RDesc'] + ' (' + data[i]['Point'] + 'คะแนน)');
                break;
            case '00002':
                $icon.attr("style", "color:orange");
                $icon.append('<i class="fa fa-meh-o"></i>' + data[i]['RDesc'] + ' (' + data[i]['Point'] + 'คะแนน)');
                break;
            case '00003':
                $icon.attr("style", "color:red");
                $icon.append('<i class="fa fa-frown-o"></i>' + data[i]['RDesc'] + ' (' + data[i]['Point'] + 'คะแนน)');
                break;
            case '00028':
                $icon.attr("style", "color:green");
                $icon.append('<i class="fa fa-smile-o"></i>' + data[i]['RDesc'] + ' (' + data[i]['Point'] + 'คะแนน)');
                break;
            case '00029':
                $icon.attr("style", "color:red");
                $icon.append('<i class="fa fa-frown-o"></i>' + data[i]['RDesc'] + ' (' + data[i]['Point'] + 'คะแนน)');
                break;
        }
        $col2.append($icon);
    }
         
    $wrapper.append($col);
    $wrapper.append($col2);
    
    bootbox.dialog({
      message: $wrapper,
      title: "ผลการประเมิน",
      buttons: {
        toScreening: {
          label: "ตกลง",
          className: "btn-primary",
          callback: function() {
            setCurrentTask("assessment"); 
            loadContentPage('#content', contentPath + "searchContent.html", getRemainingList);
          }
        }
      }
    });

    stopAjaxLoader();
}

// automatic : fetch data
function getSectionNameAUTO(section) {
    $.ajax({
        url: serviceEndPoint + 'GetQtidDesc?QTID=' + sectionQTID[section - 1],
        dataType: 'jsonp',
        success: function (msg) {
            getSectionNameAUTO_callBack((JSON.parse(msg))['Val'], section);
        },
        error: function (request, status, error) {
            return;
        }
    });
}
function getSectionNameAUTO_callBack(msg, section) {
    if (section <= sectionQTID.length) {
        sessionStorage.setItem("ASSESSMENTSECTIONNAME" + section, msg);
        getSectionNameAUTO(Number(section) + 1);
    }
    else {
        // automatic : fetch questions and answers
        getQuestionAUTO(1);
    }
}
function getQuestionAUTO(section) {
    $.ajax({
        url: serviceEndPoint + 'GetQData?QTID=' + sectionQTID[section - 1] + '&descOrder=true',
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
    if (section <= sectionQTID.length) {
        sessionStorage.setItem("ASSESSMENTQA" + section, msg);
        getQuestionAUTO(Number(section) + 1);
    }
}
function testAss() {
    $('')
}
// end automatic : fetch data