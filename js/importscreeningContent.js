// sessionStorage -> section
// sessionStorage -> SCREENINGSECTIONNAME[1...6]=section name 1...6
// sessionStorage -> SCREENINGQA[1...6]=section name 1...6
// sessionStorage -> SCREENING_USER_DATA[1...6]
var data = [];
var hostID = '';
var staffNameID = [];
//var textconfig = 'http://localhost:49552/ServiceControl/Service.svc/';
var countPage = 0;
var statusFilter = 0;
var allPerson = 0;
var MaxDate = '';

$(document).ready(function () {
	
	    $('#recdate-input').datepicker({
        language: 'th-en',
        format: 'mm-dd-yyyy'
    });
    $('#recdate-input').focus().focus();
    $('.datepicker.datepicker-dropdown.dropdown-menu').css('width', '250px');
    $('.datepicker.datepicker-dropdown.dropdown-menu').click(function () {
        $(this).hide();
    });
	
hostID =	getCurrentHostID();
//loadStaff();

	 $.ajax({
				url: config_serviceEndPoint + 'getMaxDateScreening?text=&host='+ hostID+'&src=00',	
				dataType: 'jsonp',
				success: function (msg) {
					var data = jQuery.parseJSON(msg);
					MaxDate = data[0].MaxDate;
					
					    var maxDay = new Date(MaxDate);
					var maxdd = maxDay.getDate();
					var maxmm = maxDay.getMonth()+1;

					var maxyyyy = maxDay.getFullYear();
					if(maxdd<10){
						maxdd='0'+maxdd
					} 
					if(maxmm<10){
						maxmm='0'+maxmm
					} 
					var thismax = maxmm+'-'+maxdd+'-'+maxyyyy;
					
					MaxDate = thismax;
					
					$('#ButtonLast').text('แสดงข้อมูลการบันทึกครั้งสุดท้ายวันที่ : '+thismax);
					},
				error: function (request, status, error) {
					return;
				}
					});

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1;

    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd
    } 
    if(mm<10){
        mm='0'+mm
    } 
    var today = mm+'-'+dd+'-'+yyyy;
document.getElementById('recdate-input').value = today;

			$.ajax({
				url: config_serviceEndPoint + 'getNumPerson?text=&host='+ hostID+'&village=&src=00',	
				dataType: 'jsonp',
				success: function (msg) {
					var data = jQuery.parseJSON(msg);
					allPerson = data[0].countAll;
					$('#lblAllperson').text('จำนวนผู้สูงอายุทั้งหมด  '+allPerson +' คน');
					
					getdata();
				getVillage();
					
					},
				error: function (request, status, error) {
					return;
				}
					});

});

function getVillagePersonMaxDate(){
	countPage = 0;
	document.getElementById('recdate-input').value = MaxDate;
	getdata();
	getVillage();
}

function getVillagePerson(){
	

	if(document.getElementById('recdate-input').value == '')
	{
		alert('กรุณาเลือกวันที่ก่อน');
	}
	else if(moment(document.getElementById('recdate-input').value,'MM/DD/YYYY').diff(moment(MaxDate), 'days') <0){
		alert('กรุณาเลือกวันที่หลังการบันทึกครั้งสุดท้าย');
	}
	else
	{		
		countPage = 0;
			var pagrStart;
		if(countPage!=0)
		{
		 pagrStart = (countPage*15);
		}
		else
		{
		pagrStart = 0;
		}
		var villageList = document.getElementById("VillageList");
		var vilID = villageList.options[villageList.selectedIndex].value;
		
				 $.ajax({
				url: config_serviceEndPoint + 'getNumPerson?text=&host='+ hostID+'&village='+vilID+'&src=00',	
				dataType: 'jsonp',
				success: function (msg) {
					var data = jQuery.parseJSON(msg);
					allPerson = data[0].countAll;
					$('#lblAllperson').text('จำนวนผู้สูงอายุทั้งหมด  '+allPerson +' คน');
					
		if(vilID != ''){
			statusFilter = 1;
		 $.ajax({
				url: config_serviceEndPoint + 'getSearchDatePersonJson?text=&host='+ hostID+'&village='+vilID+'&date='+document.getElementById('recdate-input').value+'&offset='+pagrStart+'&next=15',	
				dataType: 'jsonp',
				success: function (msg) {
					var outdata = [];
					for (var i in msg.data) {
						
						var item = msg.data[i];
											if(item.CID){
												
												var yearnow = new Date().getFullYear();
												var yearoldman = new Date(item.DOB).getFullYear();
						var diff = new Date - new Date(item.DOB);
						var diffdays = diff / 1000 / (60 * 60 * 24);
						var age = Math.floor(diffdays / 365.25);
						outdata.push({
							"0": item.CID,
							"1": item.firstname + ' ' +item.lastname,
							"2": age,
							"3": item.point,
							"4": findStaffName(item.staff),
							"5": "",
						});
						}
						
					}
					loadStaff(outdata);
					
				if(Number(countPage+1)< Math.ceil(Number(allPerson/15)))
				{
					$('#button-assessment-next').show();
					$('#panel-button').css('width', '350');
				}
				else
				{
					$('#button-assessment-next').hide();
					$('#panel-button').css('width', '150');
				}
				
				if(countPage==0)
				{
					$('#button-assessment-prev').hide();
					$('#panel-button').css('width', '150');
				}
				else
				{
					$('#button-assessment-prev').show();
				}
				$('#pageIndexNow').text('หน้า '+Number(countPage+1)+' จาก '+Math.ceil(Number(allPerson/15))+' หน้า');
				
				},
				error: function (request, status, error) {
					return;
				}
			});
		}
		else{
			getdata();
			
		}
					
				},
				error: function (request, status, error) {
					return;
				}
			});
		
	}
}

function getVillage(){
	 $.ajax({
			url: config_serviceEndPoint + 'GetVillage?hostId='+ hostID+'&src=00',
			dataType: 'jsonp',
			success: function (msg) {
				  var data = jQuery.parseJSON(msg);
				var ddl = document.getElementById("VillageList");
				var option = document.createElement("option");
				option.text = '';
				option.value = '';
				ddl.add(option);
				  for (var i = 0; i < data.length; i++) {						  
				var option = document.createElement("option");
				option.text = data[i].VillageName;
				option.value = data[i].VillageID;
				ddl.add(option);
                }

			},
			error: function (request, status, error) {
				return;
			}
		});
	
}

function getdata(){
	var pagrStart;

	if(countPage!=0)
	{
	 pagrStart = (countPage*15);
	}
	else
	{
	pagrStart = 0;
	}
		   $.ajax({
			url: config_serviceEndPoint + 'getSearchDatePersonJson?text=&host='+ hostID+'&village=&date='+document.getElementById('recdate-input').value+'&offset='+pagrStart+'&next=15',
			dataType: 'jsonp',
			success: function (msg) {
				var outdata = [];
				for (var i in msg.data) {
					
					var item = msg.data[i];
										if(item.CID){
											
											var yearnow = new Date().getFullYear();
											var yearoldman = new Date(item.DOB).getFullYear();
					var diff = new Date - new Date(item.DOB);
					var diffdays = diff / 1000 / (60 * 60 * 24);
					var age = Math.floor(diffdays / 365.25);
					outdata.push({
						"0": item.CID,
						"1": item.firstname + ' ' +item.lastname,
						"2": age,
						"3": item.point,
						"4": findStaffName(item.staff),
						"5": "",
					});
					}
					
				}
				loadStaff(outdata);
				if(Number(countPage+1)< Math.ceil(Number(allPerson/15)))
				{
					$('#button-assessment-next').show();
					$('#panel-button').css('width', '350');
				}
				else
				{
					$('#button-assessment-next').hide();
					$('#panel-button').css('width', '150');
				}
				
				if(countPage==0)
				{
					$('#button-assessment-prev').hide();
					$('#panel-button').css('width', '150');
				}
				else
				{
					$('#button-assessment-prev').show();
				}
				$('#pageIndexNow').text('หน้า '+Number(countPage+1)+' จาก '+Math.ceil(Number(allPerson/15))+' หน้า');
			},
			error: function (request, status, error) {
				return;
			}
		});
	}

function screening(data,staff) {
    arrayData = data;
    var grayRenderer = function (instance, td, row, col, prop, value, cellProperties) {
        Handsontable.renderers.TextRenderer.apply(this, arguments);
		if(col==1){
			 $(td).css({
            background: '#EEE',
			textAlign: 'left'
        });
		
		}
		else{
        $(td).css({
            background: '#EEE'
        });
		}
    };
	
	 var greenRenderer = function (instance, td, row, col, prop, value, cellProperties) {
        Handsontable.renderers.TextRenderer.apply(this, arguments);
        $(td).css({
            background: '#7DF070',
			textAlign: 'right'
        });
    };
	
		 var blueRenderer = function (instance, td, row, col, prop, value, cellProperties) {
        Handsontable.renderers.TextRenderer.apply(this, arguments);
        $(td).css({
            background: '#5FA0FF',
			textAlign: 'right'
        });
    };
	
			 var yellowRenderer = function (instance, td, row, col, prop, value, cellProperties) {
        Handsontable.renderers.TextRenderer.apply(this, arguments);
        $(td).css({
            background: '#FFF557',
			textAlign: 'right'
        });
    };
	
		var whiteRenderer = function (instance, td, row, col, prop, value, cellProperties) {
        Handsontable.renderers.TextRenderer.apply(this, arguments);
        $(td).css({
            background: '#FFFFFF',
			textAlign: 'right'
        });
    };
	
	var redRenderer = function (instance, td, row, col, prop, value, cellProperties) {
        Handsontable.renderers.TextRenderer.apply(this, arguments);
        $(td).css({
            background: '#FA5858',
			textAlign: 'right'
        });
    };

    var timenow = Date.now();

    $("#dataTable").handsontable({
        data: arrayData,
        colWidths: [200, 280, 150, 140, 220],
        minRows: 0,
        minCols: 5,
        fixedRowsTop : 0,
        minSpareRows: 0,
        minSpareCols: 0,
        colHeaders: ['เลขประจำตัวประชาชน', 'ชื่อ - สกุล', 'อายุ','คะแนนการคัดกรอง','ผู้คัดกรอง', 'วันที่คัดกรอง'],
        currentRowClassName: 'currentRow',
        currentColClassName: 'currentCol',
        columns: [
    { type: 'text', readOnly: true, renderer: grayRenderer },
    { type: 'text', readOnly: true, renderer: grayRenderer },
    { type: 'numeric', readOnly: true, renderer: grayRenderer },
  //  {
  //      type: 'date',
   //     dateFormat: 'MM-DD-YYYY',
    //    correctFormat: true,
   //     defaultDate: timenow
    //},
     { type: 'numeric',  language: 'en' },
    { type: 'dropdown', source: staff }    ,
        ],
		cells: function (row, col, prop) {
		        try {

                    if (arrayData[row][3] >= 12 &&  arrayData[row][3]<= 20) {
								 if(col ==3){
                        this.renderer = greenRenderer;
								 }
                    }
					else if (arrayData[row][3] >= 5 &&  arrayData[row][3]<= 11) {
								 if(col ==3){
                        this.renderer = blueRenderer;
								 }
                    }
					else if (Number(arrayData[row][3]) >= 0 &&  arrayData[row][3]<= 4 && arrayData[row][3] !== '') {
								 if(col ==3){
                        this.renderer = yellowRenderer;
								 }
                    }
					else if (arrayData[row][3] >20 || arrayData[row][3] <0) {
								 if(col ==3){
                        this.renderer = redRenderer;
								 }
                    }
					else
					{
						 if(col ==3){
                        this.renderer = whiteRenderer;
								 }
					}

            }
            catch (err) { }
		
  }
    });
}


function loadStaff(outdata) {
    $.ajax({
			url: config_serviceEndPoint + 'GetStaff?hostId='+hostID+'&src=00',
			dataType: 'jsonp',
			success: function (msg) {
				
				  var data = jQuery.parseJSON(msg);
                var staffList = [''];
                for (var i = 0; i < data.length; i++) {
					var name = data[i].Firstname+' '+data[i].Lastname;
                    staffList.push(name);
                    var obj = new Object();
                    obj['id'] = data[i].Staff_id;
                    obj['name'] = name;
                    staffNameID.push(obj);
                }
				screening(outdata,staffList);
			},
			error: function (request, status, error) {
				return;
			}
		});
}

function findStaffID(StaffName) {
    for (var item in staffNameID) {
        if (staffNameID[item]['name'] == StaffName ) {
            return staffNameID[item]['id'];
        }
    }
    return '';
}

function findStaffName(StaffID) {
    for (var item in staffNameID) {
        if (staffNameID[item]['id'] == StaffID ) {
            return staffNameID[item]['name'];
        }
    }
    return '';
}

function saveScreeningResult () {
	
	var data = $("#dataTable").handsontable('getData');
    if ($('#ajaxLoadScreen') != null) {
		
	var countG1=0;
	var countG2=0;
	var countG3=0;
	var countall =0;
	    for (var i in data) {
			countall++;
			var item = data[i];
			if(item[3]>=12 && item[3]<=20){
				countG1++;
			
			}
			else if(item[3]>=5 && item[3]<=11){
				countG2++;
			
			}
			else if(Number(item[3])>=0 && item[3]<=4 && item[3] != ''){
				countG3++;
			
			}
		}
		
        var loader = '<div id="ajaxLoadScreen"  style="background: rgba(0, 0, 0, 0.7);"><center><div id="showSaveDiv" style="z-index: 10000000;background-color: #FFFFFF;margin-top: 250px;width: 60%" ></div></center></div>';
        $(loader).appendTo('body');
		document.getElementById('ajaxLoadScreen').style.opacity = 1;
		var $table = $("<table > ", { class: 'table table-condensed' });
  $table.append('<tr ><th colspan="2">สรุปจำนวนผู้สูงอายุจำแนกตามกลุ่ม    &nbsp&nbspจากทั้งหมด '+countall+'&nbsp&nbspคน  </th></tr>');
    $table.append('<tr ><th style="width: 60%">กลุ่มผู้สูงอายุ</th><th style="width: 40%">จำนวน</th></tr>');
	
		var $tr = $("<tr >")
                        .append($('<td>', { text: 'กลุ่มที่ 1 ช่วยเหลือตนเองได้' }))
                          .append($('<td>', { text: countG1+'  คน' }));
                $table.append($tr);
		var $tr = $("<tr >")
                        .append($('<td>', { text: 'กลุ่มที่ 2 ช่วยเหลือตนเองได้บ้าง ' }))
                          .append($('<td>', { text: countG2+'  คน' }));
                $table.append($tr);
		var $tr = $("<tr >")
                        .append($('<td>', { text: 'กลุ่มที่ 3 ต้องการความช่วยเหลือ' }))
                          .append($('<td>', { text: countG3+'  คน' }));
        $table.append($tr);
		
		  $table.append('<tr ><th colspan="2"><center><br><a id="button-assessment-save" onclick="saveData()" class="btn btn-primary" style="width: 150px;">ยืนยัน</a>&nbsp&nbsp<a id="button-assessment-save" onclick="exitsaveData()" class="btn btn-primary" style="width: 150px;">ยกเลิก</a>  </center></th></tr>');
		
		 $('#showSaveDiv').append($table);
    }     

}

function exitsaveData(){
	 $('#showSaveDiv').remove();
	 $('#ajaxLoadScreen').remove();
}

function saveData(){
	stopAjaxLoader();
	
    var data = $("#dataTable").handsontable('getData');
    var objout = {
    Data: []
};
    for (var i in data) {
        var item = data[i];
        if (item[0] != null  && item[3] != ''&& item[4] != '') {

            //var date = new Date(item[3]);
            objout.Data.push({
                "CID": item[0],
                "RecordDate": document.getElementById('recdate-input').value,
                "value": item[3],
                "Staff": findStaffID(item[4])
            });
        }
        
    }
	
	   $.ajax({
			url: config_serviceEndPoint + 'SaveScreeningList?text=&hostId='+ hostID+'&data='+JSON.stringify(objout),
			dataType: 'jsonp',
			success: function (msg) {
				  if (msg == 'success') {
                //$('#button-assessment-save').hide();
                bootbox.dialog({
                  message: 'บันทึกข้อมูลเสร็จสิ้น',
                  title: "ผลการคัดกรอง",
                  buttons: {
                    toScreening: {
                      label: "ตกลง",
                      className: "btn-primary"
                    }
                  }
                });
                stopAjaxLoader();
            }
			 stopAjaxLoader();
			},
			error: function (request, status, error) {
				
				stopAjaxLoader();

                return;
			}
		});
}

function button_assessment_next_click() {
	countPage++;
	
	if(statusFilter==0)
	{
		getdata();
	}
	else
	{
			var pagrStart;
	if(countPage!=0)
	{
	 pagrStart = (countPage*15);
	}
	else
	{
	pagrStart = 0;
	}
		 $.ajax({
			url: config_serviceEndPoint + 'getSearchDatePersonJson?text=&host='+ hostID+'&village='+vilID+'&date='+document.getElementById('recdate-input').value+'&offset='+pagrStart+'&next=15',	
			dataType: 'jsonp',
			success: function (msg) {
				var outdata = [];
				for (var i in msg.data) {
					
					var item = msg.data[i];
										if(item.CID){
											
											var yearnow = new Date().getFullYear();
											var yearoldman = new Date(item.DOB).getFullYear();
					var diff = new Date - new Date(item.DOB);
					var diffdays = diff / 1000 / (60 * 60 * 24);
					var age = Math.floor(diffdays / 365.25);
					outdata.push({
						"0": item.CID,
						"1": item.firstname + ' ' +item.lastname,
						"2": age,
						"3": "",
						"4": item.point,
						"5": findStaffName(item.staff),
					});
					}
				}
				loadStaff(outdata);
				if(Number(countPage+1)< Math.ceil(Number(allPerson/15)))
				{
					$('#button-assessment-next').show();
					$('#panel-button').css('width', '350');
				}
				else
				{
					$('#button-assessment-next').hide();
					$('#panel-button').css('width', '150');
				}
				
				if(countPage==0)
				{
					$('#button-assessment-prev').hide();
					$('#panel-button').css('width', '150');
				}
				else
				{
					$('#button-assessment-prev').show();
				}
				$('#pageIndexNow').text('หน้า '+Number(countPage+1)+' จาก '+Math.ceil(Number(allPerson/15))+' หน้า');
			},
			error: function (request, status, error) {
				return;
			}
		});
	}
}

function button_assessment_prev_click() {
	countPage--;
	
		if(statusFilter==0)
	{
		getdata();
	}
	else
	{
			var pagrStart;
	if(countPage!=0)
	{
	 pagrStart = (countPage*15);
	}
	else
	{
	pagrStart = 0;
	}
		 $.ajax({
			url: config_serviceEndPoint + 'getSearchDatePersonJson?text=&host='+ hostID+'&village='+vilID+'&date='+document.getElementById('recdate-input').value+'&offset='+pagrStart+'&next=15',	
			dataType: 'jsonp',
			success: function (msg) {
				var outdata = [];
				for (var i in msg.data) {
					
					var item = msg.data[i];
										if(item.CID){
											
											var yearnow = new Date().getFullYear();
											var yearoldman = new Date(item.DOB).getFullYear();
					var diff = new Date - new Date(item.DOB);
					var diffdays = diff / 1000 / (60 * 60 * 24);
					var age = Math.floor(diffdays / 365.25);
					outdata.push({
						"0": item.CID,
						"1": item.firstname + ' ' +item.lastname,
						"2": age,
						"3": "",
						"4": item.point,
						"5": findStaffName(item.staff),
					});
					}
				}
				loadStaff(outdata);
				if(Number(countPage+1)< Math.ceil(Number(allPerson/15)))
				{
					$('#button-assessment-next').show();
					$('#panel-button').css('width', '350');
				}
				else
				{
					$('#button-assessment-next').hide();
					$('#panel-button').css('width', '150');
				}
				
				if(countPage==0)
				{
					$('#button-assessment-prev').hide();
					$('#panel-button').css('width', '150');
				}
				else
				{
					$('#button-assessment-prev').show();
				}
				
				$('#pageIndexNow').text('หน้า '+Number(countPage+1)+' จาก '+Math.ceil(Number(allPerson/15))+' หน้า');
			},
			error: function (request, status, error) {
				return;
			}
		});
	}
}