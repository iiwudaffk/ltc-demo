
// sessionStorage -> NEED_EDIT_QTSID

var timelineIndex = 0;
var serviceEndPoint = 'http://localhost:49552/servicecontrol/gethpservice.svc/';
var NewserviceEndPoint = 'http://localhost:49552/servicecontrol/Service.svc/';

var CID = '0990099009949';
var RoleID = '9AAD19F7-7306-4528-A367-0BF86E9746DE';
var cmPlanNO = '2';

$(document).ready(function () {
    timelineIndex = 0;
    $('#load-more-item').hide();
    $('.content-header h1').text('ประวัติแบบบันทึกการให้บริการ สำหรับ ' + getCurrentName());
    bindScrollEvent();
    getListCMPlan();
    //  getItemList();
});

function bindScrollEvent() {
    $(window).scroll(function () {
        if ($(window).scrollTop() + $(window).height() > $(document).height() - 20) {
            //  getItemList();
            getListCMPlan();
        }
    });
}


function getItemList(cmPlan,planData) {
    $(window).unbind("scroll");
    timelineIndex++;
    // test

    $.ajax({
        url: serviceEndPoint + 'GetServiceProvisionHistoryData?CID=' + CID + '&RoleID=' + RoleID + '&cmPlanNO=' + cmPlan,
        dataType: 'jsonp',
        success: function (msg) {
            //  getItemList_callBack(msg);
            var inTime = '';
            var data = jQuery.parseJSON(msg);
            var count = data.length - 1;
            for (var i = 0; i < data.length; i++) {

                if (cmPlan == cmPlanNO) {
                    if (i == 0) {

                        inTime += '<li id="t' + data[count].PSNumber + '" class="time-label-n">' +
                                             '<span class="bg-green">' + data[count].PSDateTime + '</span>' +
                                         '</li>' +
                  '<li>' +
                       ' <div class="timeline-item-n" id="' + data[count].PSNumber + '">' +
                                  '<span class="time">ครั้งที่ : ' + data[count].PSNumber + '</span>' +
                                  '<h3 class="timeline-header-n"><a href="#">ผลการให้บริการ</a></h3>' +
                                  '<div class="timeline-body-n">' +
                                  '</div>' +
                                  '<div class="timeline-footer-n">' +
                                      '<a class="btn btn-primary btn-flat btn-sm" onclick="redirectToServiceEdit(' + data[count].PSNumber + ');">แก้ไขการให้บริการ</a>' + '<a class="btn btn-warning btn-flat btn-sm" onclick="viewDetail($(this).parent().parent(),' + data[count].PSNumber + ',' + cmPlan + ');">ดูรายละเอียด</a>' + '<a class="btn btn-warning btn-flat btn-sm" style="background-color:#FC2052" onclick="deleteserviceProvision(' + data[count].PSNumber + ');">ลบ</a>' +
                                  '</div>' +
                              '</div>' +
                        '  </li>';
                    }
                    else {
                        inTime += '<li id="t' + data[count].PSNumber + '" class="time-label-n">' +
                                 '<span class="bg-green">' + data[count].PSDateTime + '</span>' +
                             '</li>' +
      '<li>' +
           ' <div class="timeline-item-n" id="' + data[count].PSNumber + '">' +
                      '<span class="time">ครั้งที่ : ' + data[count].PSNumber + '</span>' +
                      '<h3 class="timeline-header-n"><a href="#">ผลการให้บริการ</a></h3>' +
                      '<div class="timeline-body-n">' +
                      '</div>' +
                      '<div class="timeline-footer-n">' +
                          '<a class="btn btn-primary btn-flat btn-sm" onclick="redirectToServiceEdit(' + data[count].PSNumber + ');">แก้ไขการให้บริการ</a>' + '<a class="btn btn-warning btn-flat btn-sm" onclick="viewDetail($(this).parent().parent(),' + data[count].PSNumber + ',' + cmPlan + ');">ดูรายละเอียด</a>' +
                      '</div>' +
                  '</div>' +
            '  </li>';
                    }
                }
                else {
                    inTime += '<li id="t' + data[count].PSNumber + '" class="time-label-n">' +
                              '<span class="bg-green">' + data[count].PSDateTime + '</span>' +
                          '</li>' +
   '<li>' +
        ' <div class="timeline-item-n" id="' + data[count].PSNumber + '">' +
                   '<span class="time">ครั้งที่ : ' + data[count].PSNumber + '</span>' +
                   '<h3 class="timeline-header-n"><a href="#">ผลการให้บริการ</a></h3>' +
                   '<div class="timeline-body-n">' +
                   '</div>' +
                   '<div class="timeline-footer-n">' +
                       '<a class="btn btn-warning btn-flat btn-sm" onclick="viewDetail($(this).parent().parent(),' + data[count].PSNumber + ',' + cmPlan + ');">ดูรายละเอียด</a>' +
                   '</div>' +
               '</div>' +
         '  </li>';
                }
                count--;
            }
            addItem(inTime, cmPlan, planData);

        },
        error: function (request, status, error) {
            return;
        }
    });
}

function getListCMPlan() {

    $.ajax({
        url: serviceEndPoint + 'GetAllCMPlan?CID=' + CID,
        dataType: 'jsonp',
        success: function (msg) {
            getItemList_callBack(msg);
        },
        error: function (request, status, error) {

        }
    });

    //  getItemList_callBack('[{ "cmPlan": "1" }]');

}

function getItemList_callBack(msg) {
    var data = JSON.parse(msg);
    console.log(data);
    if (msg) {


        var planData = [];
        var subData = [];
        var nowPlan = '';
        var count = data.length - 1;
        for (var i = 0; i < data.length; i++) {

            getItemList(data[count].CMPlanNo, data);
            //if (i == 0) { // first item
            //$('.timeline li:eq(1) span').attr('class', 'bg-blue');
            //    var $detailButton = $('.timeline li:eq(2) .timeline-item .timeline-footer a').last().clone();
            //    $('.timeline li:eq(2) .timeline-item .timeline-footer').empty();
            //    $('.timeline li:eq(2) .timeline-item .timeline-footer').append('<a class="btn btn-primary btn-flat btn-sm" onclick="redirectToScreeningEdit(' + i + ');">แก้ไขการประเมิน</a>');
            //    $('.timeline li:eq(2) .timeline-item .timeline-footer').append($detailButton);
            //    //if ($('.timeline li:eq(2) .timeline-item .timeline-body table').html() == undefined) {
            //    //    viewDetail($('.timeline li:eq(2) .timeline-item'));
            //    //}
            //}
            count--;
        }
    }

    stopAjaxLoader();
}

function getdataForPlan(inTime, cmPlan) {

    $.ajax({
        url: NewserviceEndPoint + 'GetAllQResultInForm?cid=' + CID + '&fid=00001&qtsid={qtsid}&src=00',
        dataType: 'jsonp',
        success: function (msg) {
            getItemList_callBack(msg);
        },
        error: function (request, status, error) {

        }
    });
}

function addItem(inTime, cmPlan, planData) {

    if (inTime == '') {
        var $li = $("<li>")
    .append('<div class="timeline-item" id="' + cmPlan + '">' +
                    '<span class="time">เลขแผนบริการ : ' + cmPlan + '</span>' +
                    '<div class="timeline-body">' +
                    '</div>' +
                    '<div class="timeline-footer">' +

       ' <ul class="timeline-n">' +
           ' <li> ' +
              '  <div class="timeline-item-n" > ' +
                   ' <div class="timeline-body-n"> ' +
                       ' <a >ยังไม่มีบันทึกการให้บริการ</a> ' +
                   ' </div> ' +
              '  </div> ' +
           ' </li> ' +
        ' </ul>' +
                    '</div>' +
                '</div>');
        $('.timeline').append(' <li id="t' + cmPlan + '" class="time-label">' +
                                        '<span class="bg-blue">แผนบริการที่ ' + cmPlan + '</span>' +
                                    '</li>').append($li);
    }
    else {
        var $li = $("<li>")
    .append('<div class="timeline-item" id="' + cmPlan + '">' +
                    '<div> ' +
                    ' ผู้สูงอายุ  '+
                    '</div> ' +
                    '<span class="time">เลขแผนบริการ : ' + cmPlan + '</span>' +
                    '<div class="timeline-body">' +
                    '</div>' +
                    '<div class="timeline-footer">' +

       ' <ul class="timeline-n">' +

       inTime +
         '<li id="end-item' + cmPlan + '">' +
        '<i class="fa fa-clock-o"></i>' +
    '</li>' +
'  </ul>' +
                    '</div>' +
                '</div>');
        $('.timeline').append(' <li id="t' + cmPlan + '" class="time-label">' +
                                        '<span class="bg-blue">แผนบริการที่ ' + cmPlan + '</span>' +
                                    '</li>').append($li);
    }

    var cloneItem = $('#load-more-item').clone();
    var cloneEndClockItem = $('#end-item').clone();
    $("#load-more-item").remove();
    $("#end-item").remove();
    $('.timeline').append(cloneEndClockItem);
    $('.timeline').append(cloneItem);
}

function viewDetail(item, PSNumber, cmPlan) {
    item.find('.timeline-body-n table').remove();
    item.find('.loading-item-body').show();
    //  var PSNumber = item.parent().find('.timeline-item').attr('id').split(':')[0];
    $.ajax({
        url: serviceEndPoint + 'GetServiceProvisionViewHistoryData?CID=' + CID + '&RoleID=' + RoleID + '&cmPlanNO=' + cmPlan + '&PSNumber=' + PSNumber,
        dataType: 'jsonp',
        success: function (msg) {
            viewDetail_callBack(msg, item);
        },
        error: function (request, status, error) {

            item.find('.loading-item-body').hide();
        }
    });
}

function deleteserviceProvision(PSNumber) {

    var txt;
    var r = confirm("ต้องการลบข้อมูลการให้บริการหรือไม่");
    if (r == true) {
        $.ajax({
            url: serviceEndPoint + 'DeleteServiceProvisionViewHistoryData?CID=' + CID + '&cmPlanNO=' + cmPlanNO + '&PSNumber=' + PSNumber,
            dataType: 'jsonp',
            success: function (msg) {
                document.getElementById(PSNumber).remove();
                document.getElementById('t' + PSNumber).remove();
                txt = "ลบข้อมูลสำเร็จ";
                loadContentPage('.content', contentPath + "serviceProvisionOldContent.html", null);
            },
            error: function (request, status, error) {

            }
        });


    } else {
        txt = "You pressed Cancel!";
    }


}

function viewDetail_callBack(msg, item) {
    item.find('.loading-item-body').hide();
    var $table = $("<table>", { class: 'table table-condensed' });
    $table.append('<tr><th style="width: 20px">ข้อ</th><th>กิจกรรมที่ให้บริการ</th><th style="width: 40%">Note</th></tr>');
    var data = jQuery.parseJSON(msg);
    if (data) {
        for (var i in data) {
            var $tr = $("<tr>")
                .append($('<td>', { text: parseInt(i) + 1 + '. ' }))
                    .append($('<td>', { text: data[i].ACTName }))
                      .append($('<td>', { text: data[i].Note }));
            $table.append($tr);
        }
        item.find('.timeline-body-n').append($table);
    }
    else {
        alert('ไม่พบข้อมูลการทำแบบประเมิน!');
    }
}

function redirectToServiceEdit(number) {
    sessionStorage.setItem("section", 1);
    sessionStorage.setItem("NUMBER_SERVICE", number);
    loadContentPage('.content', contentPath + "serviceProvisionContent.html", null);
}

function redirectToServiceProvision() {
    sessionStorage.setItem("section", 1);
    // sessionStorage.removeItem("NEED_EDIT_QTSID");
    loadContentPage('.content', contentPath + "serviceProvisionContent.html", null);
}


function testJS() {
    alert('test test');
}