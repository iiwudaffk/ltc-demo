function PdfEx () {
    this.iframe = "";  // jquery selector  
    
    this.defaultFontSize  = 14;
    this.defaultLineSpacing = 8;
    this.defaultIndent_left = 20;
    this.defaultIndent_right = 20;
    
    this.docDefinition = {
        content : [ ],
        defaultStyle : {
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
        }
    };
    
    this.font = {
	   THSarabun : {
	     normal : 'THSarabun.ttf',
	     bold : 'THSarabunBold.ttf'
	   }
	};
}
    
PdfEx.prototype.addText = function(text, style, alignment, margin){
    var align_ = 'left';
    var style_ = 'default';
    
    if (alignment) align_ = alignment;
    if (style) style_ = style;
    this.docDefinition.content.push ( { text : text , alignment : align_ , style : style_ } );
}

PdfEx.prototype.toIframe = function() {
    pdfMake.fonts = this.font;
    pdfMake.createPdf(this.docDefinition).getBase64(function (base64) {
			$('iframe').attr('src', "data:application/pdf;base64," + base64);
    });
}

