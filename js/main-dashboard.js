var CURRENT_CHART_STATE = 0;
var IS_COMPLETE_STATE = true; 

/*

*/
$(document).ready(function () {
    
    $('.wrapper.row-offcanvas.row-offcanvas-left.active.relative').removeClass('active').removeClass('relative');
    bindProvince();
    
    getChartByState();
});

function bindProvince() {
    $.ajax({
        url: serviceEndpoint_area + 'getProvinceList',
        dataType: 'jsonp',
        success: function (msg) {
            var data = JSON.parse(msg);
            if (data) {
                var $ddl = $('#province');
                $ddl.empty().append('<option value="99999">--เลือกจังหวัด--</option>');
                $('#city').empty().append('<option value="99999">--เลือกอำเภอ--</option>');
                $('#tumbom').empty().append('<option value="99999">--เลือกอำเภอ--</option>');
                for (var i = 0; i < data.length; i++) {
                    $ddl.append('<option value="' + data[i]['Id'] + '">' + data[i]['Desc'] + '</option>');
                }
                $ddl.unbind('change').on('change', function (e) {                    
                    bindCity(this.value);
                });
            }
        },
        error: function (request, status, error) {
            alert('ไม่สามารถโหลดข้อมูลจังหวัด ' + error);
        }
    });
}

function bindCity(value) {
    var $ddl = $('#city');
    $ddl.empty().append('<option value="99999">--เลือกอำเภอ--</option>');
    $.ajax({
        url: serviceEndpoint_area + 'getAmphorList?ProvinceID=' + value,
        dataType: 'jsonp',
        success: function (msg) {
            var data = JSON.parse(msg);
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    $ddl.append('<option value="' + data[i]['Id'] + '">' + data[i]['Desc'] + '</option>');
                }
                $ddl.unbind('change').on('change', function (e) {
                    bindTumbon(this.value);
                });
            }
        },
        error: function (request, status, error) {
            alert('ไม่สามารถโหลดข้อมูลอำเภอ ' + error);
        }
    });
}

function bindTumbon(value) {
    console.log('bind tumbon');
    
    var $ddl = $('#tumbon');
    $ddl.empty().append('<option value="99999">--เลือกตำบล--</option>');
    $.ajax({
        url: serviceEndpoint_area + 'getTumbonList?AmphorID=' + value,
        dataType: 'jsonp',
        success: function (msg) {
            var data = JSON.parse(msg);
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    $ddl.append('<option value="' + data[i]['Id'] + '">' + data[i]['Desc'] + '</option>');
                }
            }
        },
        error: function (request, status, error) {
            alert('ไม่สามารถโหลดข้อมูลตำบล ' + error);
        }
    });
}

function getChartByState(){
    switch (CURRENT_CHART_STATE) {
        case 0:
            ajaxCrossDomainGet(config_serviceEndPoint + 'GetChartSummaryHostCMProgress?hostid=' + getCurrentHostID()  + '&year=2015', getChartByState_callback, 'getChartByState_callback');
            break;
        case 1:
            ajaxCrossDomainGet('http://newtestnew.azurewebsites.net/ServiceControl/Service.svc/GetReportCountQuestion?listArea=[%27HT1020201%27]&hosttype=01&categoryType=screening&category=&result=&state=1&startAge=60&endAge=200&startDate=01/01/2015&endDate=05/31/2015', getChartByState_callback, 'getChartByState_callback');
            break;
        case 10:
            ajaxCrossDomainGet(config_serviceEndPoint + 'getReport?a=2', getChartByState_callback, 'getChartByState_callback');
            break;
        case 11:
            ajaxCrossDomainGet(config_serviceEndPoint + 'getReport?a=2', getChartByState_callback, 'getChartByState_callback');
            break;
        case 12:
            ajaxCrossDomainGet(config_serviceEndPoint + 'getReport?a=2', getChartByState_callback, 'getChartByState_callback');
            break;
        case 2:
            ajaxCrossDomainGet('http://newtestnew.azurewebsites.net/ServiceControl/Service.svc/GetReportCountQuestion?listArea=[%27HT1020201%27]&hosttype=01&categoryType=assessment&category=&result=&state=1&startAge=60&endAge=200&startDate=01/01/2015&endDate=05/31/2015', getChartByState_callback, 'getChartByState_callback');
            break;
        case 20:
            ajaxCrossDomainGet(config_serviceEndPoint + 'getReport?a=2', getChartByState_callback, 'getChartByState_callback');            
            break;
        case 21:
            ajaxCrossDomainGet(config_serviceEndPoint + 'getReport?a=2', getChartByState_callback, 'getChartByState_callback');
            break;
        case 22:
            ajaxCrossDomainGet(config_serviceEndPoint + 'getReport?a=2', getChartByState_callback, 'getChartByState_callback');
            break;
        case 3:
            ajaxCrossDomainGet(config_serviceEndPoint + 'getReport?a=3', getChartByState_callback, 'getChartByState_callback');
            break;
        case 4:
            ajaxCrossDomainGet(config_serviceEndPoint + 'getReport?a=3', getChartByState_callback, 'getChartByState_callback');
            break;
        default :
            alert(CURRENT_CHART_STATE);
            break;
    }
}

function getChartByState_callback(msg) {
    var data = JSON.parse(msg);
    
    switch (CURRENT_CHART_STATE){
        case 0:       
            var cdata = google.visualization.arrayToDataTable([
                  ['ด้าน', 'ดำเนินการแล้ว', 'ยังไม่ได้ดำเนินการ'],
                  ['คัดกรอง', data['data'][1]['count']['pass'] , data['data'][1]['count']['notpass']],
                  ['ประเมิน', data['data'][2]['count']['pass'], data['data'][2]['count']['notpass']],
                  ['ประเมินความต้องการ', data['data'][3]['count']['pass'],  data['data'][3]['count']['notpass']],
                  ['วางแผนบริการ', data['data'][4]['count']['pass'], data['data'][4]['count']['notpass']]
                ]);
            var options = {
                chart: {
                title: 'INIT'
              },
              bars: 'horizontal' // Required for Material Bar Charts.
            };

            var chart = new google.charts.Bar(document.getElementById('barchart_material'));
            function selectHandler() {
                var selectedItem = chart.getSelection()[0];
                if (selectedItem) {
                    chartEventHandler(selectedItem.row, selectedItem.column);
                }
            }            
            google.visualization.events.addListener(chart, 'select', selectHandler);            
            chart.draw(cdata, options);
            break;
        case 1:            
            drawScreeningInit(data, 'การคัดกรอง 1');
            break;
        case 10:
            drawScreening_state2(data, 'การคัดกรอง 10');
            break;
        case 11:
            drawScreening_state2(data, 'การคัดกรอง 11');
            break;
        case 12:
            drawScreening_state2(data, 'การคัดกรอง 12');
            break;
        case 2:
            drawAssessmentInit(data, 'การประเมิน');
            break;  
        case 20:
            drawAssessment_state2(data, 'การประเมิน');
            break;
        case 21:
            drawAssessment_state2(data, 'การประเมิน');
            break;
        case 22:
            drawAssessment_state2(data, 'การประเมิน');
            break; 
        case 3:
            drawNeedInit(data, 'การประเมินความต้องการ');
            break;
        case 4:
            drawPlanInit(data, 'การวางแผนให้บริการ');
            break;
    }
}

function drawScreeningInit(data, header) {
    console.log(JSON.stringify(data));
    var cdata = google.visualization.arrayToDataTable([
              ['กลุ่ม', 'จำนวน'],
              [ data['data']['result'][0]['items'][0]['name'], data['data']['result'][0]['items'][0]['value'] ],
              [ data['data']['result'][0]['items'][1]['name'], data['data']['result'][0]['items'][1]['value'] ],
              [ data['data']['result'][0]['items'][2]['name'], data['data']['result'][0]['items'][2]['value'] ]
            ]);
        var options = {
            chart: {
            title: header
          },
          bars: 'horizontal' // Required for Material Bar Charts.
        };

        var chart = new google.charts.Bar(document.getElementById('barchart_material'));
        function selectHandler() {
            var selectedItem = chart.getSelection()[0];
            if (selectedItem) {
                chartEventHandler(selectedItem.row, selectedItem.column);
            }
        }            
        google.visualization.events.addListener(chart, 'select', selectHandler);            
        chart.draw(cdata, options);
}

function drawAssessmentInit(data, header){
    console.log(JSON.stringify(data));
    var cdata = google.visualization.arrayToDataTable([
                ['กลุ่ม', 'ไม่ส่งผู้เชี่ยวชาญ','ส่งผู้เชี่ยวชาญ'],
                ['ด้านสังคม', 23, 10],
                ['ADL', 15, 13],
                ['สมอง', 5, 19],
                ['การกลืน', 9, 16],
                ['ซึมเศร้า', 20, 10]
            ]);
        var options = {
            chart: {
            title: header
          },
          bars: 'horizontal' // Required for Material Bar Charts.
        };

        var chart = new google.charts.Bar(document.getElementById('barchart_material'));
        function selectHandler() {
            var selectedItem = chart.getSelection()[0];
            if (selectedItem) {
                chartEventHandler(selectedItem.row, selectedItem.column);
            }
        }            
        google.visualization.events.addListener(chart, 'select', selectHandler);            
        chart.draw(cdata, options);
}

function drawScreening_state2(data, header){
    var cdata = google.visualization.arrayToDataTable([
              ['คำถาม', 'กลุ่ม 1','กลุ่ม 2','กลุ่ม 3'],
              [ 'การเคลื่อนที่' , 5,5,40 ],
              [ 'การลุกนั่งจากที่นอน' , 8,10,32 ],
                [ 'การขึ้นลงบันได' , 13,9,28 ],
                [ 'การใช้ห้องน้ำ' , 15,15,23 ],
                [ 'การกลั้นปัสสาวะ' , 16,15,23 ],
                [ 'การกลั้นการถ่ายอุจจาระ' , 14,15,20 ],
                [ 'การอาบน้ำ' , 22,15,14 ],
                [ 'การแต่งกาย' , 32,15,11 ],
                [ 'การสวมใส่เสื้อผ้า' , 34,15,6 ],
              [ 'การรับประทานอาหาร' , 20,26,4 ],
            ]);
        var options = {
            chart: {
            title: header
          },
          bars: 'horizontal' // Required for Material Bar Charts.
        };

        var chart = new google.charts.Bar(document.getElementById('barchart_material'));
        function selectHandler() {
            var selectedItem = chart.getSelection()[0];
            if (selectedItem) {
                chartEventHandler(selectedItem.row, selectedItem.column);
            }
        }            
        google.visualization.events.addListener(chart, 'select', selectHandler);            
        chart.draw(cdata, options);
}

function drawAssessment_state2(data, header){
    var cdata = google.visualization.arrayToDataTable([
              ['คำถาม', 'กลุ่ม 1','กลุ่ม 2','กลุ่ม 3'],
              [ 'การอยู่อาศัย หรือ ผู้ดูแลเมื่อเจ็บป่วย' , 5,5,40 ],
              [ ' ลักษณะที่อยู่อาศัย' , 8,10,32 ],
                [ 'ความเพียงพอของรายได้' , 13,9,28 ],
                [ 'ท่านอาศัยอยู่ในบ้านหลังเดียว' , 13,15,23 ],
                [ ' ท่านได้ออกกำลังกายอย่างน้อยสัปดาห์ละ 3 วัน' , 16,15,23 ],
                [ 'ท่านเคยถูกทำร้ายร่างกาย' , 23,12,20 ],
                [ ' ท่านเคยเข้าร่วมอบรม' , 31,15,23 ],
                [ 'ท่านเคยรับทราบข้อมูลด้านสิทธิประโยชน์' , 23,13,12 ],
                [ 'ท่านได้ปฏิบัติศาสนกิจตามศาสนา' , 23,15,8 ],
              [ 'ท่านได้เข้าร่วมกิจกรรมทางสังคม' , 27,16,7 ],
            ]);
        var options = {
            chart: {
            title: header
          },
          bars: 'horizontal' // Required for Material Bar Charts.
        };

        var chart = new google.charts.Bar(document.getElementById('barchart_material'));
        function selectHandler() {
            var selectedItem = chart.getSelection()[0];
            if (selectedItem) {
                chartEventHandler(selectedItem.row, selectedItem.column);
            }
        }            
        google.visualization.events.addListener(chart, 'select', selectHandler);            
        chart.draw(cdata, options);
}

function drawNeedInit(data, header){
    var cdata = google.visualization.arrayToDataTable([
                ['ความต้องการ', 'จำนวน',],
                [ 'ต้องการตรวจประเมินเพิ่ม' ,36],
                [ 'ไม้เท้าช่วยเดิน' , 30],
                [ 'เครื่องช่วยเดิน ' , 28],
                [ 'บริการรถรับส่ง ' , 24],
                [ 'การดูแลทำความสะอาดบ้าน' , 16],
            ]);
        var options = {
            chart: {
            title: header
          },
          bars: 'horizontal' // Required for Material Bar Charts.
        };

        var chart = new google.charts.Bar(document.getElementById('barchart_material'));
        function selectHandler() {
            var selectedItem = chart.getSelection()[0];
            if (selectedItem) {
                chartEventHandler(selectedItem.row, selectedItem.column);
            }
        }            
        google.visualization.events.addListener(chart, 'select', selectHandler);            
        chart.draw(cdata, options);
}

function drawPlanInit(data, header){
    var cdata = google.visualization.arrayToDataTable([
                ['', 'จำนวน',],
                [ 'การส่งเสริมโภชนาการ' , 42],
                [ 'การตรวจวัดความดันโลหิต' , 40],
                [ 'การควบคุมเวลาการเข้านอน' , 35],
                [ 'การดูแลเรื่อง จิตใจ' , 29],
                [ 'การกระตุ้นการช่วยเหลือตนเอง' , 26],
            ]);
        var options = {
            chart: {
            title: header
          },
          bars: 'horizontal' // Required for Material Bar Charts.
        };

        var chart = new google.charts.Bar(document.getElementById('barchart_material'));
        function selectHandler() {
            var selectedItem = chart.getSelection()[0];
            if (selectedItem) {
                chartEventHandler(selectedItem.row, selectedItem.column);
            }
        }            
        google.visualization.events.addListener(chart, 'select', selectHandler);            
        chart.draw(cdata, options);
}

function chartEventHandler( row, column){ // row : index[0] , column : index[1] 
    console.log(row, column);
    
    if (String(CURRENT_CHART_STATE).length > 1) { return false; }
    if (CURRENT_CHART_STATE == 3) { return false; }
    if (CURRENT_CHART_STATE == 4) { return false; }
    switch(CURRENT_CHART_STATE) {
        case 0 :
            if (column == 2) { return false; }
            switch(row){
                case 0:
                    CURRENT_CHART_STATE = 1;
                    break;
                case 1:
                    CURRENT_CHART_STATE = 2;
                    break;
                case 2:
                    CURRENT_CHART_STATE = 3;
                    break;
                case 3:
                    CURRENT_CHART_STATE = 4;
                    break;
            }            
            if (column == 2){ 
                IS_COMPLETE_STATE = false;
            } 
            break;
        case 1 :
            switch (row) {
                case 0:
                    CURRENT_CHART_STATE = 10;
                    break;
                case 1:
                    CURRENT_CHART_STATE = 11;
                    break;
                case 2:
                    CURRENT_CHART_STATE = 12;
                    break;
            }
            break;
        case 2:            
            switch (row) {
                case 0:
                    CURRENT_CHART_STATE = 20;
                    break;
                case 1:
                    CURRENT_CHART_STATE = 21;
                    break;
                case 2:
                    CURRENT_CHART_STATE = 22;
                    break;
            }
    }
    
    getChartByState();
}

function reverseEventHandler(){
   if (CURRENT_CHART_STATE == 0 ) { return true; }
    
    switch (CURRENT_CHART_STATE) {
        case 1 :
            CURRENT_CHART_STATE = 0;
            break;
        case 2 :
            CURRENT_CHART_STATE = 0;
            break;
        case 3 :
            CURRENT_CHART_STATE = 0;
            break;
        case 4 :
            CURRENT_CHART_STATE = 0;
            break;
        case 10:
            CURRENT_CHART_STATE = 1;
            break;
        case 11:
            CURRENT_CHART_STATE = 1;
            break;
        case 12:
            CURRENT_CHART_STATE = 1;
            break;
        case 20:
            CURRENT_CHART_STATE = 2;
            break;
        case 21:
            CURRENT_CHART_STATE = 2;
            break;
        case 22:
            CURRENT_CHART_STATE = 2;
            break;
    }
    
    getChartByState();
}

