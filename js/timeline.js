$(document).ready(function () {
    console.log('timeline'); 
    startAjaxLoader();
    $('#timeline-header h3').empty();
    $('#timeline-header h3').append('ประวัติการดูแลของ ' + getCurrentName() );

    ajaxCrossDomainGet(config_serviceEndPoint + 'GetCMElderTLHeader?CID=' + getCurrentCID() , timeline_callback);
});

var $timeline_label;

function timeline_callback (msg) {   

    timeline = JSON.parse(msg);
    console.log(timeline);
    
    if (timeline.length > 0){
        for (var i = 0; i < timeline.length; i++){
            var $time = $("<li>", { class : "time-label"});
            $time.append('<span class="bg-yellow" style="cursor:pointer">บริการ #' + timeline[i].CMPlanNo + '</span>');
            $time.attr("id", "time-label-" + i);
            $time.attr("onclick", 'viewTimelineDetail('+i+','+timeline[i]['CMPlanNo']+')');

            $('#timeline-body').append($time);        
        }

        viewTimelineDetail(0, timeline[0].CMPlanNo); 
        $('#timeline-body').append('<li ><i class="fa fa-clock-o bg-gray"></i></li>');
    } else {
        $('#timeline-body').remove();
        $('#timeline-content').append('ไม่มีข้อมูล');
        
        sessionStorage.setItem('SCREENING_RESULT_ID', '');
        updateDefaultMenu();
        stopAjaxLoader();
    }
    
    
}


function viewTimelineDetail (index, CmPlanNo) {
    $timeline_label = $('#time-label-' + index);
    console.log($timeline_label);
    console.log(CmPlanNo);
    //$timeline_label.after("");
    ajaxCrossDomainGet(config_serviceEndPoint + 'GetCMElderTLDetail?CID=' + getCurrentCID() + '&cmPlanNo=' + CmPlanNo, viewTimelineDetail_callback, 'timeline-detail error');
}

function viewTimelineDetail_callback (msg) {    
    console.log(msg);
    data = JSON.parse(msg);
    
    sessionStorage.setItem('SCREENING_RESULT_ID', data['Screening']['DATA'][0]['ResultID']);
    // clear
    $timeline_label.nextUntil('.timeline-label', '.timeline-wrapper').remove();

    if (data['Screening']['DATA'].length > 0) {
        var $screening_li = $("<li>", { class : "timeline-wrapper"});
        $screening_li.append('<i class="fa fa-envelope bg-blue"></i>');
        var $screening_item = $("<div>", { class : "timeline-item"});
        var $screening_item_body = $("<div>", { class : "timeline-body"});
        $screening_item_body.append('<div style="width: 350px; display: inline-block;">' + data['Screening']['DATA'][0]['QTDesc'] + '</div>');

        switch (data['Screening']['DATA'][0]['ResultID']) {
            case "00001" :
                $screening_item_body.append('<div style="color:green; display: inline-block; cursor:pointer;"><i class="fa fa-smile-o"></i> &nbsp;'+data['Screening']['DATA'][0]['Result']+'</div>');
                break;
            case "00002" :
                $screening_item_body.append('<div style="color:orange; display: inline-block; cursor:pointer;"><i class="fa fa-meh-o"></i> &nbsp;'+data['Screening']['DATA'][0]['Result']+'</div>');
                break;
            case "00003" :
                $screening_item_body.append('<div style="color:red; display: inline-block; cursor:pointer;"><i class="fa fa-frown-o"></i> &nbsp;'+data['Screening']['DATA'][0]['Result']+'</div>');
                break;    
        }
        
        $screening_item_body.find('div').last().attr('id', getCurrentCID() + ':' + data['Screening']['DATA'][0]['QTID'] + ':'  + data['Screening']['QTSID']).attr('onclick','expandDetailClick(this)');

        $screening_item.append('<h3 class="timeline-header">'+data['Screening']['RecDate'] +' : คัดกรอง โดย '+data['Screening']['Staff']+'</h3>');  
        $screening_item.append($screening_item_body);

        $screening_li.append($screening_item);
    }
    console.log(data);
    
    if (data['Assessment']['DATA'].length > 0) {
        var $assessment_li = $("<li>", { class : "timeline-wrapper"});
        $assessment_li.append('<i class="fa fa-envelope bg-green"></i>');
        var $assessment_item = $("<div>", { class : "timeline-item"});
        var $assessment_item_body = $("<div>", { class : "timeline-body"});        

        //part 1
        for (var i = 0; i < data['Assessment']['DATA'].length ; i++) {
        if (data['Assessment']['DATA'][i]['QTID'] !="00000") {
            var $result_div = $("<div>");
            $result_div.append('<div style="width: 350px; display: inline-block;">' + data['Assessment']['DATA'][i]['QTDesc'] + '</div>');
            if (data['Assessment']['DATA'][i]['ResultID'] =="00028"){
                $result_div.append('<div style="color:green; display: inline-block; cursor:pointer;"><i class="fa fa-smile-o"></i> &nbsp;'+data['Assessment']['DATA'][i]['Result']+'</div>');
            } else if (data['Assessment']['DATA'][i]['ResultID'] == "00029" ) {
                $result_div.append('<div style="color:red; display: inline-block; cursor:pointer;"><i class="fa fa-frown-o"></i> &nbsp;'+data['Assessment']['DATA'][i]['Result']+'</div>');
            }  else if (data['Assessment']['DATA'][i]['ResultID'] == "00001" ) {
                $result_div.append('<div style="color:green; display: inline-block; cursor:pointer;"><i class="fa fa-smile-o"></i> &nbsp;'+data['Assessment']['DATA'][i]['Result']+'</div>');
            }   else if (data['Assessment']['DATA'][i]['ResultID'] == "00002" ) {
                $result_div.append('<div style="color:orange; display: inline-block; cursor:pointer;"><i class="fa fa-meh-o"></i> &nbsp;'+data['Assessment']['DATA'][i]['Result']+'</div>');
            }   else if (data['Assessment']['DATA'][i]['ResultID'] == "00003" ) {
                $result_div.append('<div style="color:red; display: inline-block; cursor:pointer;"><i class="fa fa-frown-o"></i> &nbsp;'+data['Assessment']['DATA'][i]['Result']+'</div>');
            }  
            $result_div.find('div').last().attr('id', getCurrentCID() + ':' + data['Assessment']['DATA'][i]['QTID'] + ':'  + data['Assessment']['QTSID']).attr('onclick','expandDetailClick(this)');
            $assessment_item_body.append($result_div);
            
        }
        }

        // part 2        
        

        $assessment_item.append('<h3 class="timeline-header">'+data['Assessment']['RecDate'] +' : ประเมิน โดย '+data['Assessment']['Staff']+'</h3>');  
        $assessment_item.append($assessment_item_body);

        $assessment_li.append($assessment_item);
    }

    if (data['NeedAssessment']['DATA'].length > 0) {
        var $need_li = $("<li>", { class : "timeline-wrapper"});
        $need_li.append('<i class="fa fa-envelope bg-red"></i>');
        var $need_item = $("<div>", { class : "timeline-item"});
        $need_item.append('<h3 class="timeline-header" style="border: none;">'+data['NeedAssessment']['RecDate'] +' : ประเมินความต้องการ โดย '+data['NeedAssessment']['Staff']+'</h3>');         

        $need_li.append($need_item);
    }

    $timeline_label.after($need_li);
    $timeline_label.after($assessment_li);
    $timeline_label.after($screening_li);
    
    updateDefaultMenu();
    stopAjaxLoader();
}

function expandDetailClick(div) {
    console.log(div);
    var id = $(div).attr('id').split(':'); // cid qtid qtsid
    if (id.length == 3) {
        var $li = $(div).parent();
        var toggle = $li.attr('data-toggle');
        if (toggle == 'true') {
            $li.attr('data-toggle', false);
        }
        else {
            $li.attr('data-toggle', true);
        }
        $li.find(".timeline-body, hr").remove();
        if (toggle == 'true') {
            // get all Q&A
            $.ajax({
                url: config_serviceEndPoint + 'GetQShowData?CID=' + id[0] + '&qtid=' + id[1] + '&qtsid=' + id[2] + '&src=00',
                dataType: 'jsonp',
                success: function (msg) {
                    getExpandQA_callBack($li, msg, id[0]);
                },
                error: function (request, status, error) {
                    alert('ไม่สามารถโหลดข้อมูล คำตอบเก่า!');
                }
            });
        }
    }
    else {
        alert('ไม่สามารถดูข้อมูลได้ ข้อมูล CID QTID  QTSID ไม่ครบ');
    }
}

function getExpandQA_callBack($panel, data, CID) {
    var jdata = JSON.parse(data);
   // var $panel = $('#detail-' + CID).find('.box.box-warning div li').last();
    $panel.append('<hr style="margin:0;" />');

    for (var i = 0; i < jdata.length; i++) {
        var Q = jdata[i]['text'];
        var A = jdata[i]['answer'][0]['text'];
        $panel.append(createExpand_li_QA((i + 1), Q, A));
    }
}

function createExpand_li_QA(index, Q, A) {
    var $screening_item_body = $("<div>", { class: "timeline-body" });
    $screening_item_body.append('<div style="width: 50%; display: inline-block;">' + index + '.&nbsp;' + Q + '</div>');
    $screening_item_body.append('<div style="width: 50%; display: inline-block;"> &nbsp;' + A + '</div>');
    $screening_item_body.append('<hr style="margin:0;" />');
    return $screening_item_body;
}

