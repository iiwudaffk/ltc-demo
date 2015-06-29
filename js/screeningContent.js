// sessionStorage -> section
// sessionStorage -> SCREENINGSECTIONNAME[1...6]=section name 1...6
// sessionStorage -> SCREENINGQA[1...6]=section name 1...6
// sessionStorage -> SCREENING_USER_DATA[1...6]

var screeningQTID = ["00033"]; //*

$(document).ready(function () {
    
    $('#recdate-input').datepicker({
        language: 'th-en',
        format: 'dd-mm-yyyy'
    });
    $('.datepicker.datepicker-dropdown.dropdown-menu').css('width', '250px');
    for (var i = 1; i < 7; i++) {
        sessionStorage.removeItem('SCREENING_USER_DATA' + i);
    }

    bindSectionName();
    bindQuestion();
    checkAssessmentButtonAndVisible();
});

function loadUserData(section, qtsid) {
    console.log("QTSID " + qtsid);
    console.log(config_serviceEndPoint + 'GetQShowData?CID=' + getCurrentCID() + '&qtid=' + screeningQTID[section - 1] + '&qtsid=' + qtsid);
    $.ajax({
        url: config_serviceEndPoint + 'GetQShowData?CID=' + getCurrentCID() + '&qtid=' + screeningQTID[section - 1] + '&qtsid=' + qtsid + '&src=00',
        dataType: 'jsonp',
        success: function (msg) {
            loadUserData_callBack(msg, section, qtsid);
            console.log("userData" + msg);
        },
        error: function (request, status, error) {
            return;
        }
    });

}
function loadUserData_callBack(msg, section, qtsid) {
    if (section < screeningQTID.length + 1) {
        var data = JSON.parse(msg);
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
        sessionStorage.setItem("SCREENING_USER_DATA" + section, JSON.stringify(userData));
        loadUserData(Number(section) + 1, qtsid);
    }
    else {
        bindUserData();
        getSectionNameAUTO(1);
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
        ajaxCrossDomainGet(config_serviceEndPoint + 'getQTIDDesc?QTID=' + screeningQTID[section - 1] + '&src=00', bindSectionName_callBack);
    }
    else {
        bindSectionName_callBack(storedData);
    }     
}
function bindSectionName_callBack(msg) {
    console.log(msg);
    sectionName = JSON.parse(msg);
    var section = Number(sessionStorage.getItem("section"));
    if (section < screeningQTID.length + 1) {
        $('.box-header .box-title').text('ด้านที่ ' + section + ' : ' + sectionName['Val']);
    }
    stopAjaxLoader();
}

function bindQuestion() {
    var section = Number(sessionStorage.getItem("section"));
    if (section < 7) {
        var storedData = sessionStorage.getItem("SCREENINGQA" + section);
        if (storedData == null) {
            ajaxCrossDomainGet(config_serviceEndPoint + 'GetQData?QTID=' + screeningQTID[section - 1] + '&src=00&descOrder=true', bindQuestion_callBack);
        }
        else {
            bindQuestion_exec(JSON.parse(storedData));
        }
    }
    else {
        // show result
        showResult();
    }
}
function bindQuestion_callBack(msg) {
    var data = JSON.parse(msg);
    var section = Number(sessionStorage.getItem("section"));
    bindQuestion_exec(data);

    stopAjaxLoader();
}

function bindQuestion_exec(data) {
    console.log(data);
    $('#questionPanel').empty();
    for (var i = 0; i < data.length; i++) {
        var answers = data[i]['answer'];
        var $div = $("<div>", { class: "form-group" });
        $div.append('<label value="' + data[i]['QID'] + '">' + (i + 1) + '. ' + data[i]['text'] + '</label>');

        var $select = $("<select>", { class: "form-control" });
        $select.append('<option value="99999">--กรุณาเลือก--</option>');
        for (var j = 0; j < answers.length; j++) {
            $select.append('<option value="' + answers[j]['id'] + '">- ' + '(' + answers[j]['value'] +' คะแนน) ' + answers[j]['text'] + '</option>');
        }
        $div.append($select);
        $('#questionPanel').append($div);
    }

    var qtsid = sessionStorage.getItem("SCREENING_EDIT_QTSID");
    if (qtsid) {
        setDateToDatePicker('recdate-input', sessionStorage.getItem("SCREENING_RECDATE"));
        if (Number(qtsid)) {
            console.log('loadEdit');
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
    var userData = sessionStorage.getItem("SCREENING_USER_DATA" + section);
    if (userData != null) {
        var data = JSON.parse(userData);
        $('#questionPanel .form-group').each(function () {
            var QID = $(this).find('label').attr('value');
            var selectedValue = findAnswerID(QID, data);
            $(this).find('select').val(selectedValue);

        });
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

function checkCompleteTask() {
    var isComplete = true;
    $('#questionPanel .form-group').each(function () {
        if ($(this).find('select option:selected').val() == 99999) {
            isComplete = false;
        }
    });
    return isComplete;
}

function button_assessment_prev_click() {
    storeScreeningUserData();
    var section = Number(sessionStorage.getItem("section"));
    section--;
    sessionStorage.setItem("section", section);
    bindSectionName();
    bindQuestion();
    checkAssessmentButtonAndVisible();
}

function button_assessment_next_click() {
    storeScreeningUserData();
    var section = Number(sessionStorage.getItem("section"));
    section++;
    sessionStorage.setItem("section", section);
    bindSectionName();
    bindQuestion();
    checkAssessmentButtonAndVisible();
}

function saveScreeningResult () {
    if (checkCompleteTask()) {
        startAjaxLoader();
        storeScreeningUserData();
        console.log(sessionStorage.getItem('SCREENING_USER_DATA1'));   
        var data = [];
        data = JSON.parse(sessionStorage.getItem('SCREENING_USER_DATA1'));
        
        answer = buildJSONAnswer(data);
        // var res = buildJSONObjectToSave('0100', getCurrentCID() , getCurrentStaffID(), '', getCurrentHostID(), getDateFromDatePicker('recdate-input'), '0', '0', '00001', '0', data); 
        console.log(answer);

        // ajaxCrossDomainPost(postEndPoint + 'SaveRecord' , JSON.stringify(res), onSaveResultSuccess, 'post error');
        // if edit ? insert
        if (sessionStorage.getItem("SCREENING_EDIT_QTSID")){
            
            post_url = (config_serviceEndPoint + 'SaveRecord?Mode=0101&CID=' + getCurrentCID() + '&StaffId=' + getCurrentStaffID() + '&HostId=' + getCurrentHostID() + '&RecDate=' + getDateFromDatePicker('recdate-input') + '&System=00001&src=00&Data=' + encodeURIComponent(JSON.stringify(answer)) + '&QTSID=' + sessionStorage.getItem("SCREENING_EDIT_QTSID"));
        } else {
            post_url = (config_serviceEndPoint + 'SaveRecord?Mode=0100&CID=' + getCurrentCID() + '&StaffId=' + getCurrentStaffID() + '&HostId=' + getCurrentHostID() + '&RecDate=' + getDateFromDatePicker('recdate-input') + '&System=00001&src=00&Data=' + encodeURIComponent(JSON.stringify(answer)));
        }
        
        ajaxCrossDomainGet(post_url, getMaxQTSID, 'post error');        
    } else {
        alert ('กรุณาตอบคำถามให้ครบ');
    }
    
}

function getMaxQTSID () {
    ajaxCrossDomainGet(config_serviceEndPoint + 'getQTSID?CID=' + getCurrentCID() + '&src=00&QTID=00033' , showResult, 'post error');
}

function saveScreeningResultEdit () {
    storeScreeningUserData();
    console.log(sessionStorage.getItem('SCREENING_USER_DATA1'));   
    var obj = {};
    obj.Mode = ""
    // ajaxCrossDomainPost() ;
    // buildJSONObjectToSave('0101', CID, )
}

function checkAssessmentButtonAndVisible() {
    var section = Number(sessionStorage.getItem("section"));
    $('#button-assessment-prev').hide();
    $('#button-assessment-next').hide();
    // $('#button-assessment-save').hide();
    $('#button-assessment-home').hide();

    if (section == 6) {
        $('#panel-button').css('width', '350');
        $('#button-assessment-prev').show();
        $('#button-assessment-save').show();
    }
    else {
        if (section > 1) {
            if (section < screeningQTID.length + 1) {
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

function storeScreeningUserData() {
    var section = Number(sessionStorage.getItem("section"));
    var QTID = screeningQTID[section - 1];
    var userData = new Array();
    $('#questionPanel .form-group').each(function () {
        var QID = $(this).find('label').attr('value');
        var AID = $(this).find('select option:selected').val();
        var obj = new Object();
        obj['QID'] = QID;
        obj['AID'] = AID;
        obj['full-answer'] = QTID + ':' + QID + ':' + AID;
        userData.push(obj);
    });
    sessionStorage.setItem("SCREENING_USER_DATA" + section, JSON.stringify(userData));
}

function showResult(msg) {
    if (msg){
        var QTSID = (JSON.parse(msg).Val) ;
        if (Number(QTSID) > 1) {             
            ajaxCrossDomainGet(config_serviceEndPoint + 'GetAllQResultInForm?CID=' + getCurrentCID() + '&fid=00001&src=00&qtsid=' + (QTSID - 1), showResult_callBack);
        } else if (Number(QTSID) == 1) {
            ajaxCrossDomainGet(config_serviceEndPoint + 'GetAllQResultInForm?CID=' + getCurrentCID() + '&fid=00001&src=00&qtsid=' + QTSID, showResult_callBack);
        }
    } else {
        stopAjaxLoader();
        alert('error QTSID');
    }

    // console.log('result URL : ' + config_serviceEndPoint + 'GetAllQResultInForm?CID=' + getCurrentCID() + '&fid=00001&src=00&qtsid=' + sessionStorage.getItem("SCREENING_EDIT_QTSID"));
        
}

function showResult_callBack(msg) {
    //console.log(msg);
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
            case '00027':
                $icon.attr("style", "color:green");
                $icon.append('<i class="fa fa-smile-o"></i>' + data[i]['RDesc'] + ' (' + data[i]['Point'] + 'คะแนน)');
                break;
            case '00028':
                $icon.attr("style", "color:red");
                $icon.append('<i class="fa fa-frown-o"></i>' + data[i]['RDesc'] + ' (' + data[i]['Point'] + 'คะแนน)');
                break;
        }
        $col2.append($icon);
    }
         
    $wrapper.append($col);
    $wrapper.append($col2);

    updateDefaultMenu();

    bootbox.dialog({
      message: $wrapper,
      title: "ผลการคัดกรอง",
      buttons: {
        toScreening: {
          label: "ตกลง",
          className: "btn-primary",
          callback: function() {
            setCurrentTask("screening"); 
            loadContentPage('#content', contentPath + "searchContent.html", getRemainingList);
          }
        }
      }
    });

    stopAjaxLoader();
}

// automatic : fetch data
function getSectionNameAUTO(section) {
    /*
    $.ajax({
        url: assessmentURL + 'getQTIDName?QTID=' + screeningQTID[section - 1],
        dataType: 'jsonp',
        success: function (msg) {
            getSectionNameAUTO_callBack(msg, section);
        },
        error: function (request, status, error) {
            console.error('ajax error')
            return;
        }
    });
    */
}
function getSectionNameAUTO_callBack(msg, section) {
    if (section < screeningQTID.length + 1) {
        sessionStorage.setItem("SCREENINGSECTIONNAME" + section, msg);
        getSectionNameAUTO(Number(section) + 1);
    }
    else {
        // automatic : fetch questions and answers
        getQuestionAUTO(1);
    }
}
function getQuestionAUTO(section) {
    $.ajax({
        url: config_serviceEndPoint + 'GetQData?QTID=' + screeningQTID[section - 1] + '&descOrder=true&src=00',
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
    if (section < screeningQTID.length + 1) {
        sessionStorage.setItem("SCREENINGQA" + section, msg);
        getQuestionAUTO(Number(section) + 1);
    }
}
// end automatic : fetch data