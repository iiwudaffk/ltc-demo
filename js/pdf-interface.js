// PAGE SETTINGS
var DEFAULT_FONT_SIZE = 14;
var INDENT_LEFT = 20;
var INDENT_RIGHT = 20;
var LINE_SPACING = 8;

var font = {
	   THSarabun : {
	     normal : 'THSarabun.ttf',
	     bold : 'THSarabunBold.ttf'
	   }
	};
// END PAGE SETTINGS

var header = '';
var type = '';
function getReportData (type) {
	startAjaxLoader();
    switch (type){
        case 'SCREENING' :
            ajaxCrossDomainGet(config_serviceEndPoint+ 'GetListPersonReportCategory?HostID=' + getCurrentHostID() +'&category=screening&result&offset=0&next=99999&src=00&complete=yes', createPDF_screened);
            break;
        case 'SCREENING_INCOMPLETE' :
            header = 'ผู้รับบริการที่ยังไม่ได้รับการคัดกรอง';
            type = 'screening-incomplete';
            ajaxCrossDomainGet(config_serviceEndPoint+ 'GetListPersonReportCategory?HostID=' + getCurrentHostID() +'&category=screening&result&offset=0&next=99999&src=00&complete=no', createPDF_simple);
            break;
        case 'ASSESSMENT' :
            ajaxCrossDomainGet(config_serviceEndPoint+ 'GetListPersonReportCategory?HostID=' + getCurrentHostID() +'&category=assessment&result&offset=0&next=99999&src=00&complete=yes', createPDF_assessed);
            break;
        case 'ASSESSMENT_INCOMPLETE' :
            header = 'ผู้รับบริการที่ยังไม่ได้รับการประเมิน';
            type = 'assessment-incomplete';
            ajaxCrossDomainGet(config_serviceEndPoint+ 'GetListPersonReportCategory?HostID=' + getCurrentHostID() +'&category=assessment&result&offset=0&next=99999&src=00&complete=no', createPDF_simple);
            break;
        case 'CARE_AGREEMENT' :
            ajaxCrossDomainGet(config_serviceEndPoint+ 'GetCareAgreement2?cid=' + getCurrentCID() +'&CmPlanNo=' + sessionStorage.getItem("CM_PLANNO"), createPDF_CareAgreement);
            break;
        case 'NEED' :
            header = 'ผู้รับบริการที่ได้รับการประเมินความต้องการ';
            type = 'need';
            ajaxCrossDomainGet(config_serviceEndPoint+ 'GetListPersonReportCategory?HostID=' + getCurrentHostID() +'&category=need&result&offset=0&next=99999&src=00&complete=yes', createPDF_simple);
            break;
        case 'NEED_INCOMPLETE' :
             header = 'ผู้รับบริการที่ยังไม่ได้รับการประเมินความต้องการ';
            type = 'need-incomplete';
            ajaxCrossDomainGet(config_serviceEndPoint+ 'GetListPersonReportCategory?HostID=' + getCurrentHostID() +'&category=need&result&offset=0&next=99999&src=00&complete=no', createPDF_simple);
            break;
        case 'PLAN' :
            header = 'ผู้รับบริการทั้ได้รับการวางแผนบริการ';
            type = 'planning';
            ajaxCrossDomainGet(config_serviceEndPoint+ 'GetListPersonReportCategory?HostID=' + getCurrentHostID() +'&category=plan&result&offset=0&next=99999&src=00&complete=yes', createPDF_simple);
            break;
        case 'PLAN_INCOMPLETE' :
            header = 'ผู้รับบริการที่ยังไม่ได้รับการวางแผนบริการ';
            type = 'planning-incomplete';
            ajaxCrossDomainGet(config_serviceEndPoint+ 'GetListPersonReportCategory?HostID=' + getCurrentHostID() +'&category=plan&result&offset=0&next=99999&src=00&complete=no', createPDF_simple);
            break;
        case 'OPT':
            var hostList = [];
            hostList.push(getCurrentHostID());
            
            ajaxCrossDomainGet(config_serviceEndPoint + 'getLocalDataPrintOut2?startDate=' + sessionStorage.getItem('OPT_REPORT_START_DATE') + '&endDate=' + sessionStorage.getItem('OPT_REPORT_END_DATE') + '&hostList=' + encodeURIComponent(JSON.stringify(hostList)), createPDF_OPT);
            stopAjaxLoader();
            break;
        default :
            break;
    }
    sessionStorage.removeItem('PDF_TYPE');
}

function createPDF_OPT (msg) {
    var data = JSON.parse(msg);
    console.log(data);
    var docDefinition = {
			pageMargins: [20, 90, 20, 70], // left, top, right, bottom
            pageOrientation: 'landscape',
            pageSize : 'A4',
	 		header: {
				image: 'nhso_logo',
				width: 200				       
		    },
		    footer: {
	 			columns: [
					{
						image: 'nu_logo',
						width: 200,
						alignment : 'center'
					}								
				]	
		    },		    
	 		content: [
                			             
			], // END CONTENT
			defaultStyle: {
				font: 'THSarabun',
				fontSize : DEFAULT_FONT_SIZE
			},
			styles : {
				header : {
					bold : true,
					fontSize : DEFAULT_FONT_SIZE + 2
				},
				subheader : {
					bold : true,
					fontSize : DEFAULT_FONT_SIZE
				}
			},
			images : {
				nu_logo : base64_nu_logo,
				nhso_logo : base64_nhso_logo,
				avatar : base64_avatar
				// map : base64_map
			}
 		};
    
    for (var i = 0; i < data['data']['hostList'].length; i++){
        docDefinition['content'].push ( 
        {
            text : 'รายงานสรุปกิจกรรมผู้สูงอายุสำหรับ ' + data['data']['hostList'][i]['hostName'],
            style : 'header',
            alignment : 'center'
        });
        // สรุปแผนกิจกรรม
        docDefinition['content'].push (
        {
            text : '1.สรุปแผนกิจกรรมสำหรับ ' + data['data']['hostList'][i]['hostName'],
            style : 'subheader',
            decoration : 'underline',
            margin : [INDENT_LEFT, LINE_SPACING, 0, 0]            
        });
        
        var  table1 = [];
        table1.push ([
            {
			text : 'ชื่อกิจกรรม',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
		{
			text : 'จำนวนคน',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		}
        ]);
        
        if (data['data']['hostList'][i]['data1'].length > 0) {
            for (var k = 0; k < data['data']['hostList'][i]['data1'].length; k++ ){  
            table1.push([ 
                {
                    text : data['data']['hostList'][i]['data1'][k]['svcName'],
                    colSpan : 2,
                    bold : true
                },
                {
                }
            ]);
            for (var j = 0; j < data['data']['hostList'][i]['data1'][k]['act'].length; j++){
                table1.push([ '\b\b ' +data['data']['hostList'][i]['data1'][k]['act'][j]['actName'],{ text : data['data']['hostList'][i]['data1'][k]['act'][j]['countPerson'], alignment : 'center' } ]);
            }
        }
        } else {
            table1.push([ { text : data['data']['hostList'][i]['data1'][k]['svcName'], colSpan : 2, bold : true }, {} ]);
        }
        
        docDefinition['content'].push(
        {
            margin : [INDENT_LEFT, LINE_SPACING, INDENT_RIGHT, 0], 
            table: {
                widths : [620, 120],
                headerRows: 1,
                body: table1
            }
        });
        
        //ปรับสภาพบ้าน
        docDefinition['content'].push (
        {
            text : '2.ผู้สูงอายุที่ต้องการปรับสภาพบ้าน',
            style : 'subheader',
            decoration : 'underline',
            margin : [INDENT_LEFT, LINE_SPACING, 0, 0]            
        });
        
        var table2 = [];
        table2.push ([
            {
			text : 'เลขประจำตัวประชาชน',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
		{
			text : 'ชื่อ-นามสกุล',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
        {
			text : 'ที่อยู่',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
        {
			text : 'บริการที่ควรได้รับ',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		}
        ]);
        if ( data['data']['hostList'][i]['data2'][0].length > 0 ) {
            for (var j = 0; j < data['data']['hostList'][i]['data2'][0].length; j++){
                table2.push ([ { text :'' + data['data']['hostList'][i]['data2'][0][j]['cid'], alignment : 'center'}, data['data']['hostList'][i]['data2'][0][j]['name'],  data['data']['hostList'][i]['data2'][0][j]['address'], data['data']['hostList'][i]['data2'][0]['listperson'][j]['activity']]);
            }
        } else {
            table2.push ([ { text : 'ไม่มี', colSpan : 4, bold : true, alignment : 'center' }, {}, {}, {}]);
        }
        
        docDefinition['content'].push(
        {
            margin : [INDENT_LEFT, LINE_SPACING, INDENT_RIGHT, 0], 
            table: {
                widths : [120, 170, 250, 180],
                headerRows: 1,
                body: table2
            }
        });   
        
        //ปัจจัยสี่
        docDefinition['content'].push (
        {
            text : '3.ผู้สูงอายุที่ต้องการปัจจัยสี่',
            style : 'subheader',
            decoration : 'underline',
            margin : [INDENT_LEFT, LINE_SPACING, 0, 0]            
        });
        
        var table3 = [];
        table3.push ([
            {
			text : 'เลขประจำตัวประชาชน',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
		{
			text : 'ชื่อ-นามสกุล',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
        {
			text : 'ที่อยู่',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
        {
			text : 'บริการที่ควรได้รับ',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		}
        ]);
        
        if ( data['data']['hostList'][i]['data2'][1].length > 0 ) {
            for (var j = 0; j < data['data']['hostList'][i]['data2'][1].length; j++){
                table3.push ([ { text :'' + data['data']['hostList'][i]['data2'][1][j]['cid'], alignment : 'center' } , data['data']['hostList'][i]['data2'][1][j]['name'],  data['data']['hostList'][i]['data2'][1][j]['address'], data['data']['hostList'][i]['data2'][1]['listperson'][j]['activity']]);
            }
        } else {
            table3.push ([ { text : 'ไม่มี', colSpan : 4, bold : true, alignment : 'center' }, {}, {}, {}]);
        }
        
        docDefinition['content'].push(
        {
            margin : [INDENT_LEFT, LINE_SPACING, INDENT_RIGHT, 0], 
            table: {
                widths : [120, 170, 250, 180],
                headerRows: 1,
                body: table3
            }
        });  
        
        //บริการส่งต่อ
        docDefinition['content'].push (
        {
            text : '4.ผู้สูงอายุที่ต้องการบริการส่งต่อ',
            style : 'subheader',
            decoration : 'underline',
            margin : [INDENT_LEFT, LINE_SPACING, 0, 0]            
        });
        
        var table4 = [];
        table4.push ([
            {
			text : 'เลขประจำตัวประชาชน',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
		{
			text : 'ชื่อ-นามสกุล',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
        {
			text : 'ที่อยู่',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		}
        ]);
        
        if ( data['data']['hostList'][i]['data3'][2].length > 0 ) {
            for (var j = 0; j < data['data']['hostList'][i]['data3'][2].length; j++){
                table4.push ([ { text :'' + data['data']['hostList'][i]['data2'][2][j]['cid'], alignment : 'center' } , data['data']['hostList'][i]['data2'][2][j]['name'],  data['data']['hostList'][i]['data2'][2][j]['address'] ]);
            }
        } else {
            table4.push ([ { text : 'ไม่มี', colSpan : 3, bold : true, alignment : 'center' }, {}, {}]);
        }
        
        docDefinition['content'].push(
        {
            margin : [INDENT_LEFT, LINE_SPACING, INDENT_RIGHT, 0], 
            table: {
                widths : [100, 130, 500 ],
                headerRows: 1,
                body: table4
            }
        });  
        
        //วัสดุ
        docDefinition['content'].push (
        {
            text : '5.แผนการเงินสำหรับการเบิกวัสดุเพื่อการดูแลผู้สูงอายุ',
            style : 'subheader',
            decoration : 'underline',
            margin : [INDENT_LEFT, LINE_SPACING, 0, 0]            
        });
        
        var table5 = [];
        table5.push ([
            {
			text : 'ชื่อวัสดุ',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
        {
			text : 'จำนวน',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		}
        ]);
        
        if (data['data']['hostList'][i]['data3'].length > 0) {
            for (var j = 0; j < data['data']['hostList'][i]['data3'].length; j++){
                table5.push ([ data['data']['hostList'][i]['data3'][j]['materialname'] ,{ text : '' + data['data']['hostList'][i]['data3'][j]['count'], alignment: 'center' } ]);
            }
        } else {
            table5.push([ { text : 'ไม่มี', colSpan : 2, bold : true, alignment : 'center' }, {} ]);
        }
        
        docDefinition['content'].push(
        {
            margin : [INDENT_LEFT, LINE_SPACING, INDENT_RIGHT, 0], 
            table: {
                widths : [620, 120],
                headerRows: 1,
                body: table5
            },
            pageBreak : 'after'
        });
    }
    
    console.log(docDefinition);
    pdfMake.fonts = font; 		
 		pdfMake.createPdf(docDefinition).download('tempOPT');
    /*
 		pdfMake.createPdf(docDefinition).getBase64(function (base64) {
			$('iframe').attr('src', "data:application/pdf;base64," + base64);
		});
    */
    stopAjaxLoader();
    
}

function createPDF_screeningIncomplete(msg) {
    var data = JSON.parse(msg);
    
    var PERSON_LIST = [];
	PERSON_LIST.push([
		{
			text : 'ลำดับที่',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
		{
			text : 'เลขประจำตัวประชาชน',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
        {
			text : 'ชื่อ - นามสกุล',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		}
		]);
    
    var person_list = data['data']['personlist']; 
    for (var i = 0; i < person_list.length; i++){
        PERSON_LIST.push ([
            {  
                text:  String(1 + i) + '.',
                alignment : 'center'
            },
            {
                text : person_list[i]['cid'],
                alignment : 'center'
            },
            person_list[i]['title']+person_list[i]['firstname'] + ' ' + person_list[i]['lastname']
            ]);
    }
    
    var docDefinition = {
			pageMargins: [20, 90, 20, 70], // left, top, right, bottom
	 		header: {			
				image: 'nhso_logo',
				width: 200				       
		    },
		    footer: {	        
	 			columns: [
					{
						image: 'nu_logo',
						width: 200,
						alignment : 'center'
					}								
				]	
		    },		    
	 		content: [
				{
					text: 'รายชื่อผู้รับบริการที่ยังไม่ได้รับการคัดกรอง',
					style : 'header',
					alignment : 'center',
					margin : [0, LINE_SPACING, 0, 0]
				},	
                {
                    margin : [INDENT_LEFT, LINE_SPACING, INDENT_RIGHT, 0], 
	 				table: {
						widths : [50, 100, '*'],
						headerRows: 1,
						body: PERSON_LIST
					}									
				}
				             
			], // END CONTENT
			defaultStyle: {
				font: 'THSarabun',
				fontSize : DEFAULT_FONT_SIZE
			},
			styles : {
				header : {
					bold : true,
					fontSize : DEFAULT_FONT_SIZE + 2
				},
				subheader : {
					bold : true,
					fontSize : DEFAULT_FONT_SIZE
				}
			},
			images : {
				nu_logo : base64_nu_logo,
				nhso_logo : base64_nhso_logo,
				avatar : base64_avatar
				// map : base64_map
			}
 		};

 		pdfMake.fonts = font; 		
 		// pdfMake.createPdf(docDefinition).open();
 		pdfMake.createPdf(docDefinition).download('screening-incomplete-2015');
    
        stopAjaxLoader();
}

function createPDF_screened (msg) {
    var data = JSON.parse(msg);
    
    var PERSON_LIST = [];
	PERSON_LIST.push([
		{
			text : 'ลำดับที่',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
		{
			text : 'เลขประจำตัวประชาชน',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
        {
			text : 'ชื่อ - นามสกุล',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
		{
			text : 'ผลการคัดกรอง',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		}
		]);
    // console.log(JSON.stringify(data));
    var person_list = data['data']['personlist']; 
    for (var i = 0; i < person_list.length; i++){
        if ( i > 975) {
            //console.log(JSON.stringify(person_list[i]));
        }
        PERSON_LIST.push ([
            {  
                text:  '' + String(1 + i) + '.',
                alignment : 'center'
            },
            {
                text : '' + person_list[i]['cid'],
                alignment : 'center'
            },
            person_list[i]['title']+person_list[i]['firstname'] + ' ' + person_list[i]['lastname'],
            {
                text : 'กลุ่มที่ ' + person_list[i]['result'][0],
                alignment : 'center'
            } ]);
    }
    
    var docDefinition = {
			pageMargins: [20, 90, 20, 70], // left, top, right, bottom
	 		header: {
				image: 'nhso_logo',
				width: 200				       
		    },
		    footer: {
	 			columns: [
					{
						image: 'nu_logo',
						width: 200,
						alignment : 'center'
					}								
				]	
		    },		    
	 		content: [
				{
					text: 'รายชื่อผู้รับบริการที่ได้รับการคัดกรอง',
					style : 'header',
					alignment : 'center',
					margin : [0, LINE_SPACING, 0, 0]
				},	
                {
                    margin : [INDENT_LEFT, LINE_SPACING, INDENT_RIGHT, 0], 
	 				table: {
						widths : [50, 100, '*', 100],
						headerRows: 1,
						body: PERSON_LIST
					}									
				}
				             
			], // END CONTENT
			defaultStyle: {
				font: 'THSarabun',
				fontSize : DEFAULT_FONT_SIZE
			},
			styles : {
				header : {
					bold : true,
					fontSize : DEFAULT_FONT_SIZE + 2
				},
				subheader : {
					bold : true,
					fontSize : DEFAULT_FONT_SIZE
				}
			},
			images : {
				nu_logo : base64_nu_logo,
				nhso_logo : base64_nhso_logo,
				avatar : base64_avatar
				// map : base64_map
			}
 		};

 		pdfMake.fonts = font; 		
 		pdfMake.createPdf(docDefinition).download('screening-2015');
    /*
 		pdfMake.createPdf(docDefinition).getBase64(function (base64) {
			$('iframe').attr('src', "data:application/pdf;base64," + base64);
		});
*/
        stopAjaxLoader();
    
}

function createPDF_simple (msg) {
    var data = JSON.parse(msg);
    console.log(data);
    var PERSON_LIST = [];
	PERSON_LIST.push([
		{
			text : 'ลำดับที่',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
		{
			text : 'เลขประจำตัวประชาชน',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
        {
			text : 'ชื่อ - นามสกุล',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		}
		]);
    
    var person_list = data['data']['personlist']; 
    for (var i = 0; i < person_list.length; i++){
        PERSON_LIST.push ([
            {  
                text:  String(1 + i) + '.',
                alignment : 'center'
            },
            {
                text : person_list[i]['cid'],
                alignment : 'center'
            },
            person_list[i]['title']+person_list[i]['firstname'] + ' ' + person_list[i]['lastname']
            ]);
    }
    
    var docDefinition = {
			pageMargins: [20, 90, 20, 70], // left, top, right, bottom
	 		header: {
				image: 'nhso_logo',
				width: 200				       
		    },
		    footer: {
	 			columns: [
					{
						image: 'nu_logo',
						width: 200,
						alignment : 'center'
					}								
				]	
		    },		    
	 		content: [
				{
					text: header,
					style : 'header',
					alignment : 'center',
					margin : [0, LINE_SPACING, 0, 0]
				},	
                {
                    margin : [INDENT_LEFT, LINE_SPACING, INDENT_RIGHT, 0], 
	 				table: {
						widths : [50, 100, '*'],
						headerRows: 1,
						body: PERSON_LIST
					}									
				}
				             
			], // END CONTENT
			defaultStyle: {
				font: 'THSarabun',
				fontSize : DEFAULT_FONT_SIZE
			},
			styles : {
				header : {
					bold : true,
					fontSize : DEFAULT_FONT_SIZE + 2
				},
				subheader : {
					bold : true,
					fontSize : DEFAULT_FONT_SIZE
				}
			},
			images : {
				nu_logo : base64_nu_logo,
				nhso_logo : base64_nhso_logo,
				avatar : base64_avatar
				// map : base64_map
			}
 		};

 		pdfMake.fonts = font; 		
 		pdfMake.createPdf(docDefinition).download(type + '-2015');
    /*
 		pdfMake.createPdf(docDefinition).getBase64(function (base64) {
			$('iframe').attr('src', "data:application/pdf;base64," + base64);
		});
    */
        stopAjaxLoader();
}

function createPDF_assessed (msg) {
    data = JSON.parse(msg);
    console.log(JSON.stringify(data));
    
    var PERSON_LIST = [];
	PERSON_LIST.push([
		{
			text : 'ลำดับที่',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
		{
			text : 'เลขประจำตัวประชาชน',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
        {
			text : 'ชื่อ - นามสกุล',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},		
        {
			text : 'ด้านที่ 1',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
        {
			text : 'ด้านที่ 2',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
        {
			text : 'ด้านที่ 3',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
        {
			text : 'ด้านที่ 4',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
        {
			text : 'ด้านที่ 5',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		}
		]);
    
    var person_list = data['data']['personlist']; 
    for (var i = 0; i < person_list.length; i++){
        var part1, part2, part3, part4, part5;
        
        PERSON_LIST.push ([
            {  
                text:  String(1 + i) + '.',
                alignment : 'center'
            },
            {
                text : person_list[i]['cid'],
                alignment : 'center'
            },
            person_list[i]['title']+person_list[i]['firstname'] + ' ' + person_list[i]['lastname'],
            {
                text : '' +person_list[i]['result'][0],
                alignment : 'center'
            },
            {
                text : '' +person_list[i]['result'][1],
                alignment : 'center'
            },
            {
                text : '' +person_list[i]['result'][2],
                alignment : 'center'
            },
            {
                text : '' +person_list[i]['result'][3],
                alignment : 'center'
            },
            {
                text : '' +person_list[i]['result'][4],
                alignment : 'center'
            }]);
    }
    
    var docDefinition = {
			pageMargins: [20, 90, 20, 70], // left, top, right, bottom
	 		header: {
				image: 'nhso_logo',
				width: 200				       
		    },
		    footer: {
	 			columns: [
					{
						image: 'nu_logo',
						width: 200,
						alignment : 'center'
					}								
				]	
		    },		    
	 		content: [
				{
					text: 'รายชื่อผู้รับบริการที่ได้รับการคัดกรอง',
					style : 'header',
					alignment : 'center',
					margin : [0, LINE_SPACING, 0, 0]
				},	
                {
                    margin : [INDENT_LEFT, LINE_SPACING, INDENT_RIGHT, 0], 
	 				table: {
						widths : [35, 85, '*', 40, 40, 40, 40, 40],
						headerRows: 1,
						body: PERSON_LIST
					}									
				}
				             
			], // END CONTENT
			defaultStyle: {
				font: 'THSarabun',
				fontSize : DEFAULT_FONT_SIZE
			},
			styles : {
				header : {
					bold : true,
					fontSize : DEFAULT_FONT_SIZE + 2
				},
				subheader : {
					bold : true,
					fontSize : DEFAULT_FONT_SIZE
				}
			},
			images : {
				nu_logo : base64_nu_logo,
				nhso_logo : base64_nhso_logo,
				avatar : base64_avatar
				// map : base64_map
			}
 		};
 		
 		pdfMake.fonts = font; 		
 		pdfMake.createPdf(docDefinition).download('assessment-2015');
    /*
 		pdfMake.createPdf(docDefinition).getBase64(function (base64) {
			
			$('iframe').attr('src', "data:application/pdf;base64," + base64);
			
		});
    */
        stopAjaxLoader();
		
}

function createPDF_CareAgreement (msg) {
    var data = JSON.parse(msg);
    console.log(data);
    
    var graph = data['data']['summary_assessment']['assessment_graph'];
    var graph_data = {};
    /*
    var label = [];
    for( var i = 0; i < graph.length; i++){
        label.push();
    }
    // PROFILE section
    
*/
    var profile = data['data']['profile'];
    var NAME = profile['title'] + profile['name_lastname'];
    var CID = profile['cid'];
    var DOB = profile['dob'];
    var AGE = profile['age'];
    var GENDER = profile['gender'];
    var MARRITAL_STATUS = profile['marrital_status'];
    var EDUCATION = profile['education'];
    var OCCUPATION = profile['occupation'];
    var INCOME_SELF = profile['income_self'];
    var INCOME_FAMILY = profile['income_family'];
    var TEL_NO = profile['telephone_self'];
    var ADDRESS_SELF = profile['address_self'];
    
    var FAMILY_MEMBER_COUNT = profile['family'].length;
        var FAMILY_MEMBER = [];
    for (var i = 0; i < profile['family'].length; i++){
        FAMILY_MEMBER.push ({ text : String(i + 1) + '.' + profile['family'][i]['relation'] + ' : ' + profile['family'][i]['name_lastname'] , margin : [ INDENT_LEFT, LINE_SPACING, 0, 0]});
	   FAMILY_MEMBER.push ({ text : 'เบอร์โทรศัพท์ที่สามารถติดต่อได้ : ' + profile['family'][i]['tel'] , margin : [ INDENT_LEFT + 10, LINE_SPACING, 0, 0]});
    }
    
    var CAREGIVER_NAME = '';
    var CAREGIVER_TEL = '';
    var CAREGIVER_RELATION = '';
    var CAREGIVER_CID = '';   
    if (profile['caregiver']){
        CAREGIVER_NAME = profile['caregiver']['name_lastname'];
        CAREGIVER_TEL = profile['caregiver']['tel'];
        CAREGIVER_RELATION = profile['caregiver']['relation'];
        CAREGIVER_CID = profile['caregiver']['cid'];    
    }
    
    profile = null;
    //end PROFILE section
    
    // WELFARE section
    var welfare = data['data']['service_welfare'];
    
    var HEALTH_RIGHTS = [];
    for (var i = 0; i < welfare['health']['right'].length; i++){
        HEALTH_RIGHTS.push ( { text : welfare['health']['right'][i] , margin : [INDENT_LEFT + 20, LINE_SPACING, 0, 0]});
    }
    	
    var PRIMARY_HEALTH_PROVIDER = welfare['health']['first_provider'];
    var SECONDARY_HEALTH_PROVIDER = welfare['health']['second_provider'];	
    
    var SOCIAL_RIGHTS = [];
    for (var i = 0; i < welfare['social']['right'].length; i++){
        SOCIAL_RIGHTS.push ( { text : welfare['social']['right'][i] , margin : [INDENT_LEFT + 20, LINE_SPACING, 0, 0]});
    }
    
    welfare = null;
    // end WELFARE section
    
    // SUMMARY_ASSESSMENT
    var summary = data['data']['summary_assessment'];
    console.log(summary);
	
    var LATEST_SCREENING_ID = data['data']['screening']['no'];
    var LATEST_SCREENING_DATE = data['data']['screening']['date_th'];
    var LATEST_ADL_GROUP = data['data']['screening']['result'];
    var LATEST_ADL_SCORE = data['data']['screening']['score'];

    var CURRENT_ASSESSMENT_ID = summary['assessment']['no'];
    var CURRENT_ASSESSMENT_DATE = summary['assessment']['date_th'];



    var CURRENT_ASSESSMENT_RESULT = [];
	CURRENT_ASSESSMENT_RESULT.push([
		{
			text : 'ด้านการประเมิน',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
		{
			text : 'ผลการประเมิน',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		}
	]);
    
    //problem
    
    var problem = data['data']['problem_solve'];
	
    var PROB_0_DATE = problem['plandata'][0]['assessment']['date_th'];
    var PROB_0_NO = problem['plandata'][0]['assessment']['no'];
    var PROB_0_RESULT = problem['plandata'][0]['assessment']['result'];
    var PROB_0_SCORE = problem['plandata'][0]['assessment']['score'];
    var PROB_0_STAFF = '';
    
    var PROB_0_DETAIL = [];
    PROB_0_DETAIL.push([ 
        {
			text : 'คำถาม',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
		{
			text : 'คำตอบ',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		}    
    ]);
    for(var i = 0; i < problem['plandata'][0]['assessment']['detail'].length; i++){
        PROB_0_DETAIL.push ([ problem['plandata'][0]['assessment']['detail'][i]['question'],   problem['plandata'][0]['assessment']['detail'][i]['answer'] ]);
    }
    
    var PROB_0_NEEDED = [];
     for (var i = 0; i < problem['plandata'][0]['need'].length ; i++){
        PROB_0_NEEDED.push ( { text : problem['plandata'][0]['need'][i] , margin : [INDENT_LEFT + 20, LINE_SPACING, 0, 0]});
    }
    
    var PROB_0_SERVICE = [];
    PROB_0_SERVICE.push([ 
        {
			text : 'ด้าน',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
		{
			text : 'รายการ',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
        {
			text : 'บุคลากรที่เกี่ยวข้อง',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		}
    ]);
    
    for(var i = 0; i < problem['plandata'][0]['service'].length; i++) {
        var listString = '';
        if (problem['plandata'][0]['service'][i]['items'].length > 0){
            for (var j = 0; j < problem['plandata'][0]['service'][i]['items'].length; j++){
                listString += '-\b' + problem['plandata'][0]['service'][i]['items'][j] + '\n';
            }
        } else {
            listString = '-';
        }
        
        var listStaff = '';
        if (problem['plandata'][0]['staff'].length > 0){
            for (var k = 0; k < problem['plandata'][0]['staff'].length; k++){
                listStaff += '-\b' + problem['plandata'][0]['staff'][k] + '\n';
            }
        } else {
            listStaff = '-';
        }
        
        PROB_0_SERVICE.push([ problem['plandata'][0]['service'][i]['svcobject'], listString, listStaff ]);
    }
    
    // 1
    var PROB_1_DATE = problem['plandata'][1]['assessment']['date_th'];
    var PROB_1_NO = problem['plandata'][1]['assessment']['no'];
    var PROB_1_RESULT = problem['plandata'][1]['assessment']['result'];
    var PROB_1_SCORE = problem['plandata'][1]['assessment']['score'];
    var PROB_1_STAFF = '';
    
    var PROB_1_DETAIL = [];
    PROB_1_DETAIL.push([ 
        {
			text : 'คำถาม',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
		{
			text : 'คำตอบ',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		}    
    ]);
    for(var i = 0; i < problem['plandata'][1]['assessment']['detail'].length; i++){
        PROB_1_DETAIL.push ([ problem['plandata'][1]['assessment']['detail'][i]['question'],   problem['plandata'][1]['assessment']['detail'][i]['answer'] ]);
    }
    
    var PROB_1_NEEDED = [];
     for (var i = 0; i < problem['plandata'][1]['need'].length ; i++){
        PROB_1_NEEDED.push ( { text : problem['plandata'][1]['need'][i] , margin : [INDENT_LEFT + 20, LINE_SPACING, 0, 0]});
    }
    
    var PROB_1_SERVICE = [];
    PROB_1_SERVICE.push([ 
        {
			text : 'ด้าน',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
		{
			text : 'รายการ',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
        {
			text : 'บุคลากรที่เกี่ยวข้อง',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		}
    ]);
    for(var i = 0; i < problem['plandata'][1]['service'].length; i++) {
        var listString = '';
        if (problem['plandata'][1]['service'][i]['items'].length > 0){
            for (var j = 0; j < problem['plandata'][1]['service'][i]['items'].length; j++){
                listString += '-\b' + problem['plandata'][1]['service'][i]['items'][j] + '\n';
            }
        } else {
            listString = '-';
        }
        
        var listStaff = '';
        if (problem['plandata'][1]['staff'].length > 0){
            for (var k = 0; k < problem['plandata'][1]['staff'].length; k++){
                listStaff += '-\b' + problem['plandata'][1]['staff'][k] + '\n';
            }
        } else {
            listStaff = '-';
        }
        PROB_1_SERVICE.push([ problem['plandata'][1]['service'][i]['svcobject'], listString, listStaff ]);
    }
    
    //2
    var PROB_2_DATE = problem['plandata'][2]['assessment']['date_th'];
    var PROB_2_NO = problem['plandata'][2]['assessment']['no'];
    var PROB_2_RESULT = problem['plandata'][2]['assessment']['result'];
    var PROB_2_SCORE = problem['plandata'][2]['assessment']['score'];
    var PROB_2_STAFF = '';
    
    var PROB_2_DETAIL = [];
    PROB_2_DETAIL.push([ 
        {
			text : 'คำถาม',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
		{
			text : 'คำตอบ',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		}    
    ]);
    for(var i = 0; i < problem['plandata'][2]['assessment']['detail'].length; i++){
        PROB_2_DETAIL.push ([ problem['plandata'][2]['assessment']['detail'][i]['question'],   problem['plandata'][2]['assessment']['detail'][i]['answer'] ]);
    }
    
    var PROB_2_NEEDED = [];
     for (var i = 0; i < problem['plandata'][2]['need'].length ; i++){
        PROB_2_NEEDED.push ( { text : problem['plandata'][2]['need'][i] , margin : [INDENT_LEFT + 20, LINE_SPACING, 0, 0]});
    }
    
    var PROB_2_SERVICE = [];
    PROB_2_SERVICE.push([ 
        {
			text : 'ด้าน',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
		{
			text : 'รายการ',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
        {
			text : 'บุคลากรที่เกี่ยวข้อง',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		}
    ]);
    for(var i = 0; i < problem['plandata'][2]['service'].length; i++) {
        var listString = '';
        if (problem['plandata'][2]['service'][i]['items'].length > 0){
            for (var j = 0; j < problem['plandata'][2]['service'][i]['items'].length; j++){
                listString += '-\b' + problem['plandata'][2]['service'][i]['items'][j] + '\n';
            }
        } else {
            listString = '-';
        }
        
        var listStaff = '';
        if (problem['plandata'][2]['staff'].length > 0){
            for (var k = 0; k < problem['plandata'][2]['staff'].length; k++){
                listStaff += '-\b' + problem['plandata'][2]['staff'][k] + '\n';
            }
        } else {
            listStaff = '-';
        }
        PROB_2_SERVICE.push([ problem['plandata'][2]['service'][i]['svcobject'], listString, listStaff ]);
    }
    
    
    //3
    var PROB_3_DATE = problem['plandata'][3]['assessment']['date_th'];
    var PROB_3_NO = problem['plandata'][3]['assessment']['no'];
    var PROB_3_RESULT = problem['plandata'][3]['assessment']['result'];
    var PROB_3_SCORE = problem['plandata'][3]['assessment']['score'];
    var PROB_3_STAFF = '';
    
    var PROB_3_DETAIL = [];
    PROB_3_DETAIL.push([ 
        {
			text : 'คำถาม',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
		{
			text : 'คำตอบ',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		}    
    ]);
    for(var i = 0; i < problem['plandata'][3]['assessment']['detail'].length; i++){
        PROB_3_DETAIL.push ([ problem['plandata'][3]['assessment']['detail'][i]['question'],   problem['plandata'][3]['assessment']['detail'][i]['answer'] ]);
    }
    
    var PROB_3_NEEDED = [];
     for (var i = 0; i < problem['plandata'][3]['need'].length ; i++){
        PROB_3_NEEDED.push ( { text : problem['plandata'][3]['need'][i] , margin : [INDENT_LEFT + 20, LINE_SPACING, 0, 0]});
    }
    
    var PROB_3_SERVICE = [];
    PROB_3_SERVICE.push([ 
        {
			text : 'ด้าน',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
		{
			text : 'รายการ',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
        {
			text : 'บุคลากรที่เกี่ยวข้อง',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		}
    ]);
    for(var i = 0; i < problem['plandata'][3]['service'].length; i++) {
        var listString = '';
        if (problem['plandata'][3]['service'][i]['items'].length > 0){
            for (var j = 0; j < problem['plandata'][3]['service'][i]['items'].length; j++){
                listString += '-\b' + problem['plandata'][3]['service'][i]['items'][j] + '\n';
            }
        } else {
            listString = '-';
        }
        
        var listStaff = '';
        if (problem['plandata'][3]['staff'].length > 0){
            for (var k = 0; k < problem['plandata'][3]['staff'].length; k++){
                listStaff += '-\b' + problem['plandata'][3]['staff'][k] + '\n';
            }
        } else {
            listStaff = '-';
        }
        
        PROB_3_SERVICE.push([ problem['plandata'][3]['service'][i]['svcobject'], listString, listStaff ]);
    }
    
    //4
    var PROB_4_DATE = problem['plandata'][4]['assessment']['date_th'];
    var PROB_4_NO = problem['plandata'][4]['assessment']['no'];
    var PROB_4_RESULT = problem['plandata'][4]['assessment']['result'];
    var PROB_4_SCORE = problem['plandata'][4]['assessment']['score'];
    var PROB_4_STAFF = '';
    
    var PROB_4_DETAIL = [];
    PROB_4_DETAIL.push([ 
        {
			text : 'คำถาม',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
		{
			text : 'คำตอบ',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		}
    ]);
    for(var i = 0; i < problem['plandata'][4]['assessment']['detail'].length; i++){
        PROB_4_DETAIL.push ([ problem['plandata'][4]['assessment']['detail'][i]['question'],   problem['plandata'][4]['assessment']['detail'][i]['answer'] ]);
    }
    
    var PROB_4_NEEDED = [];
     for (var i = 0; i < problem['plandata'][4]['need'].length ; i++){
        PROB_4_NEEDED.push ( { text : problem['plandata'][4]['need'][i] , margin : [INDENT_LEFT + 20, LINE_SPACING, 0, 0]});
    }
    
    var PROB_4_SERVICE = [];
    PROB_4_SERVICE.push([ 
        {
			text : 'ด้าน',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
		{
			text : 'รายการ',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
        {
			text : 'บุคลากรที่เกี่ยวข้อง',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		}
    ]);
    for(var i = 0; i < problem['plandata'][4]['service'].length; i++) {
        var listString = '';
        if (problem['plandata'][4]['service'][i]['items'].length > 0){
            for (var j = 0; j < problem['plandata'][4]['service'][i]['items'].length; j++){
                listString += '-\b' + problem['plandata'][4]['service'][i]['items'][j] + '\n';
            }
        } else {
            listString = '-';
        }
        
        var listStaff = '';
        if (problem['plandata'][4]['staff'].length > 0){
            for (var k = 0; k < problem['plandata'][4]['staff'].length; k++){
                listStaff += '-\b' + problem['plandata'][4]['staff'][k] + '\n';
            }
        } else {
            listStaff = '-';
        }
        
        PROB_4_SERVICE.push([ problem['plandata'][4]['service'][i]['svcobject'], listString, listStaff ]);
    }
    
    //5
    
    
    var PROB_5_NEEDED = [];
     for (var i = 0; i < problem['plandata'][5]['need'].length ; i++){
        PROB_5_NEEDED.push ( { text : problem['plandata'][5]['need'][i] , margin : [INDENT_LEFT + 20, LINE_SPACING, 0, 0]});
    }
    // console.log(PROB_5_NEEDED);
    var PROB_5_SERVICE = [];
    PROB_5_SERVICE.push([ 
        {
			text : 'ด้าน',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
		{
			text : 'รายการ',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
        {
			text : 'บุคลากรที่เกี่ยวข้อง',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		}
    ]);
    for(var i = 0; i < problem['plandata'][5]['service'].length; i++) {
        var listString = '';
        if (problem['plandata'][5]['service'][i]['items'].length > 0){
            for (var j = 0; j < problem['plandata'][5]['service'][i]['items'].length; j++){
                listString += '-\b' + problem['plandata'][5]['service'][i]['items'][j] + '\n';
            }
        } else {
            listString = '-';
        }
        
        var listStaff = '';
        if (problem['plandata'][5]['staff'].length > 0){
            for (var k = 0; k < problem['plandata'][5]['staff'].length; k++){
                listStaff += '-\b' + problem['plandata'][5]['staff'][k] + '\n';
            }
        } else {
            listStaff = '-';
        }
        
        PROB_5_SERVICE.push([ problem['plandata'][5]['service'][i]['svcobject'], listString, listStaff ]);
    }
    
    
    /////////////
    
	var TOOLS_NEEDED = [];
    for (var i = 0; i < data['data']['problem_solve']['tools'].length ; i++){
        TOOLS_NEEDED.push ( { text : data['data']['problem_solve']['tools'][i] , margin : [INDENT_LEFT + 20, LINE_SPACING, 0, 0]});
    }
	
	var SIGNATURES = []; //table body
    SIGNATURES.push([
		{
			text : 'ชื่อ-นามสกุล',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
		{
			text : 'ตำแหน่ง/ความเกี่ยวข้องกับผู้สูงอายุ',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
        {
			text : 'เบอร์โทรศัพท์',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		},
		{
			text : 'ลายมือชื่อ',
			style : 'subheader',
			alignment : 'center',
			fillColor: '#9C9C9C'
		}
	]);
	
	SIGNATURES.push ([ data['data']['profile']['title']+data['data']['profile']['name_lastname'], 'ผู้สูงอายุ', data['data']['profile']['telephone_self'], ' ' ]);
	SIGNATURES.push ([ data['data']['screening']['staff']['staffname'], 'Case Manager', data['data']['screening']['staff']['tel'], ' ' ]);
	SIGNATURES.push ([ data['data']['profile']['caregiver']['name_lastname'], 'ผู้ดูแล', data['data']['profile']['caregiver']['tel'], ' ' ]);
    // end CARE PLAN


	var docDefinition = {
			pageMargins: [20, 90, 20, 70],
			header: { 				
				
				image: 'nhso_logo',
				width: 200				       
		    },
		    footer: {		    	
		       
	 			columns: [
					{
						image: 'nu_logo',
						width: 200,
						alignment : 'center'
					}								
				]	
		    },		   
	 		content: [
				{
					text: 'ข้อตกลงแผนการดูแลผู้สูงอายุ',
					style : 'header',
					alignment : 'center',
					margin : [0, LINE_SPACING, 0, 0]
				},	
				{
					text: '( Care Agreement Plan)',
					style : 'subheader',
					alignment : 'center',
					margin : [0, LINE_SPACING, 0, 0]
				},
				{
					image: 'avatar',
					alignment : 'right',
					width : 100
				},
				{
					text: '1. ช้อมูลทั่วไป',
					style : 'header',
					alignment : 'left',
					margin : [0, LINE_SPACING - 55, 0, 0]
				},	
				{
					text: 'ข้อมูลผู้สูงอายุ',
					style : 'subheader',
					alignment : 'left',
					margin : [INDENT_LEFT, LINE_SPACING, 0, 0],
					decoration: 'underline'
				},
				{
					columns : [
						{
							text : 'ชื่อ - นามสกุล  : ' + NAME,
							margin : [INDENT_LEFT * 2, LINE_SPACING, 0, 0],
							width : 250
						},
						{
							text : 'เลขบัตรประจำตัวประชาชน  : ' + CID,
							margin : [INDENT_LEFT, LINE_SPACING, 0, 0],
						}
					]
				},
				{
					columns : [
						{
							text : 'วัน/เดือน/ปีเกิด  : ' + DOB,
							margin : [INDENT_LEFT * 2, LINE_SPACING, 0, 0],
							width : 250
						},
						{
							text : 'อายุ  : ' + AGE + ' ปี',
							margin : [INDENT_LEFT, LINE_SPACING, 0, 0],
						}
					]
				},
				{
					columns : [
						{
							text : 'เพศ  : ' + GENDER,
							margin : [INDENT_LEFT * 2, LINE_SPACING, 0, 0],
							width : 250
						},
						{
							text : 'สถานภาพสมรส  : ' + MARRITAL_STATUS,
							margin : [INDENT_LEFT, LINE_SPACING, 0, 0],
						}
					]
				},
				{
					columns : [
						{
							text : 'การศึกษาสูงสุดที่ได้รับ  : ' + EDUCATION,
							margin : [INDENT_LEFT * 2, LINE_SPACING, 0, 0],
							width : 250
						},
						{
							text : 'อาชีพ  : ' + OCCUPATION,
							margin : [INDENT_LEFT, LINE_SPACING, 0, 0],
						}
					]
				},
				{
					columns : [
						{
							text : 'รายได้ของผู้สูงอายุ  : ' + INCOME_SELF + " บาท/ เดือน",
							margin : [INDENT_LEFT * 2, LINE_SPACING, 0, 0],
							width : 250
						},
						{
							text : 'รายได้ของครับครัว  : ' + INCOME_FAMILY + " บาท/ เดือน",
							margin : [INDENT_LEFT, LINE_SPACING, 0, 0],
						}
					]
				},
				{
					text : 'เบอร์โทรศัพท์ที่สามารถติดต่อได้ : ' + TEL_NO ,
					margin : [INDENT_LEFT * 2, LINE_SPACING, 0, 0]
				},
				{
					text : 'ที่อยู่ที่สามารถติดต่อได้ : ' + ADDRESS_SELF ,
					margin : [INDENT_LEFT * 2, LINE_SPACING, 0, 0]					
				},	                
				{
					text : 'หมายเหตุ : แผนที่บ้านผู้สูงอายุอยู่หน้าสุดท้ายของเอกสารนี้' ,
					margin : [INDENT_LEFT * 2, LINE_SPACING + 50, 0, 0],
					pageBreak : 'after'
				},					
				{
					text : 'สมาชิกที่อาศัยอยู่ในบ้านเดียวกัน ' + FAMILY_MEMBER_COUNT + ' คน',
					style : 'subheader',
					alignment : 'left',
					margin : [INDENT_LEFT, LINE_SPACING , 0, 0],
					decoration: 'underline'
				},
				{
					stack : FAMILY_MEMBER
				},
				{
					text : 'ผู้ดูแลหลัก',
					style : 'subheader',
					alignment : 'left',
					margin : [INDENT_LEFT, LINE_SPACING , 0, 0],
					decoration: 'underline'
				},
				{
					columns : [
						{
							text : 'ชื่อ  : ' + CAREGIVER_NAME,
							margin : [INDENT_LEFT, LINE_SPACING, 0, 0],
							width : 250
						},
						{
							text : 'เลขบัตรประจำตัวประชาชน  : ' + CAREGIVER_CID,
							margin : [INDENT_LEFT, LINE_SPACING, 0, 0],
						}
					]
				},
				{
					columns : [
						{
							text : 'เบอร์โทรศัพท์  : ' + CAREGIVER_TEL,
							margin : [INDENT_LEFT, LINE_SPACING, 0, 0],
							width : 250
						},
						{
							text : 'ความสัมพันธ์  : ' + CAREGIVER_RELATION,
							margin : [INDENT_LEFT, LINE_SPACING, 0, 0],
						}
					]
				},
				// section 2
				{
					text: '2. ข้อมูลสวัสดิการที่ได้รับในปัจจุบัน',
					style : 'header',
					alignment : 'left',
					margin : [0, LINE_SPACING, 0, 0]
				},
				{
					text : 'สวัสดิการด้านสุขภาพ',
					style : 'subheader',
					alignment : 'left',
					margin : [INDENT_LEFT, LINE_SPACING, 0, 0],
					decoration: 'underline'
				},
				{
					ul : HEALTH_RIGHTS
				},
				{
					text : 'หน่วยบริการปฐมภูมิประจำครอบครัว  : ' + PRIMARY_HEALTH_PROVIDER,
					margin : [INDENT_LEFT * 2, LINE_SPACING, 0, 0],					
				},
				{
					text : 'หน่วยบริการประจำส่งต่อ  : ' + SECONDARY_HEALTH_PROVIDER,
					margin : [INDENT_LEFT * 2, LINE_SPACING, 0, 0],					
				},
				{
					text : 'สวัสดิการด้านสังคม',
					style : 'subheader',
					alignment : 'left',
					margin : [INDENT_LEFT, LINE_SPACING, 0, 0],
					decoration: 'underline'
				},
				{
					ul : SOCIAL_RIGHTS,
					pageBreak : 'after'
				},
				// section 3
				{
					text: '3. สรุปผลการคัดกรอง / ประเมิน',
					style : 'header',
					alignment : 'left',
					margin : [0, LINE_SPACING, 0, 0]
				},	
				{
                    text: '3.1 การคัดกรองเพื่อจำแนกกลุ่มผุ้สูงอายุตามศักยภาพ',
					style : 'subheader',
					alignment : 'left',
					margin : [INDENT_LEFT, LINE_SPACING, 0, 0]
				},
				{
					stack : [
						{
							margin : [INDENT_LEFT, 0, 0, 0],
							columns : [
								{
									text : 'การคัดกรองครั้งที่   : ' + LATEST_SCREENING_ID,
									margin : [INDENT_LEFT , LINE_SPACING, 0, 0],
									width : 120,
									bold : true
								},
								{
									text : 'วันที่  : ' + LATEST_SCREENING_DATE,
									margin : [0, LINE_SPACING, 0, 0],
								}
							]
						},
						{
							text : 'ผลการคัดกรอง ADL : ' + LATEST_ADL_GROUP + ' (' + LATEST_ADL_SCORE + 'คะแนน)',
							margin : [INDENT_LEFT * 2, LINE_SPACING, 0 , 0]
						}
					]
				},
                //problem section 0
                {
					text: '4. ปัญหาด้านสังคม',
					style : 'header',
					alignment : 'left',
					margin : [0, LINE_SPACING, 0, 0]
				},	
                {
                    text: 'การประเมินด้านสังคม',
					style : 'subheader',
                    decoration: 'underline',
					alignment : 'left',
					margin : [INDENT_LEFT, LINE_SPACING, 0, 0]
				},
                {
					columns : [
						{
							text : 'ประเมินวันที่ : ' + PROB_0_DATE,
							margin : [INDENT_LEFT * 2, LINE_SPACING, 0, 0],
							width : 250
						},
						{
							text : 'ครั้งที่  : ' + PROB_0_NO,
							margin : [INDENT_LEFT, LINE_SPACING, 0, 0],
						}
					]
				},
                {
					text : 'ผลการประเมิน  : ' + PROB_0_RESULT + '(' + PROB_0_SCORE + ' คะแนน)',
					margin : [INDENT_LEFT * 2, LINE_SPACING, 0, 0],					
				},
                {
					text : 'ผู้ทำการประเมิน  : ' + PROB_0_STAFF ,
					margin : [INDENT_LEFT * 2, LINE_SPACING, 0, 0],					
				},
                {
                    text: 'รายละเอียดการประเมิน',
					style : 'subheader',
                    decoration: 'underline',
					alignment : 'left',
					margin : [INDENT_LEFT, LINE_SPACING, 0, 0]
				},
                {
					margin : [INDENT_LEFT, LINE_SPACING, INDENT_RIGHT, 20], 
	 				table: {	
                        widths : [260, 260],
						headerRows : 1,
						body: PROB_0_DETAIL
					}									
				},
                {
                    text: 'ความต้องการของผู้สูงอายุ',
					style : 'subheader',
                    decoration: 'underline',
					alignment : 'left',
					margin : [INDENT_LEFT, LINE_SPACING, 0, 0]
				},
                {
					ul : PROB_0_NEEDED
				},
                {
                    text: 'บริการที่ต้องการ',
					style : 'subheader',
                    decoration: 'underline',
					alignment : 'left',
					margin : [INDENT_LEFT, LINE_SPACING, 0, 0]
				},
                {
					margin : [INDENT_LEFT, LINE_SPACING, INDENT_RIGHT, 20], 
	 				table: {	
                        widths : [100, 320, 100],
						headerRows : 1,
						body: PROB_0_SERVICE
					}									
				},
                
                //1
                {
					text: '5. ปัญหาด้าน ADL',
					style : 'header',
					alignment : 'left',
					margin : [0, LINE_SPACING, 0, 0]
				},	
                {
                    text: 'การประเมิน ADL',
					style : 'subheader',
                    decoration: 'underline',
					alignment : 'left',
					margin : [INDENT_LEFT, LINE_SPACING, 0, 0]
				},
                {
					columns : [
						{
							text : 'ประเมินวันที่ : ' + PROB_1_DATE,
							margin : [INDENT_LEFT * 2, LINE_SPACING, 0, 0],
							width : 250
						},
						{
							text : 'ครั้งที่  : ' + PROB_1_NO,
							margin : [INDENT_LEFT, LINE_SPACING, 0, 0],
						}
					]
				},
                {
					text : 'ผลการประเมิน  : ' + PROB_1_RESULT + '(' + PROB_1_SCORE + ' คะแนน)',
					margin : [INDENT_LEFT * 2, LINE_SPACING, 0, 0],					
				},
                {
					text : 'ผู้ทำการประเมิน  : ' + PROB_1_STAFF ,
					margin : [INDENT_LEFT * 2, LINE_SPACING, 0, 0],					
				},
                {
                    text: 'รายละเอียดการประเมิน',
					style : 'subheader',
                    decoration: 'underline',
					alignment : 'left',
					margin : [INDENT_LEFT, LINE_SPACING, 0, 0]
				},
                {
					margin : [INDENT_LEFT, LINE_SPACING, INDENT_RIGHT, 20], 
	 				table: {	
                        widths : [260, 260],
						headerRows : 1,
						body: PROB_1_DETAIL
					}									
				},
                {
                    text: 'ความต้องการของผู้สูงอายุ',
					style : 'subheader',
                    decoration: 'underline',
					alignment : 'left',
					margin : [INDENT_LEFT, LINE_SPACING, 0, 0]
				},
                {
					ul : PROB_1_NEEDED
				},
                {
                    text: 'บริการที่ต้องการ',
					style : 'subheader',
                    decoration: 'underline',
					alignment : 'left',
					margin : [INDENT_LEFT, LINE_SPACING, 0, 0]
				},
                {
					margin : [INDENT_LEFT, LINE_SPACING, INDENT_RIGHT, 20], 
	 				table: {	
                        widths : [100, 320, 100],
						headerRows : 1,
						body: PROB_1_SERVICE
					}									
				},
                
                //2
                {
					text: '6. ปัญหาด้านสมอง',
					style : 'header',
					alignment : 'left',
                    pageBreak : 'before',
					margin : [0, LINE_SPACING, 0, 0]
				},	
                {
                    text: 'การประเมินสภาพสมอง',
					style : 'subheader',
                    decoration: 'underline',
					alignment : 'left',
					margin : [INDENT_LEFT, LINE_SPACING, 0, 0]
				},
                {
					columns : [
						{
							text : 'ประเมินวันที่ : ' + PROB_2_DATE,
							margin : [INDENT_LEFT * 2, LINE_SPACING, 0, 0],
							width : 250
						},
						{
							text : 'ครั้งที่  : ' + PROB_2_NO,
							margin : [INDENT_LEFT, LINE_SPACING, 0, 0],
						}
					]
				},
                {
					text : 'ผลการประเมิน  : ' + PROB_2_RESULT + '(' + PROB_2_SCORE + ' คะแนน)',
					margin : [INDENT_LEFT * 2, LINE_SPACING, 0, 0],					
				},
                {
					text : 'ผู้ทำการประเมิน  : ' + PROB_2_STAFF ,
					margin : [INDENT_LEFT * 2, LINE_SPACING, 0, 0],					
				},
                {
                    text: 'รายละเอียดการประเมิน',
					style : 'subheader',
                    decoration: 'underline',
					alignment : 'left',
					margin : [INDENT_LEFT, LINE_SPACING, 0, 0]
				},
                {
					margin : [INDENT_LEFT, LINE_SPACING, INDENT_RIGHT, 20], 
	 				table: {	
                        widths : [260, 260],
						headerRows : 1,
						body: PROB_2_DETAIL
					}									
				},
                {
                    text: 'ความต้องการของผู้สูงอายุ',
					style : 'subheader',
                    decoration: 'underline',
					alignment : 'left',
					margin : [INDENT_LEFT, LINE_SPACING, 0, 0]
				},
                {
					ul : PROB_2_NEEDED
				},
                {
                    text: 'บริการที่ต้องการ',
					style : 'subheader',
                    decoration: 'underline',
					alignment : 'left',
					margin : [INDENT_LEFT, LINE_SPACING, 0, 0]
				},
                {
					margin : [INDENT_LEFT, LINE_SPACING, INDENT_RIGHT, 20], 
	 				table: {	
                        widths : [100, 320, 100],
						headerRows : 1,
						body: PROB_2_SERVICE
					}									
				},
                //3
                {
					text: '7. ปัญหาด้านการกลืน',
					style : 'header',
					alignment : 'left',
					margin : [0, LINE_SPACING, 0, 0]
				},	
                {
                    text: 'การประเมินสภาวะการกลืนลำบาก',
					style : 'subheader',
                    decoration: 'underline',
					alignment : 'left',
					margin : [INDENT_LEFT, LINE_SPACING, 0, 0]
				},
                {
					columns : [
						{
							text : 'ประเมินวันที่ : ' + PROB_3_DATE,
							margin : [INDENT_LEFT * 2, LINE_SPACING, 0, 0],
							width : 250
						},
						{
							text : 'ครั้งที่  : ' + PROB_3_NO,
							margin : [INDENT_LEFT, LINE_SPACING, 0, 0],
						}
					]
				},
                {
					text : 'ผลการประเมิน  : ' + PROB_3_RESULT + '(' + PROB_3_SCORE + ' คะแนน)',
					margin : [INDENT_LEFT * 2, LINE_SPACING, 0, 0],					
				},
                {
					text : 'ผู้ทำการประเมิน  : ' + PROB_3_STAFF ,
					margin : [INDENT_LEFT * 2, LINE_SPACING, 0, 0],					
				},
                {
                    text: 'รายละเอียดการประเมิน',
					style : 'subheader',
                    decoration: 'underline',
					alignment : 'left',
					margin : [INDENT_LEFT, LINE_SPACING, 0, 0]
				},
                {
					margin : [INDENT_LEFT, LINE_SPACING, INDENT_RIGHT, 20], 
	 				table: {	
                        widths : [260, 260],
						headerRows : 1,
						body: PROB_3_DETAIL
					}									
				},
                {
                    text: 'ความต้องการของผู้สูงอายุ',
					style : 'subheader',
                    decoration: 'underline',
					alignment : 'left',
					margin : [INDENT_LEFT, LINE_SPACING, 0, 0]
				},
                {
					ul : PROB_3_NEEDED
				},
                {
                    text: 'บริการที่ต้องการ',
					style : 'subheader',
                    decoration: 'underline',
					alignment : 'left',
					margin : [INDENT_LEFT, LINE_SPACING, 0, 0]
				},
                {
					margin : [INDENT_LEFT, LINE_SPACING, INDENT_RIGHT, 20], 
	 				table: {	
                        widths : [100, 320, 100],
						headerRows : 1,
						body: PROB_3_SERVICE
					}									
				},
                {
					text: '8. ปัญหาด้านความซึมเศร้า',
					style : 'header',
                    pageBreak: 'before',
					alignment : 'left',
					margin : [0, LINE_SPACING, 0, 0]
				},	
                {
                    text: 'การประเมินภาวะซึมเศร้าในช่วง 2 สัปดาห์ที่ผ่านมา',
					style : 'subheader',
                    decoration: 'underline',
					alignment : 'left',
					margin : [INDENT_LEFT, LINE_SPACING, 0, 0]
				},
                {
					columns : [
						{
							text : 'ประเมินวันที่ : ' + PROB_4_DATE,
							margin : [INDENT_LEFT * 2, LINE_SPACING, 0, 0],
							width : 250
						},
						{
							text : 'ครั้งที่  : ' + PROB_4_NO,
							margin : [INDENT_LEFT, LINE_SPACING, 0, 0],
						}
					]
				},
                {
					text : 'ผลการประเมิน  : ' + PROB_4_RESULT + '(' + PROB_4_SCORE + ' คะแนน)',
					margin : [INDENT_LEFT * 2, LINE_SPACING, 0, 0],					
				},
                {
					text : 'ผู้ทำการประเมิน  : ' + PROB_4_STAFF ,
					margin : [INDENT_LEFT * 2, LINE_SPACING, 0, 0],					
				},
                {
                    text: 'รายละเอียดการประเมิน',
					style : 'subheader',
                    decoration: 'underline',
					alignment : 'left',
					margin : [INDENT_LEFT, LINE_SPACING, 0, 0]
				},
                {
					margin : [INDENT_LEFT, LINE_SPACING, INDENT_RIGHT, 20], 
	 				table: {	
                        widths : [260, 260],
						headerRows : 1,
						body: PROB_4_DETAIL
					}									
				},
                {
                    text: 'ความต้องการของผู้สูงอายุ',
					style : 'subheader',
                    decoration: 'underline',
					alignment : 'left',
					margin : [INDENT_LEFT, LINE_SPACING, 0, 0]
				},
                {
					ul : PROB_4_NEEDED
				},
                {
                    text: 'บริการที่ต้องการ',
					style : 'subheader',
                    decoration: 'underline',
					alignment : 'left',
					margin : [INDENT_LEFT, LINE_SPACING, 0, 0]
				},
                {
					margin : [INDENT_LEFT, LINE_SPACING, INDENT_RIGHT, 20], 
	 				table: {	
                        widths : [100, 320, 100],
						headerRows : 1,
						body: PROB_4_SERVICE
					}									
				},
                
                {
					text: '9. ปัญหาด้านอื่นๆ',
					style : 'header',
					alignment : 'left',
					margin : [0, LINE_SPACING, 0, 0]
				},
                {
                    text: 'ความต้องการของผู้สูงอายุ',
					style : 'subheader',
                    decoration: 'underline',
					alignment : 'left',
					margin : [INDENT_LEFT, LINE_SPACING, 0, 0]
				},
                {
					ul : PROB_5_NEEDED
				},
                
                
				{
					pageBreak : 'before',
					text: 'เครื่องมือ/อุปกรณ์ช่วยเหลือที่ต้องการ',
					style : 'subheader',
					alignment : 'left',
					margin : [ 0 , LINE_SPACING, 0, 0]
				},
				{
					ul : TOOLS_NEEDED
				},
				{
					text: 'ผู้ที่เกี่ยวข้องกับการวางแผนการดูแลรายบุคคลฉบับนี้',
					style : 'subheader',
					alignment : 'left',
					margin : [ 0 , LINE_SPACING, 0, 0]
				},
				{
					margin : [INDENT_LEFT, LINE_SPACING, INDENT_RIGHT, 20], 
	 				table: {	
                        widths : [200, 120, 80 , 100],
						headerRows : 1,
						body: SIGNATURES
					}									
				},
			], // END CONTENT
			defaultStyle: {
				font: 'THSarabun',
				fontSize : DEFAULT_FONT_SIZE				
			},
			styles : {
				header : {
					bold : true,
					fontSize : DEFAULT_FONT_SIZE + 2
				},
				subheader : {
					bold : true,
					fontSize : DEFAULT_FONT_SIZE
				}
			},
			images : {
				nu_logo : base64_nu_logo,
				nhso_logo : base64_nhso_logo,
				avatar : base64_avatar
				// map : base64_map
			}
 		};

 		pdfMake.fonts = font; 	
        pdfMake.createPdf(docDefinition).download('care-agreement-'+ data['data']['profile']['cid']+'-2015');
    /*
 		pdfMake.createPdf(docDefinition).getBase64(function (base64) {
			$('iframe').attr('src', "data:application/pdf;base64," + base64);
		});
        */
		stopAjaxLoader();
}

function genUnorderedList(array, key) {
   var a = [];
    for (var i = 0; i < array.length; i++){
        a.push(array[i]);
    }
    return { ul : a };
}

function genStack(array) {
    var a = [];
    for (var i = 0; i < array.length; i++ ){
        a.push(array[i]);
        // a.push({ text : 'a' });
    }
    
    return { stack : a };
}

var base64_nhso_logo = 'data:image/jpeg;base64,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DhWgTsy613sQ6gfJFbY7kVGKhlCVEpDzSBUWPSVgdggChZFVfexKgnyTT50AIpUebKE1xFW2C3M8QmEnRlQJ8FcMnYEM8AQLGVA9gJXaJiyABUrR7CSlAB0IBFeqSvx7GaZ6kqOgsck8QICV4Dsw0FB0JQ6Tiy5UiYqeeMMDrIArhX6BiyUr9hJUE7BECkshFC+D/gX8RZApDWdC5h/yMhWW7f8AVf8A/9oADAMAAAERAhEAABDzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzwAADzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzyzjzzzzzyjzDDwjzzzzzzzzzzzzzzzzywjzzzzzzzzzjDTDDjDTzzzzzzzyijFPEMTzxzyzzzzzzzzzzzzArzzzzzzzzzjxTSjjxTzzzzzzzyhT//APo888888888go880048Dr84888kIc840wgEww088s8808wkU/8AvBPPONPIBin/AE7zwJzzwOvzh+ggJCwHG0MIxDzDzzzzyjT30LyXwtS2NwzkaXjjwNvgPzwOqjMz3vlcSBqsnZcBBTzzzzzxT/8AgPMUQW/U81nkIIEWDXq648DroIX0khZAsYwxg3E8U88s88sT/wCmH1/qDv1OPG80qX/jFKQvPA6/IMNJwqfFHzngHRAHPPPPPLAv+Sq1x1f/ANTzwJfoF77ywBbzwOqzY47JQnRfCWQL0QgTzyzzzDb+rjq1y7vcrSvUAyZzbzwJbzwOuhcxwAUdxV8xgL0RxzzzjzxxDyhTvT+zDDzQMS9ghb7zwJ7zwOujB6mjwvxX+xQL0SxDzyzzzzzyhT//APg8888rdyq4w+8oKSwwOiqrVmUOB8V7AAF7AYc88o88888s7vPP+Y8804T8J8W18oZN4x1pgGsuUSGUT2QwB4NqM88488888scc88sc8888cdM8ck88MsMMM88MMs88k8s8MMcM8s888488888888888888888888888888888888888888888888888888888AMwg8g0ww8w4wE4cw000wYYw00w0w00040wkgwQU04UY88s88sVrQMSMMcWKMgB0nI5leEjzqM0lJVZQog4qgjoh3IezE888488wFkDLzy9zQDrrPqx8X9Enw0V33H17nMEThDq7/AD66P7/P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';
var base64_nu_logo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAP0AAAA7CAIAAAA/5hsCAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo5Nzg5MEE1QkI1MkUxMUUyODczOEI0N0JCMUI2NDlDNiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo5Nzg5MEE1Q0I1MkUxMUUyODczOEI0N0JCMUI2NDlDNiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjk3ODkwQTU5QjUyRTExRTI4NzM4QjQ3QkIxQjY0OUM2IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjk3ODkwQTVBQjUyRTExRTI4NzM4QjQ3QkIxQjY0OUM2Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+vQp4FgAAJupJREFUeNrsfQl8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';
var base64_avatar = 'data:image/jpeg;base64,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';
