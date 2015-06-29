var adlChart;

function dashboard(element) {
    //alert('');
	/*
	$('.row').empty();
    $('.content').empty();
    setMainHeaderText('ยินดีต้อนรับเข้าสู่ระบบ');
    loadContentPage('.content', contentPath + "dashboardContent.html", bindDashboardContent_callBack);
    */
    clearContent();
    $('#progress-box').hide();
    if (element) { setActiveSession(element); }
    loadContentPage('#content', contentPath + "dashboardContent.html", loadDashboardContent_callback);
    
}

function loadDashboardContent_callback () {
    $('#opt-report').find('.form-control.quarter').hide();
    $('#opt-report').find('.form-control.month').hide();
    
    $('#opt-report').find('.form-control.range-type').change( function () {   
        $('#opt-report').find('.form-control.year').hide();
        $('#opt-report').find('.form-control.quarter').hide();
        $('#opt-report').find('.form-control.month').hide();
        
        if ( $(this).val() == '00001') {
            $('#opt-report').find('.form-control.year').show();
        } else if( $(this).val() == '00002') {
            $('#opt-report').find('.form-control.year').show();
            $('#opt-report').find('.form-control.quarter').show();
        } else if( $(this).val() == '00003') {
            $('#opt-report').find('.form-control.year').show();
            $('#opt-report').find('.form-control.month').show();
        }
    });
    
    var d = new Date();
    var month = d.getMonth();
    var year = d.getFullYear();
    
    ajaxCrossDomainGet(config_serviceEndPoint + 'GetChartOfElderInHostByMonth?HostId=' + getCurrentHostID() + '', getDashboardData1_callback, 'dashboard1_error');
    ajaxCrossDomainGet(config_serviceEndPoint + 'GetChartSummaryHostCMProgress?hostid=' + getCurrentHostID()  + '&year=2015', getDashboardData3_callback, 'dashboard3_error');
    // mock
    bindProvince();
    //getDashboardData4_callback([65, 59, 80, 81, 56], [28, 48, 40, 19, 86]);
}

function getDashboardData1_callback(msg) { 
    result = JSON.parse(msg);
    array = result.Data;
    console.log(array);
    var canvas = document.getElementById("dashboard_bar").getContext("2d");
    var data = {};
    data.labels = [];
    
    
    dataset_ = [];

    dataset_m = {};
    dataset_m.data = [];

    dataset_f = {};
    dataset_f.data = [];
    
    for (var i = 0; i < array.length; i++){
        data.labels.push(array[i].Category);
        dataset_m.data.push(Number(array[i].NumberOfMen));
        dataset_f.data.push(Number(array[i].NumberOfWomen));
    }

    dataset_m.fillColor = config_color[0];
    dataset_f.fillColor = config_color[1];
    dataset_.push(dataset_m);
    dataset_.push(dataset_f);
    data.datasets = dataset_;
    console.log(data);
    var chart = new Chart(canvas).Bar(data); 


}

function getDashboardData2_callback (msg) {
    data = JSON.parse(msg);
    
    var pie_data =  [
        {
            value: Number(data['Data']['G1']),
            color: config_color[2],
            label: "กลุ่มที่ 1"
        },
        {
            value: Number(data['Data']['G2']),
            color: config_color[3],
            label: "กลุ่มที่ 2"
        },
        {
            value: Number(data['Data']['G3']),
            color: config_color[4],
            label: "กลุ่มที่ 3"
        }
    ];

    console.log(pie_data);
    $('#pie-legend').append('<div style="color:'+config_color[2]+'; width:100%; font-size:20px; text-align:center;"><i class="fa fa-circle"> กลุ่มที่ 1</div>');
    $('#pie-legend').append('<div style="color:'+config_color[3]+'; width:100%; font-size:20px; text-align:center;"><i class="fa fa-circle"> กลุ่มที่ 2</div>');
    $('#pie-legend').append('<div style="color:'+config_color[4]+'; width:100%; font-size:20px; text-align:center;"><i class="fa fa-circle"> กลุ่มที่ 3</div>');

    var canvas = document.getElementById("dashboard_pie").getContext("2d");
    var chart = new Chart(canvas).Doughnut(pie_data, {
        tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %> คน",
    });

    $("#dashboard_pie").click( 
                        function(evt){
                            var activePoints = chart.getSegmentsAtEvent(evt);
                            console.log(activePoints);
                            sessionStorage.setItem("FORM_TYPE", "SCREENING");
                            sessionStorage.setItem("FORM_QTID", "00033");

                            switch(activePoints[0].label) {
                                case "กลุ่มที่ 1" :
                                    sessionStorage.setItem("FORM_RESULT", "00001");
                                    break;
                                case "กลุ่มที่ 2" :
                                    sessionStorage.setItem("FORM_RESULT", "00002");
                                case "กลุ่มที่ 3" :
                                    sessionStorage.setItem("FORM_RESULT", "00003");

                            }
                            loadContentPage('#content', contentPath + "summary.html");
                        }
                    );  
}

function getDashboardData3_callback (msg) {
    if (msg) {
        var data = JSON.parse(msg);
        console.log(data);
    }
    console.log(data.data[1]['count']);

    var $tr = $("<tr>");
    $tr.append('<td>การคัดกรองศักยภาพ</td>');
    $tr.append('<td><center style="cursor:pointer" onclick="viewSummary(\'SCREENING\');"><a>' + data.data[1]['count'].pass + '</a></center></td>');
    $tr.append('<td><center style="cursor:pointer" onclick="viewSummary(\'SCREENING_INCOMPLETE\');"><a>' + data.data[1]['count'].notpass + '</a></center></td>');
    $('#summary-table').append($tr);

    $tr = $("<tr>");
    $tr.append('<td>การประเมินสำหรับการดูแลระยะยาว</td>');
    $tr.append('<td><center style="cursor:pointer" onclick="viewSummary(\'ASSESSMENT\');"><a>' + data.data[2]['count'].pass + '</a></center></td>');
    $tr.append('<td><center style="cursor:pointer" onclick="viewSummary(\'ASSESSMENT_INCOMPLETE\');"><a>' + data.data[2]['count'].notpass + '</a></center></td>');
    $('#summary-table').append($tr);

    $tr = $("<tr>");
    $tr.append('<td>การประเมินความต้องการ</td>');
    $tr.append('<td><center style="cursor:pointer" onclick="viewSummary(\'NEED\');"><a>' + data.data[3]['count'].pass + '</a></center></td>');
    $tr.append('<td><center style="cursor:pointer" onclick="viewSummary(\'NEED_INCOMPLETE\');"><a>' + data.data[3]['count'].notpass + '</a></center></td>');
    $('#summary-table').append($tr);

    $tr = $("<tr>");
    $tr.append('<td>การจัดทำแผนการดูแล</td>');
    $tr.append('<td><center style="cursor:pointer" onclick="viewSummary(\'PLAN\');"><a>' +  data.data[4]['count'].pass + '</a></center></td>');
    $tr.append('<td><center style="cursor:pointer" onclick="viewSummary(\'PLAN_INCOMPLETE\');"><a>' +  data.data[4]['count'].notpass + '</a></center></td>');
    $('#summary-table').append($tr);

}

function getDashboardData4_callback(dataG2, dataG3) {
    var data = {
        labels: ["ด้านที่ 1", "ด้านที่ 2", "ด้านที่ 3", "ด้านที่ 4", "ด้านที่ 5"],
        datasets: [
            {
                label: "กลุ่ม 2",
                fillColor: "rgba(220,220,220,0.5)",
                strokeColor: "rgba(220,220,220,0.8)",
                highlightFill: "rgba(220,220,220,0.75)",
                highlightStroke: "rgba(220,220,220,1)",
                data: dataG2
            },
            {
                label: "กลุ่ม 3",
                fillColor: "rgba(151,187,205,0.5)",
                strokeColor: "rgba(151,187,205,0.8)",
                highlightFill: "rgba(151,187,205,0.75)",
                highlightStroke: "rgba(151,187,205,1)",
                data: dataG3
            }
        ]
    };
    var canvas = document.getElementById("adl_area");
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    adlChart = new Chart(context).HorizontalBar(data);
}
function updateADLChart(dataG2, dataG3) {
    for (var i = 0; i < dataG2.length; i++) {
        adlChart.datasets[0].bars[i].value = dataG2[i];
    }
    for (var i = 0; i < dataG3.length; i++) {
        adlChart.datasets[1].bars[i].value = dataG3[i];
    }
    adlChart.update();
}

function bindProvince() {
    $.ajax({
        url: serviceEndpoint_area + 'getProvinceList',
        dataType: 'jsonp',
        success: function (msg) {
            var data = JSON.parse(msg);
            if (data) {
                var $ddl = $('#province');
                $ddl.empty().append('<option value="99999">--เลือกจังหวัด--</option>');
                for (var i = 0; i < data.length; i++) {
                    $ddl.append('<option value="' + data[i]['Id'] + '">' + data[i]['Desc'] + '</option>');
                }
                $ddl.on('change', function (e) {
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
    $ddl.empty().append('<option value="99999">--เลือกอำเภอ--</option>');;
    $.ajax({
        url: serviceEndpoint_area + 'getAmphorList?ProvinceID=' + value,
        dataType: 'jsonp',
        success: function (msg) {
            var data = JSON.parse(msg);
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    $ddl.append('<option value="' + data[i]['Id'] + '">' + data[i]['Desc'] + '</option>');
                }
                $ddl.on('change', function (e) {
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
    var $ddl = $('#tumbon');
    $ddl.empty().append('<option value="99999">--เลือกตำบล--</option>');;
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

function button_adl_ok_click() {
    var param = '';
    if ($('#tumbon option:selected').val() != '99999') {
        param = '?tumbonID=' + $('#tumbon option:selected').val() + '&src=00';
    }
    else {
        if ($('#city option:selected').val() != '99999') {
            param = '?cityID=' + $('#city option:selected').val() + '&src=00';
        }
        else {
            param = '?provinceID=' + $('#province option:selected').val() + '&src=00';
        }
    }
    console.log(config_serviceEndPoint + 'getAssessmentReportInArea' + param);
    $.ajax({
        url: config_serviceEndPoint + 'getAssessmentReportInArea' + param,
        dataType: 'jsonp',
        success: function (msg) {
            var data = JSON.parse(msg);
            if (data) {
                if (data['status'].toUpperCase() == 'OK') {
                    var jdata = data['data'];
                    var dataG2 = new Array();
                    dataG2.push(findADLgroup(jdata, '00001', '2'));
                    dataG2.push(findADLgroup(jdata, '00002', '2'));
                    dataG2.push(findADLgroup(jdata, '00003', '2'));
                    dataG2.push(findADLgroup(jdata, '00004', '2'));
                    dataG2.push(findADLgroup(jdata, '00005', '2'));

                    var dataG3 = new Array();
                    dataG3.push(findADLgroup(jdata, '00001', '3'));
                    dataG3.push(findADLgroup(jdata, '00002', '3'));
                    dataG3.push(findADLgroup(jdata, '00003', '3'));
                    dataG3.push(findADLgroup(jdata, '00004', '3'));
                    dataG3.push(findADLgroup(jdata, '00005', '3'));
                    updateADLChart(dataG2, dataG3);
                }
                else {
                    alert(data['errorMessage']);
                }
            }
        },
        error: function (request, status, error) {
            alert('ไม่สามารถโหลดข้อมูล ADL chart');
        }
    });
}

function findADLgroup(array, QTID, group) {
    for (var i = 0; i < array.length; i++) {
        if (array[i]['QTID'] == QTID && array[i]['group'] == group) {
            return Number(array[i]['count']);
        }
    }
    return 0;
}

function viewSummary (type) {
    sessionStorage.setItem('FORM_TYPE', type);
    loadContentPage('#content', contentPath + "summary.html");    
}

function createOPTReport(){
    var rangeType = $('#opt-report').find('.form-control.range-type').val();
    
    switch (rangeType) {
        case '00001': // year
            var year = Number($('#opt-report').find('.form-control.year').val());
            year = year - 543;
            console.log(year);
            sessionStorage.setItem('OPT_REPORT_START_DATE', '10/01/' + String(year - 1));
            sessionStorage.setItem('OPT_REPORT_END_DATE', '09/30/' + year);
            break;
        case '00002': //quarter
            var year = Number($('#opt-report').find('.form-control.year').val());
            year = year - 543;
            var quarter = $('#opt-report').find('.form-control.quarter').val();
            switch (quarter) {
                case '00001':
                    sessionStorage.setItem('OPT_REPORT_START_DATE', '10/01/' + String(year - 1));
                    sessionStorage.setItem('OPT_REPORT_END_DATE', '12/31/' + String(year - 1));
                    break;
                case '00002':
                    sessionStorage.setItem('OPT_REPORT_START_DATE', '01/01/' + year);
                    sessionStorage.setItem('OPT_REPORT_END_DATE', '03/31/' + year);
                    break;
                case '00003':
                    sessionStorage.setItem('OPT_REPORT_START_DATE', '04/01/' + year);
                    sessionStorage.setItem('OPT_REPORT_END_DATE', '06/30/' + year);
                    break;
                case '00004':
                    sessionStorage.setItem('OPT_REPORT_START_DATE', '07/01/' + year);
                    sessionStorage.setItem('OPT_REPORT_END_DATE', '09/30/' + year);
                    break;
            }
            break;
        case '00003':
        var year = Number($('#opt-report').find('.form-control.year').val());
            year = year - 543;
            var month = $('#opt-report').find('.form-control.month').val();
            switch (month) {
                case '00001':
                    sessionStorage.setItem('OPT_REPORT_START_DATE', '01/01/' + year);
                    sessionStorage.setItem('OPT_REPORT_END_DATE', '01/31/' + year);
                    break;
                case '00002':
                    if (year%4 == 0) {
                        var date = 29;
                    } else {
                        var date = 28;
                    }
                    sessionStorage.setItem('OPT_REPORT_START_DATE', '02/01/' + year);
                    sessionStorage.setItem('OPT_REPORT_END_DATE', '02/'+ date +'/' + year);
                    break;
                case '00003':
                    sessionStorage.setItem('OPT_REPORT_START_DATE', '03/01/' + year);
                    sessionStorage.setItem('OPT_REPORT_END_DATE', '03/31/' + year);
                    break;
                case '00004':
                    sessionStorage.setItem('OPT_REPORT_START_DATE', '04/01/' + year);
                    sessionStorage.setItem('OPT_REPORT_END_DATE', '04/30/' + year);
                    break;
                case '00005':
                    sessionStorage.setItem('OPT_REPORT_START_DATE', '05/01/' + year);
                    sessionStorage.setItem('OPT_REPORT_END_DATE', '05/31/' + year);
                    break;
                case '00006':
                    sessionStorage.setItem('OPT_REPORT_START_DATE', '06/01/' + year);
                    sessionStorage.setItem('OPT_REPORT_END_DATE', '06/30/' + year);
                    break;
                case '00007':
                    sessionStorage.setItem('OPT_REPORT_START_DATE', '07/01/' + year);
                    sessionStorage.setItem('OPT_REPORT_END_DATE', '07/30/' + year);
                    break;
                case '00008':
                    sessionStorage.setItem('OPT_REPORT_START_DATE', '08/01/' + year);
                    sessionStorage.setItem('OPT_REPORT_END_DATE', '08/31/' + year);
                    break;
                case '00009':
                    sessionStorage.setItem('OPT_REPORT_START_DATE', '09/01/' + year);
                    sessionStorage.setItem('OPT_REPORT_END_DATE', '09/30/' + year);
                    break;
                case '00010':
                    sessionStorage.setItem('OPT_REPORT_START_DATE', '10/01/' + year);
                    sessionStorage.setItem('OPT_REPORT_END_DATE', '10/31/' + year);
                    break;
                case '00011':
                    sessionStorage.setItem('OPT_REPORT_START_DATE', '11/01/' + year);
                    sessionStorage.setItem('OPT_REPORT_END_DATE', '11/30/' + year);
                    break;
                case '00012':
                    sessionStorage.setItem('OPT_REPORT_START_DATE', '12/01/' + year);
                    sessionStorage.setItem('OPT_REPORT_END_DATE', '12/31/' + year);
                    break;
            }
            break;
    }
    
    getReportData('OPT');
}
