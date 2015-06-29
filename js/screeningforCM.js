function screening(data) {
    arrayData = data;
    var grayRenderer = function (instance, td, row, col, prop, value, cellProperties) {
        Handsontable.renderers.TextRenderer.apply(this, arguments);
        $(td).css({
            background: '#EEE'
        });
    };

    var timenow = Date.now();

    $("#dataTable").handsontable({
        data: arrayData,
        colWidths: [200, 300, 100, 140, 160, 120],
        minRows: 20,
        minCols: 6,
        minSpareRows: 1,
        minSpareCols: 0,
        colHeaders: ['เลขประจำตัวประชาชน', 'ชื่อ - สกุล', 'อายุ', 'วันที่คัดกรอง','คะแนนการคัดกรอง','ผู้คัดกรอง'],
        currentRowClassName: 'currentRow',
        currentColClassName: 'currentCol',
        columns: [
    { type: 'text', readOnly: true, renderer: grayRenderer },
    { type: 'text', readOnly: true, renderer: grayRenderer },
    { type: 'numeric', readOnly: true, renderer: grayRenderer },
    {
        type: 'date',
        dateFormat: 'MM/DD/YYYY',
        correctFormat: true,
        defaultDate: timenow
    },
     { type: 'numeric', format: '0.00', language: 'en' },
    { type: 'text', readOnly: true, renderer: grayRenderer }    ,
        ]
    });
}

function getdata() {
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/api/People?filter=%7B%22where%22%3A%7B%22HostID%22%3A%22" + "HST1000000" + "%22%7D%7D",
        data: "{}",
        // data: null,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {

            var outdata = [];

            for (var i in msg) {

                var item = msg[i];
                var diff = new Date - new Date(item.DOB);
                var diffdays = diff / 1000 / (60 * 60 * 24);
                var age = Math.floor(diffdays / 365.25);
                outdata.push({
                    "0": item.CID,
                    "1": item.FirstName + ' ' +item.LastName,
                    "2": age,
                    "3": "",
                    "4": "",
                    "5": "",
                });
            }

            screening(outdata);
        }
    });
}


function savedata() {
    var data = $("#dataTable").handsontable('getData');
    var objout = [];
    for (var i in data) {
        var item = data[i];
        if (item[0] != null && item[3] != '' && item[4] != '') {

            var date = new Date(item[3]);
            objout.push({
                "CID": item[0],
                "FID": "00001",
                "name": "แบบคัดกรองเพื่อจำแนกกลุ่มผู้สูงอายุตามศักยภาพ",
                "recordDate": date.toISOString(),
                "value": item[4],
                "template": false,
                "part": [
                       {
                           "qtid": "00033",
                           "value": item[4],
                           "name": "แบบคัดกรองเพื่อจำแนกกลุ่มผู้สูงอายุตามศักยภาพ"
                       }
                ],
                "testinsert": true

            });
        }
        
    }
    $.ajax({
        type: "POST",
        url: "http://localhost:3000/api/FormTemplates",
        data: JSON.stringify(objout),
        // data: null,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            alert('success');
        },
        error: function (msg) {
            alert('error');
        }
    });


}