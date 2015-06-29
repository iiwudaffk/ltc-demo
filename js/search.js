
// sessionStorage key = F{CID}, PHONE{CID}, CURRENTPERSON
// sessionStorage key = CURRENTHOST
// sessionStorage key = JOBCOUNT{CID}
// sessionStorage key = PERSONTYPE{CID}
// sessionStorage key = SEARCHLIST


$(document).ready(function () {
    
});

function search() {
    searchReady = false;
    sessionStorage.removeItem("SEARCHLIST");
    if (sessionStorage.getItem('CURRENTHOST') == null) {
        sessionStorage.setItem('CURRENTHOST', $('#HiddenField_host').val());
    }
    $('.content-header h1').text('เลือกผู้รับบริการ');
    $('.row').empty();
    $('.content').empty();
    bindSearchContent();
}

function bindSearchContent() {
    console.log(contentPath);
    loadContentPage('.content', contentPath + "searchContent.html", bindSearchContent_callBack);
}
function bindSearchContent_callBack(response, status, xhr) {
    if (status == "error") {
        var msg = "ไม่สามารถโหลดไฟล์ : " + file + ' ได้';
        $("#error").html(msg + xhr.status + " " + xhr.statusText);
    }
    else {
        $(this).clone().appendTo("body").remove();
        $('.overlay').show();
        $('.overlay').css('text-align', 'center');
        // $('.overlay').text('กำลังค้นหา...');
        // $('.loading-img').show();
        $('.sidebar-form .input-group input').prop('disabled', true);
        searchReady = true;
        var textSearch = $('.sidebar-form .input-group input').val();

        var jdata = new Object();
        jdata['text'] = textSearch;
        jdata['host'] = 'HT1020001';
        jdata['page'] = Number(sessionStorage.getItem("searchPage"));
        jdata['number'] = '8';
        ajaxCallGet(cm_service + 'getSearchPerson', jdata, search_callBack, 'Ajax call search.', search_callBackError); //error ** if people not found

        //var jdata = new Object();
        //jdata['text'] = textSearch;
        //jdata['host'] = sessionStorage.getItem('CURRENTHOST');
        //jdata['page'] = Number(sessionStorage.getItem("searchPage"));
        //jdata['number'] = '8';
        //ajaxCallGet(cm_service + 'getSearchPerson', jdata, search_callBack, 'Ajax call search.', search_callBackError);

        //var jdata = new Object();
        //jdata['hostID'] = sessionStorage.getItem('CURRENTHOST');
        //jdata['text'] = textSearch;
        //jdata['pageNo'] = Number(sessionStorage.getItem("searchPage"));
        //ajaxCallCodeBehind(currentPath + '/getSearch', JSON.stringify(jdata), search_callBack, 'Ajax call search.', search_callBackError);
    }
}
function search_callBack(msg) {
    console.log(msg)
    checkButtonAndVisible();
    if (msg) {
        var result = JSON.parse(msg);
        console.log(result)
        if (result) {
            if (result.length > 0) {
                updateImg(0, result);
            }
           
            else {
                var pageIndex = Number(sessionStorage.getItem("searchPage"));
                pageIndex--;
                sessionStorage.setItem("searchPage", pageIndex);
                checkButtonAndVisible();
                alert(result['data']);
                $('.overlay').hide();
                $('.loading-img').hide();
                $('.sidebar-form .input-group input').prop('disabled', false);

                // re-bind
                bindSearchButton();
            }
        }
    }
}


function search_callBackError(request, status, error) {
    checkButtonAndVisible();
    $('.overlay').hide();
    $('.loading-img').hide();
    $('.sidebar-form .input-group input').prop('disabled', false);
    alert('Error. ' + status + ' ' + error);

    stopAjaxLoader();
}

function updateImg(index, data) {
    // $('.overlay').text('กำลังค้นหา...รูปที่ ' + index + '/' + data.length);
    $.ajax({
        url: cm_service + 'getSidebarProfile' + '?callback=?',
        dataType: 'json',
        data: { 'CID': data[index]['Id'], 'Hosttype': '01' },
        success: function (msg) {
            var dataList = sessionStorage.getItem("SEARCHLIST");
            var array = new Array();
            if (dataList) {
                array = JSON.parse(dataList);
            }
            var person = new Object();
            person["img"] = JSON.parse(msg).Child_Pic;
            person["CID"] = data[index]['Id'];
            person["name"] = '';
            person["phone"] = '';
            person["age"] = '';
            person["family"] = '';
            array.push(person);
            sessionStorage.setItem("SEARCHLIST", JSON.stringify(array));

            if (data.length - 1 > index) {
                updateImg(index + 1, data);
            }
            else {
                // $('.overlay').text('กำลังค้นหา...รูปที่ ' + index + '/' + data.length);
                updatePersonDetail(0, data);
            }
        }
    });
}
function updatePersonDetail(index, data) {
    var CID = data[index]['Id'];
    // $('.overlay').text('ปรับปรุงรายละเอียด ' + index + '/' + data.length);
    $.ajax({
        url: cm_service + 'getShortProfile' + '?callback=?',
        dataType: 'json',
        data: { 'CID': CID, 'Hosttype': '01' },
        success: function (msg) {
            //console.log(msg)
            var tmp = JSON.parse(msg);
            if (tmp) {
                var dataList = sessionStorage.getItem("SEARCHLIST");
                if (dataList) {
                    var array = JSON.parse(dataList);
                    for (var i = 0; i < array.length; i++) {
                        if (array[i]['CID'] == CID) {
                            array[i]["name"] = tmp.Title + tmp.Name;
                            array[i]["phone"] = tmp.Mobile;
                            array[i]["age"] = getAge(tmp.DOB);

                            var family = tmp.family;
                            var jFamily = new Array();
                            for (var j = 0; j < family.length; j++) {
                                var f = new Object();
                                f["title"] = family.Title;
                                f["name"] = family.Name;
                                f["age"] = family.Age;
                                f["relation"] = family.Relation;
                                jFamily.Add(f);
                            }
                            array[i]["family"] = jFamily;
                            break;
                        }
                    }
                    sessionStorage.setItem("SEARCHLIST", JSON.stringify(array));
                }

                if (data.length - 1 > index) {
                    updatePersonDetail(index + 1, data);
                }
                else {
                    $('.overlay').text('ปรับปรุงรายละเอียด ' + index + '/' + data.length);
                    $('.overlay').hide();
                    $('.loading-img').hide();
                    $('.sidebar-form .input-group input').prop('disabled', false);
                    //re-bind
                    bindSearchButton();
                    bindCard();
                }
            }
        }
    });
}

function getAge(date) {
    var currentYear = new Date().getFullYear();
    if (date) {
        if (date.split('/')[0]) {
            return currentYear - Number(date.split('/')[0]);
        }
    }
    return null;
}

function bindCard() {
    var tmp = sessionStorage.getItem("SEARCHLIST");
    if (tmp) {
        data = JSON.parse(tmp);
        var itemCount = 1;
        var $container = $('#searchContent');
        $container.empty();
        var $divRow = $("<div>", { class: "row" });
        if (data.length == 0) {
            $('#button-next').hide();
            return;
        }
        for (var i = 0; i < data.length; i++) {
            var imgLink = noImg;
            sessionStorage.setItem("F" + data[i]['CID'], JSON.stringify(data[i]['family']));
            sessionStorage.setItem("PHONE" + data[i]['CID'], data[i]['phone']);
            if (data[i]['img']) {
                imgLink = data[i]['img'];
            }
            var $divCol = $("<div>", { class: "col-lg-3 col-xs-6" });
            var $divSmallBox = $("<div>", { class: "small-box bg-teal" });
            var $divInner = $("<div>", { class: "inner" })
                .append('<h3>' + data[i]['age'] + '<span class="year-box">ปี</span></h3>')
                .append('<p>' + data[i]['name'].split(/[\s,]+/)[0] + '</p>')
                .append('<p>' + data[i]['name'].split(/[\s,]+/)[1] + '</p>')
                .append('<p class="cid-box">' + data[i]['CID'] + '</p>');
            var $divImg = $("<div>", { class: "img" }).append('<img src="' + imgLink + '" />');

            $divSmallBox.append($divInner).append($divImg).append('<a href="#" onclick="showDetails($(this));" class="small-box-footer" data-toggle="modal" data-target="#modalDetails">ข้อมูลเพิ่มเติม <i class="fa fa-arrow-circle-right"></i></a>');
            $divCol.append($divSmallBox);
            $divRow.append($divCol);

            if ((i + 1) % 4 == 0) { // append and create new row
                $container.append($divRow);
                $divRow = $("<div>", { class: "row" });
            }
        }
        if (!$divRow.is(':empty')) {
            $container.append($divRow);
            $divRow = $("<div>", { class: "row" });
        }
    }
    stopAjaxLoader();
}

function button_prev_click() {
    var pageIndex = Number(sessionStorage.getItem("searchPage"));
    pageIndex--;
    sessionStorage.setItem("searchPage", pageIndex);
    search();
}

function button_next_click() {
    var pageIndex = Number(sessionStorage.getItem("searchPage"));
    pageIndex++;
    sessionStorage.setItem("searchPage", pageIndex);
    search();
}

function checkButtonAndVisible() {
    var pageIndex = Number(sessionStorage.getItem("searchPage"));
    $('#button-prev').hide();
    $('#button-next').hide();

    if (pageIndex == 0) {
        $('#panel-button').css('width', '150');
        $('#button-next').show();
    }
    else if (pageIndex > 0) {
        $('#panel-button').css('width', '350');
        $('#button-prev').show();
        $('#button-next').show();
    }
}

function showDetails(person) {
    $('a[href="#tab-person"]').tab('show');
    var CID = person.parent().find('.inner .cid-box').text();
    var age = person.parent().find('.inner h3').text();
    var img = person.parent().find('.img img').attr('src');
    var name = '';
    person.parent().find('.inner p').not('.cid-box').each(function (i, row) {
        name += row.innerText + " ";
    });
    bindModalData(CID, name, age, img);
}

function bindModalData(CID, name, age, img) {
    $('#myModalLabel').text('ข้อมูลของ ' + name + ' ' + CID);
    $('#modal-name').text(name);
    $('#modal-age').text(age);
    $('#modal-phone').text('-');
    $('#modal-address').text('-');
    $('#modal-fname').text('-');
    $('#modal-fphone').text('-');
    var phone = sessionStorage.getItem('PHONE' + CID);
    if (phone) {
        $('#modal-phone').text(phone);
    }
    $('.modal-person-img').attr('src', img);
    bindAddress(CID);
    bindFamily(CID);
    bindHomeImg(CID);
}
function bindAddress(CID) {
    var jdata = new Object();
    jdata['CID'] = CID;

    ajaxCallGet(cm_service + 'getAddress', jdata, bindAddress_callBack, 'Ajax call address.');
    ajaxCallGet(cm_service + 'getFamilyCarrerMain', jdata, bindFamilyCarrerMain_callBack, 'Ajax call FamilyCarrerMain.');
}
function bindAddress_callBack(msg) {
    var jdata = JSON.parse(msg);
    var address = jdata['house'];
    if (jdata['moo']) {
        address += ' ม.' + jdata['moo'];
    }
    if (jdata['street']) {
        address += ' ' + jdata['street'];
    }
    if (jdata['tumbon']) {
        address += ' ต.' + jdata['tumbon'];
    }
    if (jdata['city']) {
        address += ' อ.' + jdata['city'];
    }
    if (jdata['province']) {
        address += ' จ.' + jdata['province'];
    }
    if (address.length > 0) {
        $('#modal-address').text(address);
    }
}
function bindFamilyCarrerMain_callBack(msg) {
    var jdata = JSON.parse(msg);
    if (jdata['name']) {
        $('#modal-fname').text(jdata['name']);
    }
    if (jdata['phone']) {
        $('#modal-fphone').text(jdata['phone']);
    }
}

function bindFamily(CID) {
    var $table = $('#table-family tbody');
    var family = sessionStorage.getItem('F' + CID);
    if (family) {
        var jf = JSON.parse(family);
        if (jf.length > 0) {
            $('#table-family tr').not(':first').remove();
        }
        else {
            return;
        }
        for (var i = 0; i < jf.length; i++) {
            var $tr = $("<tr>").append('<td>' + (i + 1) + '.</td>');
            if (jf[i]['name']) {
                $tr.append('<td>' + jf[i]['title'] + ' ' + jf[i]['name'] + '</td>');
            }
            else {
                $tr.append('<td>&nbsp;</td>');
            }
            if (jf[i]['age']) {
                $tr.append('<td>' + jf[i]['age'] + ' ปี</td>');
            }
            else {
                $tr.append('<td>-</td>');
            }
            if (jf[i]['relation']) {
                $tr.append('<td>' + jf[i]['relation'] + '</td>');
            }
            else {
                $tr.append('<td>-</td>');
            }
            $table.append($tr);
        }
    }
}

function bindHomeImg(CID) {
    var jdata = new Object();
    jdata['CID'] = CID;
    // ajaxCallCodeBehind(currentPath + '/getHomeImg', JSON.stringify(jdata), bindHomeImg_callBack, 'Ajax call get home image.');
}
function bindHomeImg_callBack(msg) {
    var jdata = JSON.parse(msg.d);
    if (jdata['status'] == 'OK') {
        $('#img-home-current-in01').attr('src', jdata['currentImg']['inhome01']);
        $('#img-home-old-in01').attr('src', jdata['oldImg']['inhome01']);

        $('#img-home-current-in02').attr('src', jdata['currentImg']['inhome02']);
        $('#img-home-old-in02').attr('src', jdata['oldImg']['inhome02']);

        $('#img-home-current-out01').attr('src', jdata['currentImg']['outhome01']);
        $('#img-home-old-out01').attr('src', jdata['oldImg']['outhome01']);

        $('#img-home-current-out02').attr('src', jdata['currentImg']['outhome02']);
        $('#img-home-old-out02').attr('src', jdata['oldImg']['outhome02']);
    }
}

function selectedPerson(button) {
    var CID = $('#myModalLabel').text().split(' ').pop().trim();
    if (CID.length > 0) {
        var img = $('.modal-person-img').attr('src');
        var name = $('#modal-name').text();

        var cPerson = new Object();
        cPerson['CID'] = CID;
        cPerson['name'] = name;
        cPerson['img'] = img;
        sessionStorage.setItem("CURRENTPERSON", JSON.stringify(cPerson));
        console.log(cPerson);
        // clear old data
        sessionStorage.removeItem("section");
        for (var i = 1; i < 7; i++) {
            sessionStorage.removeItem("ADLUSE" + i);
        }

        setSidebarProfile(CID, name, img);
        // bindDefaultMenu(CID);

        var jobCount = sessionStorage.getItem('JOBCOUNT' + CID);
        

        $('#modalDetails').modal('hide');

        $('.content-header h1').text('เลือกผู้รับบริการ');
        $('.row').empty();
         $('.content').empty();
    }
}
function personalPlan_callBack(msg) {
    var data = JSON.parse(msg.d);
    if (data) {
        var CID = getCurrentCID();
        if (CID != null && data.length > 0) {
            if (data[0]['CMPlanNo'] != 'ERROR') {
                var jobCount = 0;
                for (var i = 0; i < data.length; i++) {
                    var job = data[i];
                    if (job['lastProvision'].length == 0) {
                        jobCount++;
                    }
                }
                sessionStorage.setItem('JOBCOUNT' + CID, jobCount);
                updateJobNumber('งานของฉัน', jobCount);
                sessionStorage.setItem("JOB" + CID, JSON.stringify(data));
            }
            else {
                updateJobNumber('งานของฉัน', 0);
            }
        }
    }
    updatePersonColor(CID);
}

function updatePersonColor(CID) {
    var isPlan = "FALSE";
    var jobs = sessionStorage.getItem("JOB" + CID);
    if (jobs != null) {
        var data = JSON.parse(jobs);
        if (data.length > 0) {
            isPlan = "TRUE";
        }
    }
    var personType = sessionStorage.getItem('PERSONTYPE' + CID);
    if (personType == null) {
        var jdata = new Object();
        jdata['CID'] = CID;
        jdata['isPlan'] = isPlan;
        ajaxCallCodeBehind(currentPath + '/getPersonType', JSON.stringify(jdata), updatePersonColor_callBack, 'Ajax call get personal type');
    }
    else {
        var data = JSON.parse(personType);
        changePersonTypeColor(data['id'], data['name']);
    }
}
function updatePersonColor_callBack(msg) {
    var data = JSON.parse(msg.d);
    if (data) {
        if (data['status'] == 'OK') {
            var id = data['id'];
            sessionStorage.setItem('PERSONTYPE' + getCurrentCID(), JSON.stringify(data));
            changePersonTypeColor(data['id'], data['name']);
        }
    }
}
