
// sessionStorage -> section
// sessionStorage -> ASSESSMENTSECTIONNAME[1...6]=section name 1...6
// sessionStorage -> ASSESSMENTQA[1...6]=section name 1...6
// sessionStorage -> ASSESSMENT_USER_DATA[1...6]

var sectionQTID = ["00000", "00001"];
var serviceEndPoint = 'http://newtestnew.azurewebsites.net/servicecontrol/gethpservice.svc/';

$(document).ready(function () {
    $('.content-header h1').text('วางแผนการให้บริการของ คุณ ' + getCurrentName());
    $('#recdate-input').datepicker({
        language: 'th-en',
        format: 'mm-dd-yyyy'
    });
    $('#recdate-input').focus().focus();
    $('.datepicker.datepicker-dropdown.dropdown-menu').css('width', '250px');
    $('.datepicker.datepicker-dropdown.dropdown-menu').click(function () {
        $(this).hide();
    });
    bindSectionName();
    bindQuestion();
    checkLTCPlanButtonAndVisible();
});

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
        showResult();
    }
}
function bindQuestion_callBack(msg) {
    var data = JSON.parse(msg);
    var section = Number(sessionStorage.getItem("section"));
    bindQuestion_exec(data);
}
function bindQuestion_exec(data) {
    $('#questionPanel').empty();
    var qIndex = 1;
    for (var i = 0; i < data.length; i++) {
        var answers = data[i]['answer'];
        var $div = $("<div>", { class: "form-group" });
        $div.append('<label value="' + data[i]['QID'] + '">' + qIndex + '. ' + data[i]['text'] + '</label>');
        var $select = $("<div>", { class: "checkbox" });
        for (var j = 0; j < answers.length; j++) {
            var $checkbox = $("<div>", { class: "checkbox" });
            var $label = $("<label style='margin-left:15px;'>");
            $label.append('<input value="' + answers[j]['id'] + '" style="width:18px;height:18px;" type="checkbox"/>');
            $label.append(answers[j]['text']);
            $div.append($select.append($checkbox.append($label)));
        }
        qIndex++;
        $('#questionPanel').append($div);
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

function checkCompleteTask() {
    var isComplete = true;
    $('#questionPanel .form-group').each(function () {
        if ($(this).find('select option:selected').val() == 9999) {
            isComplete = false;
        }
    });
    return isComplete;
}

function button_ltcplan_prev_click() {
    var section = Number(sessionStorage.getItem("section"));
    section--;
    sessionStorage.setItem("section", section);
    bindSectionName();
    bindQuestion();
    checkLTCPlanButtonAndVisible();
}

function button_ltcplan_next_click() {
    if (checkCompleteTask()) {
        var section = Number(sessionStorage.getItem("section"));
        section++;
        sessionStorage.setItem("section", section);
        bindSectionName();
        bindQuestion();
        checkLTCPlanButtonAndVisible();
    }
    else {
        alert('ตอบคำถามไม่ครบ');
    }
}

function checkLTCPlanButtonAndVisible() {
    var section = Number(sessionStorage.getItem("section"));
    $('#button-ltcplan-prev').hide();
    $('#button-ltcplan-next').hide();
    $('#button-ltcplan-save').hide();
    $('#button-ltcplan-home').hide();

    if (section == 2) {
        $('#panel-button').css('width', '350');
        $('#button-ltcplan-prev').show();
        $('#button-ltcplan-save').show();
    }
    else {
        if (section > 1) {
            if (section <= sectionQTID.length) {
                $('#panel-button').css('width', '350');
                $('#button-ltcplan-prev').show();
                $('#button-ltcplan-next').show();
            }
            else {
                $('#button-ltcplan-home').show();
            }
        }
        else {
            $('#panel-button').css('width', '150');
            $('#button-ltcplan-next').show();
        }
    }
}

function showResult() {
    $('#button-assessment-prev').hide();
    $('#button-assessment-next').hide();
    $('#button-assessment-save').hide();
    $('#panel-button').css('width', '150');
    $('#button-assessment-home').show();
    $('.box-header .box-title').text('สรุปผลการทำแบบประเมิน');
    $('#questionPanel').empty();
    $('.box-body.no-padding').show();
    //ajaxCrossDomainGet(serviceEndPoint + 'GetAllQResultInForm?CID=' + getCurrentCID() + '&fid=00002&qtsid=' + 1, showResult_callBack);
}
function showResult_callBack(msg) {
    $table = $('.box-body.no-padding .table.table-condensed');
    var array = JSON.parse(msg);
    if (array) {
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
