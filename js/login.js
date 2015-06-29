var serviceEndPoint = 'http://newtestnew.azurewebsites.net/servicecontrol/service.svc/';
$(document).ready(function () {
    clearAllSession();


    $("#submit").on("click", function () {        
        $.ajax({
            url: "http://newtestnew.azurewebsites.net/servicecontrol/service.svc/login?username=" + $("#input-user").val() + "&password=" + $("#input-password").val() + "&src=00",
            dataType: 'jsonp',
            success: function (msg) {
                var a = JSON.parse(msg);
                if (a.Status == "OK") {
                    doLogin(a['data']);
                }
                else {
                    $("#login-message").text('ชื่อผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง').show();
                }
            },
            error: function (request, status, error) {
                alert('login error ' + error);
            }
        });
    });

    $('#input-password').keyup ( function (event) {
        console.log('key');
        if ( event.which == 13 ) {
            
            event.preventDefault();
            $.ajax({
                url: "http://newtestnew.azurewebsites.net/servicecontrol/service.svc/login?username=" + $("#input-user").val() + "&password=" + $("#input-password").val() + "&src=00",
                dataType: 'jsonp',
                success: function (msg) {
                    var a = JSON.parse(msg);
                    if (a.Status == "OK") {
                        doLogin(a['data']);
                    }
                    else {
                        $("#login-message").text('ชื่อผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง').show();
                    }
                },
                error: function (request, status, error) {
                    alert('login error ' + error);
                }
            });
        }

     });

});
