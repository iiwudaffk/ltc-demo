var completeInsert = 0;
var errorInsert = 0;
var errorCount = 0;
var ipAddress = "";

$(document).ready(function () {
    timelineIndex = 0;
    $('#load-more-item').hide();
    $('.continueloading').hide();
    $('.completeloading').hide();
    $('.content-header h1').text('นำเข้าข้อมูลผู้สูงอายุ (HosXP)');

    $.get('http://api.hostip.info/get_json.php', function (data) {
        ipAddress = data.ip;
    });
    /*
    var states = new Array;
    $('#searchHealthList').keyup(function () {
        $.get('http://localhost:49552/ServiceControl/GetHpService.svc/getLikeHost?data=' + $('#searchHealthList').val() + '&src=01', function (data) {
            var array = JSON.parse(data);
            var arrayTemp = new Array();
            $.each(array, function (i, state) {
                console.log(state);
                arrayTemp[i] = state.hostName;
                //map[state.HostName] = state;
                //states.push(state.HostName);
                //console.log(state);
            });
            console.log(JSON.stringify(arrayTemp));
            //$("#searchHealthList").typeahead({ source: JSON.stringify(arrayTemp) });
            var typeahead = $('#searchHealthList').data('typeahead');
            typeahead.source = arrayTemp;
        }, 'json');
    });*/
    $.get('http://localhost:49552/ServiceControl/GetHpService.svc/getProvinceList', function (data) {
        var arr = JSON.parse(data);
        $.each(arr, function (i, item) {
            $('#provinceDD').append($('<option>', {
                value: item.provinceID,
                text: item.provinceDes
            }));
        });
    });

    $.get('http://localhost:49552/ServiceControl/GetHpService.svc/getCityListFromProvince?provinceID=81', function (data) {
        var arr = JSON.parse(data);
        var firstcityID = arr[0].cityID;
        $.each(arr, function (i, item) {
            $('#cityDD').append($('<option>', {
                value: item.cityID,
                text: item.cityDes
            }));
        });
        bindHostFromCity(firstcityID);
    });


});

function removeOptions(dropdownList) {
    var i;
    if (dropdownList.length == 0) {
        return;
    }
    for (i = dropdownList.length - 1; i >= 0; i--) {
        dropdownList.remove(i);
    }
}

function bindCity(provinceID) {
    $('#cityDD option[value!="0"]').remove();
    $.ajax({
        url: "http://localhost:49552/ServiceControl/GetHpService.svc/getCityListFromProvince?provinceID=" + provinceID,
        dataType: 'jsonp',
        success: function (msg) {
            var arr = JSON.parse(msg);
            var firstcityID = arr[0].cityID;
            $.each(arr, function (i, item) {
                $('#cityDD').append($('<option>', {
                    value: item.cityID,
                    text: item.cityDes
                }));
            });
            //===================
            bindHostFromCity(firstcityID);
            //===================
        }
    });
}

function bindHostFromCity(cityID) {
    $('#hostHospitalList option[value!="0"]').remove();
    $('#localList option[value!="0"]').remove();
    $('#localList').append($('<option>', {
        value: "00",
        text: "ไม่มีองค์กรปกครองส่วนท้องถิ่นดูแล"
    }));
    $('#hostHospitalList').append($('<option>', {
        value: "00",
        text: "ไม่มีสถานพยาบาลดูแล"
    }));
    $.ajax({
        url: "http://localhost:49552/ServiceControl/GetHpService.svc/getHostFromCity?cityCode=" + cityID + "&src=04",
        dataType: 'jsonp',
        success: function (msg) {
            var arr = JSON.parse(msg);
            $.each(arr, function (i, item) {
                $('#localList').append($('<option>', {
                    value: item.hostID,
                    text: item.hostName
                }));
            });
            $.ajax({
                url: "http://localhost:49552/ServiceControl/GetHpService.svc/getHostFromCity?cityCode=" + cityID + "&src=01",
                dataType: 'jsonp',
                success: function (msg) {
                    var arr = JSON.parse(msg);
                    $.each(arr, function (i, item) {
                        $('#hostHospitalList').append($('<option>', {
                            value: item.hostID,
                            text: item.hostName
                        }));
                    });
                }
            });
        }
    });
    //================================
}




function insertMainMethod(event) {
    if ($('#myexcel').val() != "" && $('#localList').val() != "") {
        alasql('SELECT * FROM FILE(?,{headers:true})', [event], function (data) {
            //Import Function-----
            completeInsert = 0;
            errorInsert = 0;
            $('.continueloading').show();
            $('.completeloading').hide();
            var arrayTemp = new Array;
            var errorArray = new Array;
            var errorCount = 0;
            for (var i = 0; i < data.length ; i++) {
                var age = 0;
                Object.getOwnPropertyNames(data[i]).forEach(function (val, idx, array) {
                    if (val == "อายุ(ปี)") {
                        age = data[i][val];
                    }
                });
                var agelimited = 0
                if ($('#filterAge').prop('checked', true)) {
                    agelimited = 59;
                }
                //console.log(i);
                if (changeToNull(data[i].เลขที่บัตรประชาชน) != null && age > agelimited) {
                    var object = new Object();
                    var val = validationCID(data[i].เลขที่บัตรประชาชน.toString())
                    object.CID = data[i].เลขที่บัตรประชาชน.toString();
                    object.Title = data[i].คำนำหน้า;
                    object.FirstName = preProcessingFirstName(data[i].ชื่อ);
                    object.LastName = data[i].นามสกุล;
                    object.DOB = preProcessingTimeSeriesExcelToISODate(data[i].วันเกิด);
                    object.Gender = preProcessingGender(data[i].เพศ);
                    object.BloodType = "0000";
                    object.race = "0000";
                    object.religion = changeToNull(data[i].ศาสนา);
                    object.WeightPerson = 0;
                    object.HeightPerson = 0;
                    object.Mobile = null;
                    object.RecordStaffID = "jiyeon";
                    object.MariageStatus = changeToNull(data[i].สถานภาพสมรส);;
                    object.Occupation = changeToNull(data[i].อาชีพ);
                    object.IncomePerMonth = 0;
                    object.EducationLevel = changeToNull(data[i].ระดับการศึกษา);
                    object.HostID = $('#hostHospitalList').val();
                    object.HostID2 = $('#localList').val();
                    //-----------------------------------
                    object.censusHomeCode = null;
                    object.censusHouseNumber = changeToNull(data[i].บ้านเลขที่);
                    object.censusMooNumber = changeToNull(data[i].หมู่ที่);
                    object.censusAlley = null;
                    object.censusStreetName = null;
                    object.censusTumbon = changeToNull(data[i].ตำบล);
                    object.censusCity = changeToNull(data[i].อำเภอ);
                    object.censusProvince = changeToNull(data[i].จังหวัด);
                    object.censusPostCode = null;
                    object.validationCID = val;
                    object.ipaddress = ipAddress;
                    object.isInsert = 0;
                    object.existingWelfare = preProcessingExistingWelfare(data[i].รหัสสิทธิ);
                    arrayTemp.push(object);
                }
            }
            console.log(arrayTemp);
            sessionStorage.setItem("index", 0);
            $('.continueloading .result .com_load').html(0);
            $('.continueloading .result .com_all').html(arrayTemp.length);
            insertData(arrayTemp);
        });
    }
    else {
        alert("โปรดใส่ข้อมูลให้ครบครับ");
    }
}

function insertData(arrayTempInput) {
    var index = sessionStorage.getItem("index");
    $.ajax({
        url: "http://localhost:49552/ServiceControl/Service.svc/insertPersonTempHosXP?data=" + JSON.stringify(arrayTempInput[index]),
        dataType: 'jsonp',
        success: function (msg) {
            $('.continueloading .result .com_load').html((parseInt(index) + 1).toString());
            //var a = JSON.parse(msg);
            if (msg == "ERROR") {
                errorCount++;
            }
            insertData_Callback(arrayTempInput);
        },
        error: function (msg) {
            errorCount++;
            insertData_Callback(arrayTempInput);
        }
    });
}


function insertData_Callback(arrayTempInput) {
    var index = sessionStorage.getItem("index");
    index++;
    if (arrayTempInput.length > index) {
        sessionStorage.setItem("index", index);
        insertData(arrayTempInput);
    }
    else {
        $.ajax({
            url: "http://localhost:49552/ServiceControl/Service.svc/storedProcedureCall?ipAddress=" + ipAddress,
            dataType: 'jsonp',
            success: function (msg) {
                $('.continueloading').hide();
                $('.completeloading .result2 .error').html(errorCount.toString());
                $('.completeloading').show();
                return;
            },
            error: function (msg) {

            }
        });
    }
}

function changeToNull(value) {
    if (typeof value === "undefined") {
        return null;
    }
    else {
        return value;
    }
}


function preProcessingFirstName(firstName) {
    if (firstName.indexOf("(") == -1) {
        //not contain
        return firstName;
    }
    else {
        return firstName.split('(')[0];
    }
    return firstName;
}

function preProcessingGender(genderNumber) {
    if (genderNumber == "ชาย") {
        return "M";
    }
    else {
        return "F";
    }
}

function preProcessingTimeSeriesExcelToISODate(serial) {

    // var bb = serial.toString();
    // var arr = bb.split("/");
    // var date = new Date(arr[0], arr[1], arr[2]).toISOString();
    //console.log(date);
    // return date;

    //typeof serail == number

    if (serial < 0) {
        return null;
    }
    else {
        var utc_days = Math.floor(serial - 25569);
        var utc_value = utc_days * 86400;
        var date_info = new Date(utc_value * 1000);
        var fractional_day = serial - Math.floor(serial) + 0.0000001;
        var total_seconds = Math.floor(86400 * fractional_day);
        var seconds = total_seconds % 60;
        total_seconds -= seconds;
        var hours = Math.floor(total_seconds / (60 * 60));
        var minutes = Math.floor(total_seconds / 60) % 60;
        return new Date(date_info).toISOString();
    }
    //}
}

function calculateAge() {
    var utc_days = Math.floor(serial - 25569);
    var utc_value = utc_days * 86400;
    var date_info = new Date(utc_value * 1000);
    return
}

function preProcessingExistingWelfare(rightCode) {
    if (rightCode == "89") {
        return "0100";
    }
    else if (rightCode == "92") {
        return "4200";
    }
    else if (rightCode == "91") {
        return "1100";
    }
    else {
        return "9999";
    }
}


function validationCID(param) {
    var childID = param.toString();
    //console.log(childID);
    if (childID.length == 13) {
        var cal = ((parseInt(childID.charAt(0)) * 13) +
            (parseInt(childID.charAt(1)) * 12) +
            (parseInt(childID.charAt(2)) * 11) +
            (parseInt(childID.charAt(3)) * 10) +
            (parseInt(childID.charAt(4)) * 9) +
            (parseInt(childID.charAt(5)) * 8) +
            (parseInt(childID.charAt(6)) * 7) +
            (parseInt(childID.charAt(7)) * 6) +
            (parseInt(childID.charAt(8)) * 5) +
            (parseInt(childID.charAt(9)) * 4) +
            (parseInt(childID.charAt(10)) * 3) +
            (parseInt(childID.charAt(11)) * 2)) % 11;
        cal = 11 - cal;
        //console.log(cal);
        if (cal == 10) {
            cal = 0;
        }
        else if (cal == 11) {
            cal = 1;
        }
        //--------------------------
        if (cal == childID.charAt(12)) {
            return true;
        }
        else {
            return false;
        }
    }
    return false;
}



