$(document).ready(function () {    
    $('#recdate-input').datepicker({
        language: 'th-en',
        format: 'dd-mm-yyyy'
    });
    $('.datepicker.datepicker-dropdown.dropdown-menu').css('width', '250px');   
   
    bindQuestion();   
    
});


function bindQuestion() {
    
    ajaxCrossDomainGet(config_serviceEndPoint + 'GetPlan?CID=' + getCurrentCID() +"&CmPlanNo=" + sessionStorage.getItem("CM_PLANNO") , bindQuestion_callBack);
}

function bindQuestion_callBack(msg) {
    var data = JSON.parse(msg);
    var section = Number(sessionStorage.getItem("section"));
    bindQuestion_exec(data);   
}

function bindQuestion_exec(data) {
    console.log(data);
    
    if ( sessionStorage.getItem("PLAN_RECDATE")) {
        setDateToDatePicker('recdate-input', sessionStorage.getItem("PLAN_RECDATE"));
    }
    
    for (var i = 0; i < data['data'].length ; i++ ){
        $('#tabs-list').append('<li><a href="#tab_'+i+'" data-toggle="tab">'+ data['data'][i]['name'] + '</a></li>');
        
        var $pane = $('<div>', { class : 'tab-pane' });
        $pane.attr('id','tab_' + i);
        
        
        var $result_desc = $('<div>', { class : "box box-warning" });
        $result_desc.attr('style', 'margin-top: 8px;');
        $result_desc.append('<div class="box-header" style="border-bottom: 1px solid #f4f4f4; padding: 10px; font-weight: 700"> การประเมิน</div>');
        var $result_desc_body = $('<div>', { class : "box-body" });
        $result_desc_body.append('<div style="font-weight: 700; display: inline; margin-right: 5px;">ผลการประเมิน :</div>' +  createResultWithIcon(data['data'][i]['resultid'],data['data'][i]['resultdesc'], i+1, sessionStorage.getItem('ASSESSMENT_EDIT_QTSID')));
        $result_desc.append($result_desc_body);
        
        $pane.append($result_desc);
        
        var $goal = $('<div>', { class : "box box-warning" });
        $goal.attr('style', 'margin-top: 8px;');
        $goal.append('<div class="box-header" style="border-bottom: 1px solid #f4f4f4; padding: 10px; font-weight: 700">เป้าหมาย</div>');
        var $goal_body =  $('<div>', { class : "box-body" });        
        $goal_body.append('<div class="form-group goal" qtid="'+ data['data'][i]['qtid'] +'"><label>เป้าหมายระยะสั้น</label><input type="text" class="form-control short-term-goal" placeholder="เป้าหมายระยะสั้น ..."><label>เป้าหมายระยะยาว</label><input type="text" class="form-control long-term-goal" placeholder="เป้าหมายระยะยาว ..."></div>');
        
        if ( data['data'][i]['short_goal'] ) { $goal_body.find('.form-control.short-term-goal').val(data['data'][i]['short_goal']) };
        if ( data['data'][i]['long_goal'] ) { $goal_body.find('.form-control.long-term-goal').val(data['data'][i]['long_goal']) };
        
        $goal.append($goal_body);
        $pane.append($goal);
        
        var $need = $('<div>' , { class : "box box-warning" });
        $need.attr('style', 'margin-top: 8px;');
        $need.append('<div class="box-header" style="border-bottom: 1px solid #f4f4f4; padding: 10px; font-weight: 700"> การประเมินความต้องการ</div>');
        
        var $need_body = $('<div>', { class : "box-body" });
        $need_body.append('<div style="font-weight: 700; display: inline; margin-right: 5px;">ความต้องการข้องผู้สูงอายุ :</div>');
        
        var $need_ul = $('<ul>');
        $need_ul.attr('style',' font-weight: 500; display: inline-table; ');
        
        for(var j = 0; j < data['data'][i]['need'].length; j++){
            $need_ul.append('<li>' + data['data'][i]['need'][j]['name']+ '</li>');
           
        }
        $need_body.append($need_ul);
        $need.append($need_body);
        $pane.append($need);
        
        var $tree_box  = $('<div>' , { class : "box box-warning" });
        $tree_box.attr('style', 'margin: 8px 0px;');
        
        var $tree_box_body = $('<div>', { class : "box-body" });
        $tree_box_body.append ('<div style="font-weight: 700;  margin-right: 5px">บริการที่ต้องการ : </div>');
        
        var $tree = $('<div>' , { class : 'tree'});        
        for (var j = 0; j < data['data'][i]['service'].length; j++){            
            var $ul = $('<ul>');
            var $li = $('<li>');
            $li.append('<span><span>' + data['data'][i]['service'][j]['name'] + '</span></span>');            
            
            var $sub_ul = $('<ul>');
            for (var k = 0; k < data['data'][i]['service'][j]['activity'].length; k++){
                var $sub_li = $('<li>');
                var isChecked = '';
                if (data['data'][i]['service'][j]['activity'][k]['selected'] ) { isChecked = 'checked'; }
                $sub_li.append('<span><input type="checkbox" style="margin-right: 5px;" '+isChecked+' value="'+ data['data'][i]['service'][j]['activity'][k]['actcode'] + '">' + data['data'][i]['service'][j]['activity'][k]['name'] + '</span></span>');
                $sub_ul.append($sub_li);                
            }
            $li.append($sub_ul);
            $ul.append($li);
            $tree.append($ul);            
        }
        
        $tree_box_body.append($tree);
        $tree_box.append($tree_box_body);
        $pane.append($tree_box);
        
        $('#tabs-content').append($pane);
        
        
    }  
    $('#tabs-list').find('li:eq(0)').attr('class','active');
    $('#tabs-content').find('div:eq(0)').addClass('active');
    // sessionStorage.removeItem("PLANNING_IS_EDIT");
    initializeTree();
}

function createNeedList() {
    
}

function savePlanningResult  () {
    
    var data = [];
    var dataGoal = [];
    
    $('input[type="checkbox"]').each(function() {
        if (this.checked) { 
            data.push(this.value);
        }
    });
    
    $('.form-group').each( function () {
        var obj = {};
        obj['qtid'] = $(this).attr('qtid');
        obj['short_goal'] = $(this).find('input.short-term-goal').val();
        obj['long_goal'] = $(this).find('input.long-term-goal').val();
        
        dataGoal.push(obj);
    });    
    
    
    if (data.length > 0){
        startAjaxLoader();
        post_url = (config_serviceEndPoint + 'SavePlan?CID=' + getCurrentCID() + '&StaffId=' + getCurrentStaffID() + '&HostId=' + getCurrentHostID() + '&startPlanTime=' + getDateFromDatePicker('recdate-input') + '&CmPlanNo='+sessionStorage.getItem("CM_PLANNO")+'&Data=' + encodeURIComponent(JSON.stringify(data)) + '&dataGoal=' + encodeURIComponent(JSON.stringify(dataGoal)));
        
        ajaxCrossDomainGet(post_url, savePlanningResult_callback);
    } else {

        alert('กรุณาวางแผนให้บริการ');
    }    
}

function savePlanningResult_callback (msg) {
    if (JSON.parse(msg).status == "ok"){
        bootbox.dialog({
          message: " ",
          title: "บันทึกการวางแผนเสร็จสมบูรณ์",
          buttons: {
            toScreening: {
              label: "ตกลง",
              className: "btn-primary",
              callback: function() {
                setCurrentTask("plan"); 
                loadContentPage('#content', contentPath + "searchContent.html", getRemainingList);
              }
            }
          }
        });
    } else {
        alert('เกิดการผิดพลาด กรุณาลองใหม่อีกครั้ง');
    }
    stopAjaxLoader();
}

function initializeTree() {
    $('.tree li:has(ul)').addClass('parent_li').find(' > span').attr('title', 'ย่อ');
    $('.tree li.parent_li > span > span').on('click', function (e) {
        var children = $(this).parent().parent('li.parent_li').find(' > ul > li');
        if (children.is(":visible")) {
            children.hide('fast');            
        } else {
            children.show('fast');            
        }
        e.stopPropagation();
    });
    
    $('li.parent_li').find(' > ul > li').hide();
    
}

function expandDetailClick(div) {
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
    $panel.append('<hr />');

    for (var i = 0; i < jdata.length; i++) {
        var Q = jdata[i]['text'];
        var A = jdata[i]['answer'][0]['text'];
        $panel.append(createExpand_li_QA((i + 1), Q, A));
    }
}
