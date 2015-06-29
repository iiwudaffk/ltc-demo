// library for any app

$(document).ready(function () { //***** first function to be RUN

    if (isAuthenticate()){
        bindUserPanel();
        load_window();
    } else {
        window.location = "../pages/login.html";
    }     
    /*
    console.log = function () {} ;
    console.error = function () {};
    console.debug = function () {};
    */
});


function getQueryVar(varName) {
    var queryStr = unescape(window.location.search.toUpperCase()) + '&';
    var regex = new RegExp('.*?[&\\?]' + varName.toUpperCase() + '=(.*?)&.*');
    val = queryStr.replace(regex, "$1");
    return val == queryStr ? false : val;
}

function ajaxCallCodeBehind(urlPath, jdata, onSuccessFn, noteWhenError, onErrorFn) {
    if (onErrorFn == null) {
        $.ajax({
            type: "POST",
            url: urlPath,
            data: jdata,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: onSuccessFn,
            error: function (request, status, error) {
                console.log(error);
                onAjaxError(request, status, error, noteWhenError);
            }
        });
    }
    else {
        $.ajax({
            type: "POST",
            url: urlPath,
            data: jdata,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: onSuccessFn,
            error: onErrorFn
        });
    }
}

function onAjaxError(request, status, error, noteWhenError) {
    alert(noteWhenError + ' ' + status + ' ' + error);
    stopAjaxLoader();
}

function ajaxCallGet(urlPath, jdata, onSuccessFn, noteWhenError, onErrorFn) {
    if (onErrorFn == null) {
        $.ajax({
            url: urlPath + '?callback=?',
            dataType: 'json',
            data: jdata,
            success: onSuccessFn,
            error: function (request, status, error) {
                onAjaxError(request, status, error, noteWhenError);
            }
        });
    }
    else {
        $.ajax({
            url: urlPath + '?callback=?',
            dataType: 'json',
            data: jdata,
            success: onSuccessFn,
            error: onErrorFn
        });
    }
}

function ajaxCrossDomainGet(urlPath, onSuccessFn, noteWhenError){
    $.ajax({
                url: urlPath,
                dataType: 'jsonp',
                success: onSuccessFn,
                error :  function (request, status, error) {
                onAjaxError(request, status, error, noteWhenError);
                console.error('onAjaxError');
            }
    });    
}

function ajaxCrossDomainPost(urlPath, data_, onSuccessFn, noteWhenError){
    $.ajax({
            url: urlPath,
            dataType: 'jsonp',
            method: 'GET',
            success: onSuccessFn,
            data: data_,
            processData: false,
            contentType: "application/json; charset=\"utf-8\"",
            error :  function (request, status, error) {
            onAjaxError(request, status, error, noteWhenError);
        }
    });    
}

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};