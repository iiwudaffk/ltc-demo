// library for this app
// sessionStorage key = JOB{CID}

var cm_service = 'http://alphacase.azurewebsites.net/ServiceControl/CMJsonService.svc/';
var hp_service = 'http://jektest.azurewebsites.net/ServiceControl/GetServiceControl.svc/';

var beta_service = "http://newtestnew.azurewebsites.net/ServiceControl/";

var currentPath = '../../pages/forms/Search.aspx';
var currentDir = '../../pages/';
var contentPath = '../../pages/content/';
var noImg = '../../img/UnPicUser.png';

$(document).ready(function () {
    $('.dropdown-menu').not('#ddl-role').click(function (event) {
        event.stopPropagation();
    });
    $('#ddl-role').change(function () {
        var selectedText = $(this).find("option:selected").text();
        var r = confirm("ต้องการเปลี่ยน Role ไปเป็น " + selectedText + ' หรือไม่?');
        if (r == true) {
            $('#progress-box').hide();
            clearContent();
            $('#current-role').text(selectedText);
            sessionStorage.setItem("CURRENT_ROLE", $(this).val());
            bindDefaultMenu();
            loadContentPage('#content', contentPath + "searchContent.html", getRemainingList);
        }
        else {
            var currentRole = getCurrentRole();
            $('#ddl-role option').each(function () {
                if ($(this).val() == currentRole) {
                    $(this).prop('selected', true);
                }
            });
        }
    });
    bindDefaultMenu();
});

function doLogin(data) {
    sessionStorage.setItem("STAFFID", data['StaffID']);
    sessionStorage.setItem("STAFFNAME", data['Name']);
    // sessionStorage.setItem("STAFFTEL", data['StaffTel']);
    sessionStorage.setItem("HOSTID", data['HostID']);
    sessionStorage.setItem("HOSTNAME", data['HostName']);
    sessionStorage.setItem("CURRENT_ROLE", data['Role'][0]['RoleID']);
    sessionStorage.setItem("ALL_ROLES", JSON.stringify(data['Role']));
    sessionStorage.setItem("authentication", true);
    window.location = "../pages/index.html";
}

function bindUserPanel() {
    var roles = getAllRoles();
    if (roles) {

        $('#ddl-role').empty();
        for (var i = 0; i < roles.length; i++) {
            $('#ddl-role').append('<option value="' + roles[i]['RoleID'] + '">' + roles[i]['RoleName'] + '</option>');
        }
    }
    var currentRole = getCurrentRole();
    $('#ddl-role option').each(function () {
        if ($(this).val() == currentRole) {
            $(this).prop('selected', true);
        }
    });
    var staffName = getCurrentStaffName();
    $('#username').text(staffName);
    $('#staffNameLabel').text(staffName);
    $('#departmentLabel').text(getCurrentHostName());
    $('#current-role').text(getRoleName(currentRole));
}

function logout() {
    sessionStorage.clear();
    window.location = "../pages/login.html";
}

function startAjaxLoader () {    
    if ($('#ajaxLoadScreen') != null) {
        var loader = '<div id="ajaxLoadScreen"><img id="loadingImg" src="/img/ajax-loader-bar.gif"></div>';
        $(loader).appendTo('body');
    }     
}

function stopAjaxLoader () {    
    $('#ajaxLoadScreen').remove();
}

function bindCurrentPerson() {
    var person = sessionStorage.getItem("CURRENTPERSON");
    if (person != null) {
        var data = JSON.parse(person);
        setSidebarProfile(data['CID'], data['name'], data['img']);
        bindDefaultMenu();
    }
}

function buildJSONAnswer(data) {
    //0100 insert Mode
    //0101 edit Mode       
    var array
     = [];
    var a = data;
    $.each(a, function(index, value){
        array.push(this["full-answer"]);
    });    
    return array;
}


function setSidebarProfile(CID, name, img) {
    $('.pull-left.image .img-circle').attr('src', img);
    $('.pull-left.image .img-circle').attr('onerror', "imgError(this);");
    var nameSp = name.split(' ');

    if (nameSp[1].length > (17 - nameSp[0].length)) {
        $('.pull-left.info p').html(nameSp[0] + '<p style="margin:2px 0 -8px 0;font-size:smaller">' + nameSp[1] + '</p>');
    }
    else {
        $('.pull-left.info p').text(nameSp[0] + ' ' + nameSp[1]);

    }
    $('.pull-left.info p').attr('onclick', 'showModalDetails()'); //   <------------------------
    $('.pull-left.info p').css('cursor','pointer');
    $('.pull-left.info a').text(CID);
    $('.pull-left.info a').text(CID);
    $('.pull-left.info a').prepend('<i class="fa fa-circle text-default"></i>');
    $('.user-panel .pull-left.info a').attr('title', 'ยังไม่ได้ประเมิน หรือวางแผน'); //    <-----------------------
}

function addSideBarMenu(text, notify, linkPage, isActive, iconOPTION, badgeColor) {
    var icon = 'fa fa-edit';
    if (iconOPTION) {
        icon = iconOPTION;
    }
    var $bar = $('.sidebar-menu');
    var $li = $("<li>", { class: 'active' });
    if (!isActive) {
        $li = $("<li>");
    }
    var $a = $("<a>", { href: '#', onclick: linkPage });
    $li.append($a.append('<i class="' + icon + '"></i> <span>' + text + '</span>')
            .append('<small class="badge pull-right bg-'+badgeColor+'">' + notify + '</small>'));
    $bar.append($li);
}

function addSideBarMenu_tree(text, isActive, iconOPTION, array) {
    
    var icon = 'fa fa-edit';
    if (iconOPTION) {
        icon = iconOPTION;
    }  
    var $bar = $('.sidebar-menu');
    var $li = $("<li>", { class: 'treeview active' });
    if (!isActive) {
        $li = $("<li>", { class : 'treeview' } );
    }
    
    var $a = $("<a>");
    
    $li.append($a.append('<i class="' + icon + '"></i> <span>' + text + '</span>')
            .append('<i class="fa fa-angle-left pull-right"></i>'));
    $a.attr('style', 'cursor: pointer');
    $a.on('click',  function () {
        $a.parent().find('ul').toggle('fast');
    });
    var $ul = $('<ul>', { class : 'treeview-menu' });
    $ul.attr('style', 'display:block');
    for ( var i = 0; i < array.length; i++){
        $ul.append('<li><a style="cursor:pointer;" onclick="' + array[i]['link'] + '"><i class="fa fa-circle-o"></i>' + array[i]['text'] + '</a></li>');
    }
    
    $li.append($ul);
    
    $bar.append($li);
    $ul.toggle();
}

function addSideBarHeader(text) {
    var icon = 'fa fa-edit';
    
    var $bar = $('.sidebar-menu');
    var $li = $("<li>", { class: 'header' });
    $li.append(text);
    $bar.append($li);
}

function clearSideBarMenu() {
    $('.sidebar-menu').empty(); //      <----- obsoleted
}

function showModalDetails(){
    // $('#modalDetails').modal('show');
}

function addJob(textDescription, isDone, dateTime) {
    var $list = $('.todo-list');
    var $li = $('<li>', { 'class': 'success done' });
    var $checkBox ='<div class="icheckbox_minimal" aria-checked="false" aria-disabled="false">'+
                   '<div class="icheckbox_minimal checked" aria-checked="false" aria-disabled="false" style="position: relative;"><input type="checkbox" checked="checked" value="" name="" class="job-done" style="position: absolute; opacity: 0;"><ins class="iCheck-helper" style="position: absolute; top: 0%; left: 0%; display: block; width: 100%; height: 100%; margin: 0px; padding: 0px; border: 0px; opacity: 0; background: rgb(255, 255, 255);"></ins></div>'
                   '</div>';
    var $span = $('<span>', { 'class': 'text' }).text(textDescription);
    $li.append($checkBox).append($span);
    if (!isDone) {
        $li = $('<li>', { 'class': 'danger' });
        $checkBox = $('<div>', {
            "class": 'icheckbox_minimal',
            "aria-checked": "false",
            "aria-disabled": "false",
            "style": "position: relative;"
        }).append($('<ins>', {
            "class": 'iCheck-helper job-done'
        }));
        $li.append($checkBox).append($span);
        $li.append('<small class="label label-info">' + dateTime + '</small>');
        $li.append($('<div>', {
            "class": 'tools-visible'
        }).append('<small class="label label-primary job-link" onclick="redirectToADL();">ดำเนินการ</small>'));
    }
    $list.append($li);
}

function setCurrentTask (currTask) {
    sessionStorage.removeItem("CURRENTTASK");
    sessionStorage.setItem("CURRENTTASK", currTask);
}

function clearContent() {
    $('#content').empty();
}

function clearJobs() {
    $('.todo-list').empty();
}

function redirectToADL() {
    location.href = currentDir + 'ADL.aspx';
}

function setMainHeaderText(headerText) {
    $('.content-header h1').text(headerText);
}

function bindDefaultMenu() {
    clearSideBarMenu();
    var curr_role = getCurrentRole();
    // addSideBarMenu(text, notify, linkPage, isActive, iconOPTION)
    if (curr_role == "2b4363eb-c2c7-4f49-9a9f-421d877ba059"){ // CM
        addSideBarHeader("Main");
        addSideBarMenu("ค้นหา", '', 'sidebarSearch(this)', false, 'fa fa-search', 'red');        
        
        addSideBarHeader("System");
        addSideBarMenu("คัดกรอง ADL แบบกลุ่ม", '','bulkScreening(this)', false); 
        addSideBarMenu("ประเมินสุขภาพแบบกลุ่ม", '','loadBulkHealthAssessment(this)', false);
        addSideBarMenu("รายงาน",'' ,'dashboard(this)', false, 'fa fa-bar-chart');        
        addSideBarMenu("Dashboard", '','main_dashboard(this)', false);
    } else if (curr_role == "30f15342-c82f-44d9-bea5-4845ca9f9938"){ // อสม.
        addSideBarHeader("Main");
        addSideBarMenu("ค้นหา", '', 'sidebarSearch(this)', false, 'fa fa-search', 'red');
        addSideBarMenu("ไทม์ไลน์",'' ,'load_person_timeline(this)', false,'fa fa-clock-o', 'yellow');
        addSideBarMenu("คัดกรอง",'' ,'onSidebarMenu_click("screening",this)', false, 'fa fa-building-o', 'green');
    } else if (curr_role == "0d8e5e1d-4707-4695-842a-37ec65adee30"){ //พยาบาล
        addSideBarMenu("ค้นหา", '', 'sidebarSearch(this)', false, 'fa fa-search', 'red');     
        addSideBarMenu('การให้บริการ', '', 'loadServiceProvision(this)', false, '', '' );
    }
    
}

function updateDefaultMenu() {
    console.log( sessionStorage.getItem('SCREENING_RESULT_ID') );
    
    clearSideBarMenu();
    var curr_role = getCurrentRole();
    // addSideBarMenu(text, notify, linkPage, isActive, iconOPTION)
    if (curr_role == "2b4363eb-c2c7-4f49-9a9f-421d877ba059"){ // CM
        addSideBarHeader("Main");
        addSideBarMenu("ค้นหา", '', 'sidebarSearch(this)', false, 'fa fa-search', 'red');
        addSideBarMenu("โปรไฟล์" ,'', 'onSidebarMenu_click("profile", this)', false,  'fa fa-user', '');
        addSideBarMenu("ไทม์ไลน์",'' ,'load_person_timeline(this)', false,'fa fa-clock-o', 'yellow');
        
        addSideBarHeader("การคัดกรอง");
        var a = [];
        a.push( { link : 'onSidebarMenu_click(\'screening\')', text : 'คัดกรอง ADL' });
        a.push( { link : 'loadHealthAssessment(\'00014\', \'00050\')', text : 'ข้อมูลสุขภาพทั่วไป' });
        a.push( { link : 'loadHealthAssessment(\'00015\', \'00051\')', text : 'คัดกรองโรคซึมเศร้า (2Q)' });
        a.push( { link : 'loadHealthAssessment(\'00016\', \'00052\')', text : 'คัดกรองโรคซึมเศร้า (9Q)' });
        a.push( { link : 'loadHealthAssessment(\'00017\', \'00053\')', text : 'ประเมินภาวะสมองเสื่อม' });
        a.push( { link : 'loadHealthAssessment(\'00018\', \'00054\')', text : 'คัดกรองสุขภาวะทางตา' });
        a.push( { link : 'loadHealthAssessment(\'00019\', \'00055\')', text : 'คัดกรองภาวะหกล้ม' });
        a.push( { link : 'loadHealthAssessment(\'00020\', \'00056\')', text : 'ประเมินโรคข้อเข่าเสื่อม' });
        a.push( { link : 'loadHealthAssessment(\'00021\', \'00057\')', text : 'คัดกรองภาวะโภชนาการ' });
        a.push( { link : 'loadHealthAssessment(\'00022\', \'00058\')', text : 'ประเมินภาวะโภชนาการ' });
        a.push( { link : 'loadHealthAssessment(\'00023\', \'00059\')', text : 'คัดกรองข้อเข่าเสื่อมในชุมชน' });
        addSideBarMenu_tree('การประเมินสุขภาพ', '', '', a);
        
        if ( sessionStorage.getItem('SCREENING_RESULT_ID') == '00002' || sessionStorage.getItem('SCREENING_RESULT_ID') == '00003' ) {
            addSideBarHeader("การดูแลระยะยาว");
            addSideBarMenu("ประเมิน",'' ,'onSidebarMenu_click("assessment",this)', false);
            addSideBarMenu("ประเมินความต้องการ",'' ,'onSidebarMenu_click("need",this)', false);
            addSideBarMenu("วางแผนให้บริการ",'' ,'onSidebarMenu_click("plan",this)', false);        
            addSideBarMenu("รายงานรายบุคคล",'' ,'onSidebarMenu_click("care",this)', false);
        }
        addSideBarHeader("System");        
        addSideBarMenu("คัดกรอง ADL แบบกลุ่ม", '','bulkScreening(this)', false);
        addSideBarMenu("ประเมินสุขภาพแบบกลุ่ม", '','loadBulkHealthAssessment(this)', false);
        addSideBarMenu("รายงาน",'' ,'dashboard(this)', false, 'fa fa-bar-chart');        
        addSideBarMenu("Dashboard", '','main_dashboard(this)', false); 
        addSideBarMenu('Form Template', '', 'loadFormTemplate(\'90001\', \'90001\', \'ทดสอบฟอร์ม\')', false, '', '' );
    } else if (curr_role == "30f15342-c82f-44d9-bea5-4845ca9f9938"){ // อสม.
        addSideBarHeader("Main");
        addSideBarMenu("ค้นหา", '', 'sidebarSearch(this)', false, 'fa fa-search', 'red');
        addSideBarMenu("ไทม์ไลน์",'' ,'load_person_timeline(this)', false,'fa fa-clock-o', 'yellow');
        addSideBarMenu("คัดกรอง",'' ,'onSidebarMenu_click("screening",this)', false, 'fa fa-building-o', 'green');
    } else if (curr_role == "0d8e5e1d-4707-4695-842a-37ec65adee30"){ //พยาบาล
        addSideBarMenu('การให้บริการ', '', 'loadServiceProvision(this)', false, '', '' );
    }
}

function changePersonTypeColor(id, popupText) {
    var colorClass = 'fa fa-circle text-default';
    if (id == '00001') {
        colorClass = 'fa fa-circle text-social';
    }
    else if (id == '00002') {
        colorClass = 'fa fa-circle text-home';
    }
    else if (id == '00003') {
        colorClass = 'fa fa-circle text-bed';
    }
    $('.user-panel .pull-left.info a i').attr('class', colorClass);
    $('.user-panel .pull-left.info a').attr('title', popupText);
}

function updateJobNumber(text, value) {
    var color = 'badge pull-right bg-red';
    $(".sidebar-menu li").each(function (index) {
        if ($(this).find('a span').text() == text) {
            if (value > 0) {
                $(this).find('a small').attr('class', color).text(value);
            }
            else {
                $(this).find('a small').text('');
            }
            return;
        }
    });
}

function getDateFromDatePicker (idString) {
    if ( $('#' + idString).val()) {
        var d = $('#' + idString).datepicker("getDate");
        return ((d.getMonth() + 1).toString() + "/" + d.getDate().toString() + "/" + d.getFullYear().toString());
    } else {
        return '';
    }
    
}

function getDateFromDatePickerID (fullId) {
    if ( $(fullId).val()) {
        var d = $(fullId).datepicker("getDate");
        return ((d.getMonth() + 1).toString() + "/" + d.getDate().toString() + "/" + d.getFullYear().toString());
    } else {
        return "";
    }
    
}

function setDateToDatePicker(idString , dateString){
    var queryDate = dateString, // MM-dd-yyyyy
    dateParts = queryDate.match(/(\d+)/g);
    realDate = new Date(dateParts[2], dateParts[0] - 1, dateParts[1]);  
    $('#' + idString).datepicker('setDate', realDate);
}

function isAuthenticate() {
    if (sessionStorage.getItem('authentication') == 'true') {
        return true;
    }
    else {
        return false;
    }
}

function getRoleName(roleID) {
    var data = sessionStorage.getItem("ALL_ROLES");
    if (data != null) {
        var roles = JSON.parse(data);
        for (var i = 0; i < roles.length; i++) {
            if (roles[i]['RoleID'] == roleID) {
                return roles[i]['RoleName'];
            }
        }
    }
    return null;
}

function getCurrentCID() {
    var person = sessionStorage.getItem("CURRENTPERSON");
    if (person != null) {
        var data = JSON.parse(person);
        return data['CID'].trim();
    }
    return null;
}

function getAllRoles() {
    var data = sessionStorage.getItem("ALL_ROLES");
    if (data != null) {
        return JSON.parse(data);
    }
    return null;
}

function getCurrentStaffName() {
    var data = sessionStorage.getItem("STAFFNAME");
    if (data != null) {
        return data;
    }
    return null;
}

function getCurrentHostName() {
    var data = sessionStorage.getItem("HOSTNAME");
    if (data != null) {
        return data;
    }
    return null;
}

function getCurrentRole() {
    var data = sessionStorage.getItem("CURRENT_ROLE");
    if (data != null) {
        return data;
    }
    return null;
}

function getCurrentStaffID() {
    var staff = sessionStorage.getItem("STAFFID");
    if (staff != null) {
        return staff.trim();
    }
    return null;
}

function getCurrentHostID() {
    var host = sessionStorage.getItem("HOSTID");
    if (host != null) {
        return host.trim();
    }
    return null;
}

function getCurrentName() {
    var person = sessionStorage.getItem("CURRENTPERSON");
    if (person != null) {
        var data = JSON.parse(person);
        return data['name'];
    }
    return null;
}

function getResultHtmlClass(str) {
    if (str.indexOf('25%') != -1) {
        return '<div title="' + str + '" class="progress-bar progress-bar-danger" style="width: 10%"></div>';
    }
    else if (str.indexOf('49%') != -1) {
        return '<div title="' + str + '" class="progress-bar progress-bar-danger" style="width: 25%"></div>';
    }
    else if (str.indexOf('74%') != -1) {
        return '<div title="' + str + '" class="progress-bar progress-bar-yellow" style="width: 50%"></div>';
    }
    else if (str.indexOf('75%') != -1) {
        return '<div title="' + str + '" class="progress-bar progress-bar-success" style="width: 75%"></div>';
    }
    else {
        return '<div title="' + str + '" class="progress-bar progress-bar-primary" style="width: 95%"></div>';
    }
}

function getResultLevelHtmlClass(str) {
    if (str.indexOf('25%') != -1) {
        return '<span title="' + str + '" class="badge bg-red">&lt; 25%</span>';
    }
    else if (str.indexOf('49%') != -1) {
        return '<span title="' + str + '" class="badge bg-red">25-49%</span>';
    }
    else if (str.indexOf('74%') != -1) {
        return '<span title="' + str + '" class="badge bg-yellow">50-74%</span>';
    }
    else if (str.indexOf('75%') != -1) {
        return '<span title="' + str + '" class="badge bg-green">75%</span>';
    }
    else {
        return '<span title="' + str + '" class="badge bg-light-blue">95%</span>';
    }
}

function loadContentPage(div, file, callBack) {
    $(div).load(file, callBack);
}

function imgError(image) {
    image.onerror = "";
    image.src = '../img/avatar-placeholder.png';
    return true;
}

function clearAllSession() {
    sessionStorage.clear();
}

function getMaxCMPlanNo() {
    return sessionStorage.getItem('MAX_CMPLAN_NO');
}

function getMaxCMPlanNo_ajax(){    
    
}

function getQTSID_ajax () {
    $.ajax({
        url: config_serviceEndPoint + 'GetMaxCMPlanNo?CID='+ getCurrentCID() + '&src=00',
        dataType: 'jsonp',
        success: function(msg){
            var r = JSON.parse(msg);
            setMaxQTSID(r.Val);              
        },
        error :  function (request, status, error) {
            onAjaxError(request, status, error, noteWhenError);
        }
    });
}

function setMaxQTSID (qtsid) {
    sessionStorage.setItem('MAX_QTSID', qtsid);
}

function createResultWithIcon(type, text, QTID, QTSID) {
    switch (type){
        case '00001' :
            return '<div id="' + getCurrentCID() + ':0000' + QTID + ':' + QTSID +'" onclick="expandDetailClick(this)" style="color:green; display: inline-block; cursor:pointer;"><i class="fa fa-smile-o"></i> &nbsp;'+text+'</div>';
            break;
        case '00002' :
            return '<div id="' + getCurrentCID() + ':0000' + QTID + ':' + QTSID +'"  onclick="expandDetailClick(this)" style="color:orange; display: inline-block; cursor:pointer;"><i class="fa fa-meh-o"></i> &nbsp;'+text+'</div>';
            break;
        case '00003' :
            return '<div id="' + getCurrentCID() + ':0000' + QTID + ':' + QTSID +'" onclick="expandDetailClick(this)"  style="color:red; display: inline-block; cursor:pointer;"><i class="fa fa-frown-o"></i> &nbsp;'+text+'</div>';
            break;
        case '00028' :
            return '<div id="' + getCurrentCID() + ':0000' + QTID + ':' + QTSID +'" onclick="expandDetailClick(this)"  style="color:green; display: inline-block; cursor:pointer;"><i class="fa fa-smile-o"></i> &nbsp;'+text+'</div>';
            break;
        case '00029' :
            return '<div id="' + getCurrentCID() + ':0000' + QTID + ':' + QTSID +'" onclick="expandDetailClick(this)"  style="color:red; display: inline-block; cursor:pointer;"><i class="fa fa-frown-o"></i> &nbsp;'+text+'</div>';
            break;
            
    }
}