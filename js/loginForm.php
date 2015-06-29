<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>คณะแพทยศาสตร์ มหาวิทยาลัยนเรศวร</title>
	<link type="text/css" rel="Stylesheet" href="../css/mainStyles.css" />	
    <script type="text/javascript" src="../Script/jquery-1.8.3.js"></script>
    <script type="text/javascript" src="../Script/jquery-ui-1.9.2.custom.min.js"></script>
	<link type="text/css" rel="Stylesheet" href="../css/cupertino/jquery-ui-1.9.2.custom.min.css" />	
    <script type="text/javascript" src="../Script/jquery.ui.datepicker-th.js"></script>
    <script type="text/javascript" src="../Script/jquery.ui.datepicker.ext.be.js"></script>
    <script src="../ajaxupload.js" type="text/javascript"></script>
    <link rel="stylesheet" type="text/css" href="../css/toastmess.css" />
    <script type="text/javascript" src="../Script/jquery.toastmessage.js"></script>
    <script type="text/javascript" src="../Script/toastmess.js"></script>
    
    <script type="text/javascript" src="../Script/script.js"></script>
    <script type="text/javascript" src="../Script/myJquery.js"></script>
</head>

<body>
<script>
function keyEnter(even) {
    if( even.keyCode == 13 ) {
        //document.getElementById('txtUsername').value = "You Press Key Enter";
		sendLogin();
    }
}

function sendLogin(){
	if($('#txtUsername').val() == ""){
		msgwarn("กรุณากรอกชื่อเข้าใช้งานระบบ");
		$('#txtUsername').focus();
	}else if($('#txtPassword').val() == ""){
		msgwarn("กรุณากรอกรหัสผ่าน");
		$('#txtPassword').focus()
	}else{
		$('#statusLogin').load('login.php', {
			action: 'login',
			txtUsername: $('#txtUsername').val(),
			txtPassword: $('#txtPassword').val()
		});
	}
}
</script>
<table width="1024" border="0" align="center" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center">&nbsp;</td>
  </tr>
  <tr>
    <td align="center">&nbsp;</td>
  </tr>
  <tr>
    <td align="center">&nbsp;</td>
  </tr>
  <tr>
    <td align="center">&nbsp;</td>
  </tr>
  <tr>
    <td align="center"><table width="60%" border="0" cellspacing="0" cellpadding="0" bgcolor="#FFFFFF">
      <tr>
        <td colspan="3"><h3>กรุณาลงชื่อเข้าใช้งานระบบ</h3></td>
      </tr>
      <tr>
        <td colspan="3" align="right">&nbsp;</td>
        </tr>
      <tr>
        <td width="25%" align="right">ชื่อผู้ใช้งาน</td>
        <td width="3%" align="center">:</td>
        <td width="72%"><input type="text" name="txtUsername" id="txtUsername" onkeypress='return keyEnter(event)' /></td>
      </tr>
      <tr>
        <td align="right">รหัสผ่าน</td>
        <td align="center">:</td>
        <td><input type="password" name="txtPassword" id="txtPassword" onkeypress='return keyEnter(event)' /></td>
      </tr>
      <tr>
        <td colspan="3" align="center">&nbsp;</td>
      </tr>
      <tr>
        <td colspan="3" align="center"><div id="statusLogin" style="text-align:center"></div></td>
      </tr>
      <tr>
        <td colspan="3" align="center">
            <input type="button" name="btLogin" id="btLogin" value="เข้าใช้งาน" onclick="sendLogin();" />&nbsp;
            <input type="button" name="btReset" id="btReset" value="รีเซ็ต" onclick="$('#txtUsername').val('');$('#txtPassword').val('');" />
        </td>
      </tr>
      <tr>
        <td colspan="3" align="center">&nbsp;</td>
      </tr>
    </table></td>
  </tr>
</table>
</body>
</html>