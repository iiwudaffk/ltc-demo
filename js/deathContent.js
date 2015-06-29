var icd_count = 0;
$(document).ready(function () { 
    $('#death-date-input').datepicker({
        language: 'th-en',
        format: 'mm-dd-yyyy',
        autoclose : true
    });
    $('#label-cid').append('&nbsp;' + getCurrentCID());
    $('#label-name').append('&nbsp;' + getCurrentName());
    bindQuestion();
    
});

function bindQuestion() {
    startAjaxLoader();
    ajaxCrossDomainGet(config_serviceEndPoint + 'GetQData?QTID=00048&src=00&descOrder=true', bindQuestion_callback);
}

function bindQuestion_callback (msg) {
    console.log(msg);
    data = JSON.parse(msg);
    
    for (var i = 0; i < data.length; i++){
        switch (data[i]['QID'] ){
            case '00001':
                addChecklistAnswer('#cod', data[i]['answer']);
                break;
            case '00003':
                addChecklistAnswer('#place-of-death', data[i]['answer']);
                break;
            case '00004':
                addChecklistAnswer('#data-source', data[i]['answer']);
                break;    
        }
    }
    
    ajaxCrossDomainGet(config_serviceEndPoint + 'GetQShowData?CID='+ getCurrentCID() +'&qtid=00048&src=00&qtsid=1', bindUserData_callback);
}

function bindUserData_callback (msg) {
    data = JSON.parse(msg);
    if ( data.length > 0 ) {
        for (var i = 0; i < data.length; i++){
            switch (data[i]['QID']){
                case '00001':
                    $('#cod').val(data[i]['answer'][0]['id']);
                    break;
                case '00002':
                    var queryDate = data[i]['answer'][0]['note'], // MM-dd-yyyyy
                    dateParts = queryDate.match(/(\d+)/g);
                    realDate = new Date(dateParts[2], dateParts[0] - 1, dateParts[1]);  
                    $('#death-date-input').datepicker('setDate', realDate);                    
                    break;
                case '00003':
                    $('#place-of-death').val(data[i]['answer'][0]['id']);
                    break;
                case '00004':
                    $('#data-source').val(data[i]['answer'][0]['id']);
                    break;
            }
        }
        ajaxCrossDomainGet(config_serviceEndPoint + 'getDeadPeopleRecord?CID='+ getCurrentCID() , bindUserDataICD_callback);
    } else {
        stopAjaxLoader();
    }
}


function bindUserDataICD_callback(msg) {
    data = JSON.parse(msg);
    console.log(data);
    if ( data['status'] = 'ok' ){
        icd_list = data['data']['icd_list'];
        
        for (var i = icd_list.length - 1; i > -1; i--){
            addICD_cod(data['data']['icd_list'][i]['icd_code'], data['data']['icd_list'][i]['icd_desc'], data['data']['icd_list'][i]['date'], data['data']['icd_list'][i]['note']);
        }
        stopAjaxLoader();        
    } else {
        stopAjaxLoader();
    }
}

var icd_obj = {};


function addICD_cod (icd_code, icd_desc, date, note) {
    var $box = $('<div>', { class : 'box' });
    $box.attr('style', 'margin-top: 10px');
    $box.append('<div class="box-header" style="border-bottom: 1px solid #f4f4f4; padding: 10px;">สาเหตุการเสียชีวิต<div class="box-tools pull-right"><button onclick="closeBox(this)" class="btn btn-box-tool"><i class="fa fa-times"></i></button></div></div>');
    var $box_body = $('<div>', { class : 'box-body' });
    
    $box_body.append('<div class="row icd-box">' +
                         '<div class="col-md-6">' +
                            '<div class="form-group">' +
                                '<label>สาเหตุการเสียชีวิต (ICD10)</label>' +
                                '<select type="text" class="form-control icd10"></select>' +
                            '</div>' +
                         '</div>' + 
                        '<div class="col-md-6">' +
                            '<div class="form-group">' +
                                '<label>วันที่เสียชีวิต</label>' + 
                                '<div class="input-group">' +
                                    '<input id="icd-date-'+ icd_count + '" type="text" class="form-control datepicker" placeholder="วันที่...">' +
                                    '<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +  
                        '<div class="col-md-6">' +
                            '<div class="form-group">' +
                                '<label>รายละเอียด</label>' +
                                '<textarea class="form-control note" rows="3" placeholder="รายละเอียด"></textarea>' +
                            '</div>' +
                        '</div>' +
                     '</div>');
    
    
    
    
    
    if (icd_code) {
        icd_obj['id'] = icd_code;
        icd_obj['text'] = icd_code + ' ' + icd_desc;
        
        console.log(icd_obj);
    }
    
  
    
    if (note) {
        $box_body.find('.form-control.note').val(note);
    }
    
    $box_body.find('.form-control.datepicker').datepicker({ language: 'th-en', format: 'mm-dd-yyyy', autoclose : true });
    if (String(date) && Date.parse(date)) {
        var queryDate = date, // MM-dd-yyyyy
        dateParts = queryDate.match(/(\d+)/g);
        realDate = new Date(dateParts[2], dateParts[0] - 1, dateParts[1]);  
        $box_body.find('.form-control.datepicker').datepicker('setDate', realDate); 
    }

    $box.append($box_body);
    $('#add-icd-code').before($box); 

    $(".form-control.icd10").select2({ 
      ajax: {
        url: function (params) {
            return "http://newtestnew.azurewebsites.net/ServiceControl/Service.svc/getsearchicd?text="+ params.term +"&where=all&offset=0&next=10&limit=true"
        },
        dataType: 'jsonp',
        delay: 250,        
        processResults: function (data, page) {
          // parse the results into the format expected by Select2.
          // since we are using custom formatting functions we do not need to
          // alter the remote JSON data
            
            var obj = JSON.parse(data); 
            
          return {
            results: obj['data']
          };
        },
        cache: true,
        allowClear : true
      }        
    });
    
    var $sel = $(".form-control.icd10:eq(" + icd_count +")");
    if (icd_code) {
        $sel.append('<option value="'+icd_code+'" selected>' + icd_code + ': ' + icd_desc + '</option>').trigger('change');
    }  
    
    
    icd_count++;
}

function closeBox(element) {
    var $element = $(element);
    $element.parent().parent().parent().remove();
}

function addChecklistAnswer(id, answer){
    $(id).append('<option value="99999">-กรุณาเลือก-</option>');
    for(var i = 0; i < answer.length; i++){
        $(id).append('<option value="'+ answer[i]['id'] +'">'+ answer[i]['text'] +'</option>');
    }
    $(id).val("99999");    
}

function saveDeathResult () {
    var answer = [];
    
    if (getDateFromDatePicker('death-date-input') ) {
        answer.push ("00048:00002:99998:" + getDateFromDatePicker('death-date-input'));
    } else {
        alert('กรุณาตอบคำถามให้ครบ');
        return false;
    }
    
    if ($('#cod').val() != "99999") {
        answer.push ("00048:00001:" + $('#cod').val());
    } else {
        alert('กรุณาตอบคำถามให้ครบ');
        return false;
    }
    
    if ($('#place-of-death').val() != "99999") {
        answer.push ("00048:00003:" + $('#place-of-death').val());
    } else {
        alert('กรุณาตอบคำถามให้ครบ');
        return false;
    }
    
    if ($('#data-source').val() != "99999") {
        answer.push ("00048:00004:" + $('#data-source').val());
    } else {
        alert('กรุณาตอบคำถามให้ครบ');
        return false;
    }
    var valid = true;
    
    var icd_array = [];
    if ( $('.row.icd-box') ) {
        
        $('.row.icd-box').each( function () { 
            var obj = {};
            if ($(this).find('.form-control.icd10').val()) {
                obj['icd_code'] = $(this).find('.form-control.icd10').val();
            } else {                
                return valid = false;
            }
            
            var date_id = $(this).find('.form-control.datepicker').attr('id');            
            
            if (date_id) {
                if ( getDateFromDatePicker(date_id) ) {
                   obj['date'] = String(getDateFromDatePicker(date_id));
                } else { 
                    alert('กรุณาตอบคำถามให้ครบ');
                    return  valid = false;
                }
            } else {
                alert('กรุณาตอบคำถามให้ครบ');
                return valid = false;
            }
        
            obj['note'] = $(this).find('.form-control.note').val();
            
            
            icd_array.push(obj);            
        });
        
    }
    
    console.log(answer);
    console.log(icd_array);
    
    post_url = (config_serviceEndPoint + 'insertDeadPeopleRecord?mode=0001&cid=' + getCurrentCID() + '&StaffId=' + getCurrentStaffID() + '&HostId=' + getCurrentHostID() + '&RecDate=&Data=' + encodeURIComponent(JSON.stringify(answer)) + '&dataicd=' + encodeURIComponent(JSON.stringify(icd_array)));
    console.log(post_url);
    if (valid) {
        startAjaxLoader();
        ajaxCrossDomainGet(post_url, saveDeathResult_callback, 'saveDeath error');    
    } else {
        alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    }
}

function saveDeathResult_callback (msg) {
    var result = JSON.parse(msg);
    console.log(result);
    
    if ( result['status'] == 'ok' ){
        bootbox.dialog({
          message: ' ',
          title: "การบันทึกเสร็จสมบูรณ์",
          buttons: {
            toScreening: {
              label: "ตกลง",
              className: "btn-primary",
              callback: function() {
                // setCurrentTask("profile"); 
                loadContentPage('#content', contentPath + "searchContent.html", getRemainingList);
              }
            }
          }
        });
    }
    stopAjaxLoader();
}

