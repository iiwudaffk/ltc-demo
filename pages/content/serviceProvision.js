var serviceEndPoint2 = 'http://newtestnew.azurewebsites.net/servicecontrol/gethpservice.svc/';
var serviceEndPoint = 'http://newtestnew.azurewebsites.net/servicecontrol/Service.svc/';
var CID = '';
var RoleID = '';
var cmPlanNO = '';
var HostID = '';
var StaffID = '';
var other = 1;
var caseNo = '';


$(document).ready(function () {
    $('.content-header h1').text('บันทึกการให้บริการ สำหรับ ' + getCurrentName());
    
    $('#recdate-input').focus().focus();
    $('.datepicker.datepicker-dropdown.dropdown-menu').css('width', '250px');
    CID = getCurrentCID();
    HostID = getCurrentHostID();
    StaffID = getCurrentStaffID();
    RoleID = getCurrentRole();

    $.ajax({
        url: serviceEndPoint2 + 'GetMaxCMPlanNo?cid=' + CID + '&src=00',
        dataType: 'jsonp',
        success: function (msg) {
            cmPlanNO = (JSON.parse(msg)).Val;
            newDataService();
        },
        error: function (request, status, error) {
            return;
        }
    });

});


function loadUserData(section) {
    $.ajax({
        url: serviceEndPoint2 + 'GetServiceProvisionViewHistoryData?CID=' + CID + '&RoleID=' + RoleID + '&cmPlanNO=' + cmPlanNO + '&CaseNo=' + caseNo,
        dataType: 'jsonp',
        success: function (msg) {
            loadUserData_callBack(msg);
        },
        error: function (request, status, error) {
            return;
        }
    });

}

function loadUserData_callBack(msg) {
    var data = jQuery.parseJSON(msg);
    var countNote=1;
    if (data != '') {
        document.getElementById('recdate-input').value = data[0].PSDateTime;
        for (var i = 0; i < data.length; i++) {
            if (data[i].ACTCode != '99999') {
                try {
                    document.getElementById('Check' + data[i].ACTCode).checked = true;
                    document.getElementById('Note' + data[i].ACTCode).disabled = false;
                    document.getElementById('Note' + data[i].ACTCode).value = data[i].Note;
                }
                catch (err) {

                }
            }
            else {
                try {

                    addOther(1, countNote, data[i].Note);

                    countNote++;
                }
                catch (err) {

                }
            }
        }
    }
}

function newDataService(data) {
    $.ajax({
        url: serviceEndPoint2 + 'getPersonActivity?CID=' + CID + "&roleID=" + getCurrentRole(),
        dataType: 'jsonp',
        success: function (msg) {
            var data = jQuery.parseJSON(msg);
            bindQuestion_exec(data.data);
        },
        error: function (request, status, error) {
            return;
        }
    });
}


function bindQuestion_exec(data) {
    $('#questionPanel').empty();
    var svcCode = '';
    var $table = $("<table id=\"tableServiceData\" style=\"width: 100%\"  class='table table-condensed' >");
    $table.append('<tr><th style="width: 2%;text-align: center"></th><th style="width: 50%;text-align: center">รายการกิจกรรม</th><th style="width: 48%;text-align: center">บันทึก</th></tr>');
    for (var i = 0; i < data.length; i++) {
        if (svcCode != data[i].SVCCode) {
            svcCode = data[i].SVCCode;
            var $tr = $("<tr  height=\"30px\">")
                .append($('<th>', { text: '' }))
              .append($('<th>', { text: data[i].SVCName }))
                    .append($('<th>', { text: '' }));
            $table.append($tr);

        }

        var $tr = $("<tr>")
            .append($('<th><input type="checkbox" name="Check' + i + '" id="Check' + data[i].ACTCode + '" value="' + data[i].ACTCode + '"  onclick="checkClick(' + data[i].ACTCode + ',this);" >'))
                .append($('<td><label style="font-weight: normal" for="Check' + data[i].ACTCode + '">' + data[i].ACTName + '</label>'))
                      .append($('<td><textarea style="width: 90%;height:100%" rows="2" id="Note' + data[i].ACTCode + '" name="Note' + i + '" disabled></textarea>'));
        $table.append($tr);

        $('#questionPanel').append($table);
    }

    $tr = $("<tr  height=\"30px\">")
            .append($('<th>', { text: '' }))
          .append($('<th>', { text: 'กิจกรรมนอกเหนือนจากรายการ' }))
                .append($('<th>', { text: '' }));
    $table.append($tr);

    $tr = $("<tr>")
          .append($('<th><input type="checkbox" name="CheckOther' + other + '" id="CheckOther' + other + '" value="99999"  onclick="checkClick(' + other + ',this);" >'))
              .append($('<td><label style="font-weight: normal" for="CheckOther' + other + '">อื่นๆ</label>'))
                    .append($('<td><textarea style="width: 90%;height:100%" rows="2" id="NoteOther' + other + '" name="NoteOther' + other + '" disabled></textarea>'));
    $table.append($tr);

    $('#questionPanel').append($table);

    $tr = $('<tr id="add">')
      .append($('<th>'))
          .append($('<td><button type="button" onclick="addOther(2,0,0);">เพิ่ม</button>'))
                .append($('<td>'));
    $table.append($tr);

    $('#questionPanel').append($table);

    $(document).ajaxStop(function () {
        $(this).unbind("ajaxStop");
        caseNo = sessionStorage.getItem("CASENO_SERVICE");
        if (caseNo) {
            if (Number(caseNo)) {
                var section = Number(sessionStorage.getItem("section"));
                loadUserData(section);
            }
        }

    });

}
function addOther(check, countNote, Note) {

    if (check == 1) {
        document.getElementById('CheckOther' + countNote).checked = true;
        document.getElementById('NoteOther' + countNote).disabled = false;
        document.getElementById('NoteOther' + countNote).value = Note;
        var countNotePlus = Number(countNote + 1);
        other = countNotePlus;
    }
    else {
        other++;
    }

    document.getElementById('add').remove();
    
    
    var $tr = $("<tr>")
          .append($('<th><input type="checkbox" name="CheckOther' + other + '" id="CheckOther' + other + '" value="99999"  onclick="checkClick(' + other + ',this);" >'))
              .append($('<td><label style="font-weight: normal" for="CheckOther' + other + '">อื่นๆ</label>'))
                    .append($('<td><textarea style="width: 90%;height:100%" rows="2" id="NoteOther' + other + '" name="NoteOther' + other + '" disabled></textarea>'));
    $('#tableServiceData').append($tr);

    $('#questionPanel').append($('#tableServiceData'));

    $tr = $('<tr id="add">')
  .append($('<th>'))
      .append($('<td><button type="button" onclick="addOther(2,0,0);">เพิ่ม</button>'))
            .append($('<td>'));
    $('#tableServiceData').append($tr);

    $('#questionPanel').append($('#tableServiceData'));

}


function checkClick(id, cb) {
    try {
        if (cb.checked == true) {
            document.getElementById('Note' + id).disabled = false;
        }
        else {
            document.getElementById('Note' + id).disabled = true;
        }
    }
    catch (err) {
        if (cb.checked == true) {
            document.getElementById('NoteOther' + id).disabled = false;
        }
        else {
            document.getElementById('NoteOther' + id).disabled = true;
        }
    }
}


function saveServiceResult() {
    startAjaxLoader();
    var table = document.getElementById("tableServiceData");
    var outdata = [];
    var recDate = document.getElementById('recdate-input').value;
    if (recDate != '') {

        var j = 1;
        for (var i = 0, row; row = table.rows[i]; i++) {
            try {
                var check = document.getElementsByName('Check' + i);
                var note = document.getElementsByName('Note' + i);
                if (check[0].checked) {

                    outdata.push({
                        "ACTCode": check[0].value,
                        "Note": note[0].value,
                    });
                }
            }
            catch (err) {
                try {
                    var check = document.getElementsByName('CheckOther' + j);
                    var note = document.getElementsByName('NoteOther' + j);
                    if (check[0].checked) {
                        outdata.push({
                            "ACTCode": check[0].value,
                            "Note": note[0].value,
                        });
                    }
                    j++;
                }
                catch (err) {

                }
            }
        }
        saveServiceData(CID, cmPlanNO, RoleID, HostID, StaffID, recDate, outdata);
    }
    else {
        stopAjaxLoader();
        alert('กรุณาลงวันที่บันทึก');
    }

}
function toHome() {
    loadContentPage('.content', contentPath + "timelineContent.html", null);
}


function saveServiceData(CID, cmPlanNO, RoleID, HostID, StaffID, recDate, outdata) {
    $.ajax({
        url: serviceEndPoint2 + 'InsertServiceProvision?CID=' + CID + '&cmPlanNO=' + cmPlanNO + '&RoleID=' + RoleID + '&HostID=' + HostID + '&StaffID=' + StaffID + '&recData=' + recDate + '&CaseNo=' + caseNo + '&data=' + encodeURIComponent(JSON.stringify(outdata)),
        dataType: 'jsonp',
        success: function (msg) {
            console.log(msg);
            if (msg == 'success') {
                $('#button-assessment-save').hide();
                $('#button-assessment-home').show();
                sessionStorage.setItem("CASENO_SERVICE", null);
                stopAjaxLoader();
                //  alert('บันทึกข้อมูลสำเร็จ');
            }
            // loadContentPage('.content', contentPath + "serviceProvisionOldContent.html", null);
        },
        error: function (request, status, error) {
            stopAjaxLoader();
            return;
        }
    });

}
