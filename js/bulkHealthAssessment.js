var page = 0;
var hot;
var modifiedRow = [];

$(document).ready(function () {   
    
    
    $('#recdate-input').datepicker({
        language: 'th-en',
        format: 'dd-mm-yyyy',
        autoclose : true
    });
    $('.datepicker.datepicker-dropdown.dropdown-menu').css('width', '250px');
    
    
    ajaxCrossDomainGet(config_serviceEndPoint + 'GetVillage?hostId='+ getCurrentHostID() +'&src=00', getVillageList_callback);
});


function getVillageList_callback(msg) {
    var data = JSON.parse(msg);
    
    $('#villageList').append('<option value="99999">ทั้งหมด</option>');    
    for( var i = 0; i < data.length; i++){
        $('#villageList').append('<option value="' + data[i]['villageID'] + '">' + data[i]['VillageName'] + '</option>');
    }
    
    getBulkData();
}

function getBulkData () {
    var offset = page * 20;    
    var get_url = config_serviceEndPoint + 'GetPersonResultGeriatricForm?text=&host=' + getCurrentHostID() + '&village=&date=&offset=' + offset + '&next=20&form=&startDate=01/01/2014&endDate=01/01/2016';
    console.log(get_url);
    ajaxCrossDomainGet(get_url, getBulkData_callback);
}

function getBulkData_callback(msg) {
    var data = JSON.parse(msg);
    console.log(data);    
    var tData = [];
    var teethAssessment_data = [{ value : "a"}, { value : "b"}];
    
    var grayRenderer = function (instance, td, row, col, prop, value, cellProperties) {
        Handsontable.renderers.TextRenderer.apply(this, arguments);
		if(col==1){
			 $(td).css({
            background: '#EEE',
			textAlign: 'left'
        });
		
		}
		else{
        $(td).css({
            background: '#EEE'
        });
		}
    };

    var validator_2 = function (value, callback) {
        if (value < 3 && value >= 0){
            callback(true);
        } else {
            callback(false);
        }
    };
    
    var validator_19 = function (value, callback) {
        if (value < 20 && value >= 0){
            callback(true);
        } else {
            callback(false);
        }
    };
    
    var validator_5 = function (value, callback) {
        if (value < 6 && value >= 0){
            callback(true);
        } else {
            callback(false);
        }
    };
    
    var validator_48 = function (value, callback) {
        if (value < 49 && value >= 0){
            callback(true);
        } else {
            callback(false);
        }
    };
    
    var validator_14 = function (value, callback) {
        if (value < 15 && value >= 0){
            callback(true);
        } else {
            callback(false);
        }
    };
    
    var validator_30 = function (value, callback) {
        if (value < 31 && value >= 0){
            callback(true);
        } else {
            callback(false);
        }
    };
    
    for(var i = 0; i < data['data'].length; i++){
        tData.push([ data['data'][i]['cid'], data['data'][i]['firstname'] + ' ' + data['data'][i]['lastname'], '', '', '', '', '', '', '', '', '', '', '', '', '','','','']);
    }
    
    var container = document.getElementById('dataTable');
     hot = new Handsontable(container, {
        data: tData,
        minSpareRows:0,
        //colHeaders: true,
        colHeaders: ['เลขประจำตัวประชาชน','ชื่อ-นามสกุล', 'ส่วนสูง (ซม.)', 'น้ำหนัก (กก.)', 'น้ำตาลในเลือด (มก.)', 'ระดับความดันโลหิต', 'ฟัน 20 ซี่ 4 คู่สบ', 'ปัญหาการนอน', 'ปวดเข่า', '2Q', '9Q', 'MiniCog', 'สุขภาวะตา', 'หกล้ม', 'ข้อเข่าในชุมชน (Thai-KOA-SQ)', 'ข้อเข่าคลินิก', 'คัดกรองโภชนาการ', 'ประเมินโภชนาการ'],
        contextMenu: true,
        columns: [
            { type: 'text', readOnly: true, renderer: grayRenderer },
            { type: 'text', readOnly: true, renderer: grayRenderer },
            { type: 'numeric', allowInvalid: false },
            { type: 'numeric', allowInvalid: false },
            { type: 'numeric', allowInvalid: false },
            { type: 'text' },
            { type: 'dropdown' , source : ['มี','ไม่มี'] },
            { type: 'dropdown' , source : ['มี','ไม่มี'] },
            { type: 'dropdown' , source : ['มี','ไม่มี'] },
            { type: 'numeric' , format : '0', validator: validator_2},
            { type: 'numeric' , format : '0', validator: validator_19},
            { type: 'numeric' , format : '0', validator: validator_2},
            { type: 'numeric' , format : '0', validator: validator_5},
            { type: 'dropdown' , source : ['เดินไม่ได้', 'เดินได้ < 30 วินาที', 'เดินได้ > 30 วินาที']},
            { type: 'text' },
            { type: 'numeric' , format : '0', validator: validator_48},
            { type: 'numeric' , format : '0', validator: validator_14},
            { type: 'numeric' , format : '0', validator: validator_30},
        ],
        beforeChange: function(changes, source) {
            for (var i = 0; i < changes.length; i++){
                if (changes[i][2] !== changes[i][3]) {
                    modifiedRow.remove(changes[i][0]);
                    modifiedRow.push(changes[i][0]);
                }
            }
            console.log(modifiedRow);
        }
    });
}

function saveBulkHealthAssessment() {
    var data = [];
    for (var i = 0; i < modifiedRow.length; i++){
        var tableData = hot.getDataAtRow(modifiedRow[i]);
        var obj = {};
        obj['cid'] = tableData[0];
        obj['answer'] = [];
        obj['answer_point'] = [];
        obj['answer'].push ('00050:00001:99996:' + tableData[2]); //ส่วนสูง
        obj['answer'].push ('00050:00002:99997:' + tableData[3]); //นน.
        obj['answer'].push ('00050:00003:00702:' + tableData[4]); //น้ำตาล
        obj['answer'].push ('00050:00004:99993:' + tableData[5]); //ความดัน
        if ( tableData[6] ) { //ฟัน 
            if ( tableData[6] =='มี') {
                obj['answer'].push ('00050:00005:00035');
            } else {
                obj['answer'].push ('00050:00005:00036');
            }
        }
        if ( tableData[7] ) { // การนอน
            if ( tableData[7] =='มี') {
                obj['answer'].push ('00050:00007:00703');
            } else {
                obj['answer'].push ('00050:00007:00704');
            }
        }
        
        if ( tableData[8] ) { //ปวดเข่า
            if ( tableData[8] =='มี') {
                obj['answer'].push ('00050:00010:00079');
            } else {
                obj['answer'].push ('00050:00010:0080');
            }
        }
        
        obj['answer_point'].push ('00051:' + tableData[9]); //2Q
        obj['answer_point'].push ('00052:' + tableData[10]); //9Q
        obj['answer_point'].push ('00053:' + tableData[11]); //miniCog
        obj['answer_point'].push ('00054:' + tableData[12]); // ตา
        
        if (tableData[13]){ //หกล้ม
            if (tableData[13] == 'เดินไม่ได้') {
                obj['answer'].push ('00055:00001:00716');
            } else if ( tableData[13] == 'เดินได้ < 30 วินาที') {
                obj['answer'].push ('00055:00001:00717');
            } else if ( tableData[13] == 'เดินได้ > 30 วินาที') {
                obj['answer'].push ('00055:00001:00718');
            }
        }
        
        obj['answer_point'].push ('00059:' + tableData[14]); // ข้อเข่าชุมชน
        obj['answer_point'].push ('00056:' + tableData[15]); // ข้อเข่าคลินิค
        obj['answer_point'].push ('00057:' + tableData[16]); // คัดกรองโภชนาการ
        obj['answer_point'].push ('00058:' + tableData[17]); // ประเมินโภชนาการ
        
        data.push(obj);
        // console.log(tableData);
    }
    if ( data.length > 0){
        if ( getDateFromDatePicker('recdate-input') ) {
            var post_url = config_serviceEndPoint + 'SaveBulkGeriatricForm?hostid=' + getCurrentHostID() + '&recordDate='+ getDateFromDatePicker('recdate-input') + '&data=' +encodeURIComponent(JSON.stringify(data)) + '&staffId=' + getCurrentStaffID();
            console.log(post_url);
        } else {
            alert('กรุณาเลือกวันที่');
        }
    }
}