$(document).ready(function () {
    $('#recdate-input').datepicker({
        language: 'th-en',
        format: 'dd-mm-yyyy'
    });
    $('.datepicker.datepicker-dropdown.dropdown-menu').css('width', '250px');
    bindQuestion();
});

function bindQuestion () {
    ajaxCrossDomainGet(config_serviceEndPoint + 'GetQData?QTID=' + sessionStorage.getItem('FORM_TEMPLATE_QTID') + '&src=00&descOrder=true' , bindQuestion_callback, 'post error');
}

function bindQuestion_callback(msg) {
    var data = JSON.parse(msg);
    console.log(data);
    var $panel = $('#questionPanel').empty();
    for(var i = 0; i < data.length; i++){
        var $form = $('<div>', { class : 'form-group' });
        if (data[i]['QUI'] == "10010") { //Dropdown
            $form.attr('QUI', '10010');
            $form.append('<label>' + data[i]['text'] + '</label>');
            var $select = $('<select>', { class : 'form-control' });
            $select.append('<option value="99999">--กรุณาเลือก--</option>');
            for ( var k = 0; k < data[i]['answer'].length; k++){
                var id = data[i]['QTID'] + ':' + data[i]['QID'] + ':' + data[i]['answer'][k]['id']; 
                $select.append('<option value="' + id + '" >' + data[i]['answer'][k]['text'] + '</option>');
            }
            $form.append($select);
        } else if (data[i]['QUI'] == "10040"){ //Textbox
            $form.attr('QUI', '10040');
            $form.append('<label>' + data[i]['text'] + '</label>');
            var id = data[i]['QTID'] + ':' + data[i]['QID'] + ':' + data[i]['answer'][0]['id']; 
            $form.append('<input id="'+ id  +'" type="number" class="form-control" pattern="[0-9]*" placeholder="...">');            
        }
        $panel.append($form);
    }
    if ( sessionStorage.getItem('FORM_TEMPLATE_EDIT') ) { loadUserData(); }
}

function loadUserData () {
    /*
    var qtid = sessionStorage.getItem('HEALTH_ASSESSMENT_QTID');
    var qtsid = sessionStorage.getItem('HEALTH_ASSESSMENT_QTSID');
    var get_url = config_serviceEndPoint + 'GetQShowData?CID=' + getCurrentCID() + '&qtid=' + qtid + '&qtsid=' + qtsid + '&src=00';
    
    ajaxCrossDomainGet(get_url, loadUserData_callback, 'getUserData error');
    */
}
                       
function loadUserData_callback(msg) {
    
    if (msg){
        var data = JSON.parse(msg);
        var qtid = sessionStorage.getItem('HEALTH_ASSESSMENT_QTID');
        
        if ( qtid == '00050' ){
            for(var i = 0; i < data.length; i++) {
                if (data[i]['QID'] == '00001'){
                    $('#00050\\:00001\\:99996').val( parseInt(data[i]['answer'][0]['note']) );
                }
                else if (data[i]['QID'] == '00002'){
                    $('#00050\\:00002\\:99997').val( parseInt(data[i]['answer'][0]['note']) );
                }
                else if (data[i]['QID'] == '00003'){
                    $('#00050\\:00003\\:00702').val( parseInt(data[i]['answer'][0]['note']) );
                } 
                else if (data[i]['QID'] == '00004'){
                    $('#00050\\:00004\\:99993').val( parseInt(data[i]['answer'][0]['note']) );
                } 
                else {
                    var value = data[i]['QTID'] + ":" + data[i]['QID'] + ":" + data[i]['answer'][0]['id'];
                    $('option[value="'+value+'"]').parent().val(value);
                }
            }
        } else {
            for(var i = 0; i < data.length; i++) {
                var value = data[i]['QTID'] + ":" + data[i]['QID'] + ":" + data[i]['answer'][0]['id'];
                $('option[value="'+value+'"]').parent().val(value);
            }
        }
        
    }
}
function checkCompleteTask () {
    var qtid = sessionStorage.getItem('HEALTH_ASSESSMENT_QTID');
    var isComplete = true;
    if (qtid == '00050'){
        if ($('#00050\\:00001\\:99996').val() == '') { isComplete = false; }
        if ($('#00050\\:00002\\:99997').val() == '') { isComplete = false; } 
        if ($('#00050\\:00003\\:00702').val() == '') { isComplete = false; } 
        if ($('#00050\\:00004\\:99993').val() == '') { isComplete = false; } 
        
        $('#questionPanel .form-group select').each(function () {
            if ($(this).find('option:selected').val() == 99999) {
                isComplete = false;
            }
        });
    } else {
        $('#questionPanel .form-group select').each(function () {
            if ($(this).find('option:selected').val() == 99999) {
                isComplete = false;
            }
        });
    }
    
    return isComplete;
}

function saveHealthAssessmentResult() {
    if (checkCompleteTask()){
        if ( getDateFromDatePicker('recdate-input')){
            var answer = [];
            var qtid = sessionStorage.getItem('HEALTH_ASSESSMENT_QTID');
            if (qtid == '00050') {
                answer.push("00050:00001:99996:" + $('#00050\\:00001\\:99996').val());
                answer.push("00050:00002:99997:" + $('#00050\\:00002\\:99997').val());
                answer.push("00050:00003:00702:" + $('#00050\\:00003\\:00702').val());
                answer.push("00050:00004:99993:" + $('#00050\\:00004\\:99993').val());
                $('#questionPanel .form-group select').each(function () {
                    answer.push ($(this).find('option:selected').val());            
                });
            } else {
                $('#questionPanel .form-group select').each(function () {
                    answer.push ($(this).find('option:selected').val());            
                });
            }
            console.log(answer);
            if ( sessionStorage.getItem('HEALTH_ASSESSMENT_EDIT') ) {
                post_url = (config_serviceEndPoint + 'SaveRecord?Mode=0101&CID=' + getCurrentCID() + '&StaffId=' + getCurrentStaffID() + '&HostId=' + getCurrentHostID() + '&RecDate=' + getDateFromDatePicker('recdate-input') + '&System=00001&src=00&Data=' + encodeURIComponent(JSON.stringify(answer)) + '&QTSID=' + sessionStorage.getItem('HEALTH_ASSESSMENT_QTSID'));
            } else {
                post_url = (config_serviceEndPoint + 'SaveRecord?Mode=0100&CID=' + getCurrentCID() + '&StaffId=' + getCurrentStaffID() + '&HostId=' + getCurrentHostID() + '&RecDate=' + getDateFromDatePicker('recdate-input') + '&System=00001&src=00&Data=' + encodeURIComponent(JSON.stringify(answer)));
            }
            console.log(post_url);
            ajaxCrossDomainGet(post_url, saveHealth_callback, 'post error');
        } else {
            alert('กรุณาเลือกวันที่');
        }        
    } else {
        alert('กรุณาตอบคำถามให้ครบ');
    }
}

function saveHealth_callback(msg){    
    if (msg) {
        if (JSON.parse(msg).status == 'OK'){
            bootbox.dialog({
                  message: " ",
                  title: "บันทึกการประเมินสุขภาพเสร็จสมบูรณ์",
                  buttons: {
                    toScreening: {
                      label: "ตกลง",
                      className: "btn-primary",
                      callback: function() {
                        loadContentPage('#content', contentPath + "searchContent.html", getRemainingList);
                      }
                    }
                  }
                });
        } else {
            alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        }
    }
}

function numericValidation (e) {    
    // Allow: backspace, delete, tab, escape, enter and .
    if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
         // Allow: Ctrl+A, Command+A
        (e.keyCode == 65 && ( e.ctrlKey === true || e.metaKey === true ) ) || 
         // Allow: home, end, left, right, down, up
        (e.keyCode >= 35 && e.keyCode <= 40)) {
             // let it happen, don't do anything
             return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
    }
}