
var ADLHPath = '../../pages/forms/ADLhistory.aspx';
var ADLHDIR = '../../pages/forms/';
var timelineIndex = 0;

$(document).ready(function () {
    timelineIndex = 0;
    $('#load-more-item').hide();
    $('.content-header h1').text('ประวัติการทำแบบประเมิน ADL สำหรับ ' + getCurrentName());
    bindScrollEvent();
    getItemList();
});

function bindScrollEvent() {
    $(window).scroll(function () {
        if ($(window).scrollTop() + $(window).height() > $(document).height() - 20) {
            getItemList();
        }
    });
}

function addEmptyItem(id, dateTimeStr, rightText) {
    var $li = $("<li>")
        .append('<div class="timeline-item" id="' + id + '">' +
                        '<span class="time">case : ' + rightText + '</span>' +
                        '<h3 class="timeline-header"><a href="#">ผลการประเมิน ADL</a></h3>' +
                        '<div class="timeline-body">' +
                            '<div class="loading-item-body">' +
                                '<div class="overlay">กำลังโหลดข้อมูล...</div>' +
                                '<div class="saving-img"></div>' +
                            '</div>          ' +                  
                        '</div>' +
                        '<div class="timeline-footer">' +
                            '<a class="btn btn-warning btn-flat btn-sm" onclick="viewDetail($(this).parent().parent());">ดูรายละเอียด</a>' +
                        '</div>' +
                    '</div>');
    $('.timeline').append(' <li class="time-label">' +
                                '<span class="bg-green">' + dateTimeStr + '</span>' +
                            '</li>').append($li);


    var cloneItem = $('#load-more-item').clone();
    var cloneEndClockItem = $('#end-item').clone();
    $("#load-more-item").remove();
    $("#end-item").remove();
    $('.timeline').append(cloneEndClockItem);
    $('.timeline').append(cloneItem);
}

function viewDetail(item) {
    item.find('.timeline-body table').remove();
    item.find('.loading-item-body').show();
    var jdata = new Object();
    jdata['CID'] = getCurrentCID();
    jdata['RecDate'] = item.parent().find('.timeline-item').attr('id').split(':')[1];
    $.ajax({
        type: "POST",
        url: ADLHPath + '/getResult',
        data: JSON.stringify(jdata),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            viewDetail_callBack(msg, item);
        },
        error: function (request, status, error) {
            item.find('.loading-item-body').hide();
        }
    });
}
function viewDetail_callBack(msg, item) {
    item.find('.loading-item-body').hide();
    var $table = $("<table>", { class: 'table table-condensed' });
    $table.append('<tr><th style="width: 10px">ข้อ</th><th>คำถาม</th><th style="width: 40%">ระดับการช่วยเหลือตนเอง</th><th style="width: 50px">ระดับ</th></tr>');
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
        item.find('.timeline-body').append($table);
    }
    else {
        alert(result['data']);
    }
}

function getItemList() {
    $('#load-more-item').show();
    $(window).unbind("scroll");
    var jdata = new Object();
    jdata['CID'] = getCurrentCID();
    jdata['hostID'] = sessionStorage.getItem('CURRENTHOST');
    jdata['pageIndex'] = timelineIndex;
    timelineIndex++;
    ajaxCallCodeBehind(ADLHPath + '/getTimeStamp', JSON.stringify(jdata), getItemList_callBack, 'Ajax call time-line items');
}
function getItemList_callBack(msg) {
    if (msg.d) {
        var data = JSON.parse(msg.d);        
        if (data["status"] = "OK") {
            var array = data['data'];
            for (var i = 0; i < array.length; i++) {
                addEmptyItem(array[i]['QTSID'] + ':' + array[i]['datetime'], array[i]['datetime-th'], array[i]['caseNo']);
                if (i == 0) { // first item
                    $('.timeline li:eq(1) span').attr('class', 'bg-blue');
                    var $detailButton = $('.timeline li:eq(2) .timeline-item .timeline-footer a').last().clone();
                    $('.timeline li:eq(2) .timeline-item .timeline-footer').empty();
                    $('.timeline li:eq(2) .timeline-item .timeline-footer').append('<a class="btn btn-primary btn-flat btn-sm" onclick="redirectToADLEdit(' + array[i]['QTSID'] + ');">แก้ไขการประเมิน</a>');
                    $('.timeline li:eq(2) .timeline-item .timeline-footer').append($detailButton);
                    if ($('.timeline li:eq(2) .timeline-item .timeline-body table').html() == undefined) {
                        viewDetail($('.timeline li:eq(2) .timeline-item'));
                    }
                }
            }
        }
        else {
            alert(data["data"]);
        }
    }    
    $('#load-more-item').hide();
    bindScrollEvent();
}
function redirectToADLEdit(QTSID) {
    location.href = currentDir + 'ADL.aspx?edit=' + QTSID;
}
