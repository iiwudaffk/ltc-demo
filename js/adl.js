

// sessionStorage key -> section, ADLQ[1...6], ADLSNAME[1...6], ADLUSE[1...6]
// sessionStorage desc -> section=section id 1...6
// sessionStorage desc -> ADLQ[1...6]=question and answer list
// sessionStorage desc -> ADLSNAME[1...6]=section name 1...6
// sessionStorage desc -> ADLUSE[1...6]= store user selected data

var ADLPath = '../../pages/forms/ADL.aspx';
var ADLDIR = '../../pages/forms/';
var sectionQTID = ["00011", "00012", "00013", "00014", "00015", "00016"];
var isEdit = false;

$(document).ready(function () {
    if (getCurrentCID()) {
        $('.content-header h1').text('แบบประเมิน ADL สำหรับ ' + getCurrentName());        
        $('#recdate-input').datepicker({
            language: 'th-th',
            format: 'dd/mm/yyyy'
        });
        bindSectionName();
        bindQuestion();
        isEdit = false;
        checkADLButtonAndVisible();
        $(document).ajaxStop(function () {
            $(this).unbind("ajaxStop");

            var qtsid = getQueryVar('edit');
            if (qtsid) {
                if (Number(qtsid)) {
                    isEdit = true;
                    loadUserData(qtsid);
                }
            }
            else {
                getSectionNameAUTO(1);
            }            
        });
    }
    else {
        alert('ยังไม่ได้เลือกผู้รับบริการ');
        location.href = ADLDIR + 'Search.aspx';
    }
});

function loadUserData(qtsid) {
    var jdata = new Object();
    jdata['CID'] = getCurrentCID();
    jdata['QISID'] = qtsid;
    ajaxCallCodeBehind(
            ADLPath + '/getUserData',
            JSON.stringify(jdata),
            loadUserData_callBack, 'Ajax call user data.'
        );
}
function loadUserData_callBack(msg) {
    var data = JSON.parse(msg.d);
    var userData1 = new Array();
    var userData2 = new Array();
    var userData3 = new Array();
    var userData4 = new Array();
    var userData5 = new Array();
    var userData6 = new Array();
    for (var i = 0 ; i < data.length; i++) {
        var obj = new Object();
        var qtid = data[i]['QTID'];
        obj['QID'] = data[i]['QID'];
        obj['AID'] = data[i]['AID'];
        obj['full-answer'] = qtid + ':' + data[i]['QID'] + ':' + data[i]['AID'];
        if (qtid.substr(4) == '1') {
            userData1.push(obj);
        }
        else if (qtid.substr(4) == '2') {
            userData2.push(obj);
        }
        else if (qtid.substr(4) == '3') {
            userData3.push(obj);
        }
        else if (qtid.substr(4) == '4') {
            userData4.push(obj);
        }
        else if (qtid.substr(4) == '5') {
            userData5.push(obj);
        }
        else if (qtid.substr(4) == '6') {
            userData6.push(obj);
        }
    }

    sessionStorage.setItem("ADLUSE1", JSON.stringify(userData1));
    sessionStorage.setItem("ADLUSE2", JSON.stringify(userData2));
    sessionStorage.setItem("ADLUSE3", JSON.stringify(userData3));
    sessionStorage.setItem("ADLUSE4", JSON.stringify(userData4));
    sessionStorage.setItem("ADLUSE5", JSON.stringify(userData5));
    sessionStorage.setItem("ADLUSE6", JSON.stringify(userData6));

    bindUserData();
    getSectionNameAUTO(1);
}

function bindSectionName() {
    var section = Number(sessionStorage.getItem("section"));
    if (section == 0) {
        section = 1;
        sessionStorage.setItem("section", section);
    }
    var storedData = sessionStorage.getItem("ADLSNAME" + section);
    if (storedData == null) {
        ajaxCallCodeBehind(
            ADLPath + '/getQTDesc',
            '{"QTID":"' + sectionQTID[section - 1] + '"}',
            bindSectionName_callBack, 'Ajax call sercion name.'
        );
    }
    else {
        bindSectionName_exec(storedData);
    }
}
function bindSectionName_callBack(msg) {
    var section = Number(sessionStorage.getItem("section"));
    bindSectionName_exec(msg.d);
    sessionStorage.setItem("ADLSNAME" + section, msg.d);
}
function bindSectionName_exec(data) {    
    var section = Number(sessionStorage.getItem("section"));
    if (section < 7) {
        $('.box-header .box-title').text('ด้านที่ ' + section + ' : ' + data);
    }
    else {
        $('.box-header .box-title').text('');
    }
}

function bindQuestion() {    
    var section = Number(sessionStorage.getItem("section"));
    var storedData = sessionStorage.getItem("ADLQ" + section);
    if (storedData == null) {
        ajaxCallCodeBehind(
            ADLPath + '/getDataByQTID',
            '{"QTID":"' + sectionQTID[section - 1] + '"}',
            bindQuestion_callBack, 'Ajax call question at section ' + section
        );
    }
    else {
        bindQuestion_exec(JSON.parse(storedData));
    }
}
function bindQuestion_callBack(msg) {
    var data = JSON.parse(msg.d);
    var section = Number(sessionStorage.getItem("section"));
    sessionStorage.setItem("ADLQ" + section, JSON.stringify(data));
    bindQuestion_exec(data);
}
function bindQuestion_exec(data) {
    $('#questionPanel').empty();
    for (var i = 0; i < data.length; i++) {
        var answers = data[i]['answer'];
        var $div = $("<div>", { class: "form-group" });
        $div.append('<label value="' + data[i]['QID'] + '">' + (i + 1) + '. ' + data[i]['text'] + '</label>');

        var $select = $("<select>", { class: "form-control" });
        $select.append('<option value="9999">--กรุณาเลือก--</option>');
        for (var j = 0; j < answers.length; j++) {
            $select.append('<option value="' + answers[j]['id'] + '">- ' + answers[j]['text'] + '</option>');
        }
        $div.append($select);
        $('#questionPanel').append($div);
    }
    bindUserData();
}
function bindUserData() {
    var section = Number(sessionStorage.getItem("section"));
    var userData = sessionStorage.getItem("ADLUSE" + section);
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

function saveADL() {
    $('.overlay').show();
    $('.saving-img').show();
    $('.overlay').text('กำลังตรวจสอบความถูกต้อง...');
    storeUserData();
    // check input
    for (var k = 1; k < 7; k++) {
        var userData = sessionStorage.getItem("ADLUSE" + k);
        if (userData != null) {
            var data = JSON.parse(userData);
            for (var i = 0; i < data.length; i++) {
                if (data[i]['AID'] == '9999') {
                    $('.overlay').hide();
                    $('.saving-img').hide();
                    alert('คุณยังไม่ได้ตอบคำถาม ด้านที่ ' + k + ' ข้อที่ ' + (i + 1));
                    return;
                }
            }
        }
    }

    if ($("#recdate-input").val().length > 0) {
        saveADL_Section(1); // start to save at section 1
    }
    else {
        $('.overlay').hide();
        $('.saving-img').hide();
        alert('กรุณาเลือกวันที่.');
    }
}
function saveADL_Section(section) {
    var QTID = sectionQTID[section - 1];
    $('.overlay').text('กำลังบันทึกข้อมูล...(ด้านที่ ' + section + '/6)...');
    var listAnswer = new Array();
    var userData = JSON.parse(sessionStorage.getItem("ADLUSE" + section));
    for (var i = 0; i < userData.length; i++) {
        listAnswer.push(userData[i]['full-answer']);
    }

    var jdata = '{"Answer":"' + listAnswer
        + '", "RecDate":"' + $("#recdate-input").val()
        + '",  "CID":"' + getCurrentCID()
        + '",  "hostID":"' + $('#HiddenField_host').val()
        + '",  "staffID":"' + $('#HiddenField_staff').val()
        + '",  "QTID":"' + QTID + '"}';
    $.ajax({
        type: "POST",
        url: ADLPath + '/saveData',
        data: jdata,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            saveADL_callBack(msg, section);
        },
        error: function (request, status, error) {
            saveADL_callBackError(request, status, error);
            return;
        }
    });
}
function saveADL_callBack(msg, section) {
    if (msg.d == "OK") {
        if (section < 6) {
            saveADL_Section(Number(section) + 1);
        }
        else {
            $('.overlay').hide();
            $('.saving-img').hide();
            showResult();
        }
    }
    else {
        $('.overlay').hide();
        $('.saving-img').hide();
        alert(msg.d + ' ข้อมูลด้านที่ ' + section);
    }
}
function saveADL_callBackError(request, status, error) {
    $('.overlay').hide();
    $('.saving-img').hide();
    alert('Save data. ' + status + ' ' + error);
}

function button_adl_prev_click() {
    storeUserData();
    var section = Number(sessionStorage.getItem("section"));
    section--;
    sessionStorage.setItem("section", section);
    bindSectionName();
    bindQuestion();
    checkADLButtonAndVisible();
}

function button_adl_next_click() {
    storeUserData();
    var section = Number(sessionStorage.getItem("section"));
    section++;
    sessionStorage.setItem("section", section);
    bindSectionName();
    bindQuestion();
    checkADLButtonAndVisible();
}

function checkADLButtonAndVisible() {
    var section = Number(sessionStorage.getItem("section"));
    $('#button-adl-prev').hide();
    $('#button-adl-next').hide();
    $('#button-adl-save').hide();

    if (section > 1 && section < 6) {
        $('#panel-button').css('width', '350');
        $('#button-adl-prev').show();
        $('#button-adl-next').show();
    }
    else if (section == 6) {
        $('#panel-button').css('width', '350');
        $('#button-adl-prev').show();
        $('#button-adl-save').show();
    }
    else {
        $('#panel-button').css('width', '150');
        $('#button-adl-next').show();
    }
}

function storeUserData() {
    var section = Number(sessionStorage.getItem("section"));
    var QTID = sectionQTID[section - 1];
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
    sessionStorage.setItem("ADLUSE" + section, JSON.stringify(userData));
}

// automatic : fetch data
function getSectionNameAUTO(section) {
    $.ajax({
        type: "POST",
        url: ADLPath + '/getQTDesc',
        data: '{"QTID":"' + sectionQTID[section - 1] + '"}',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            getSectionNameAUTO_callBack(msg, section);
        },
        error: function (request, status, error) {
            return;
        }
    });
}
function getSectionNameAUTO_callBack(msg, section) {
    if (section < 6) {
        sessionStorage.setItem("ADLSNAME" + section, msg.d);
        getSectionNameAUTO(Number(section) + 1);
    }
    else {
        // next to question
        getQuestionAUTO(1);
    }
}
function getQuestionAUTO(section) {
    $.ajax({
        type: "POST",
        url: ADLPath + '/getDataByQTID',
        data: '{"QTID":"' + sectionQTID[section - 1] + '"}',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            getQuestionAUTO_callBack(msg, section);
        },
        error: function (request, status, error) {
            return;
        }
    });
}
function getQuestionAUTO_callBack(msg, section) {
    if (section < 6) {
        var data = JSON.parse(msg.d);
        sessionStorage.setItem("ADLQ" + section, JSON.stringify(data));
        getQuestionAUTO(Number(section) + 1);
    }
}

// show result
function showResult() {
    $('#button-adl-prev').hide();
    $('#button-adl-next').hide();
    $('#button-adl-save').hide();
    $('#panel-button').css('width', '150');
    $('#button-adl-home').show();
    $('.box-header .box-title').text('สรุปผลการทำแบบประเมิน ADL สำหรับนักกิจกรรมบำบัด');
    $('#questionPanel').empty();
    $('.box-body.no-padding').show();
    ajaxCallCodeBehind(
            ADLPath + '/getResult',
            '{"CID":"' + getCurrentCID() + '", "RecDate":"' + $("#recdate-input").val() + '"}',
            showResult_callBack, 'Ajax call result.'
    );
}
function showResult_callBack(msg) {
    $table = $('.box-body.no-padding .table.table-condensed');
    var result = JSON.parse(msg.d);
    if (result['status'].toUpperCase() == 'OK') {
        var array = result['data'];
        for (var i = 0; i < array.length; i++) {
            var $tr = $("<tr>")
                .append($('<td>', { text: (i + 1) + '. ' }))
                    .append($('<td>', { text: array[i]['QTDesc'] }))
                        .append($('<td>').append($('<div class="progress xs">').append(getResultHtmlClass(array[i]['RDesc']))))
                            .append($('<td>').append(getResultLevelHtmlClass(array[i]['RDesc'])));
            $table.append($tr);
        }
    }
    else {
        alert(result['data']);
    }
}

