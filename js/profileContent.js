$(document).ready(function () {                  
        getProfile();
});

function getProfile () {
    ajaxCrossDomainGet(config_serviceEndPoint + 'getRegisterPRofile?CID=' + getCurrentCID(), bindUserProfile_callback);
}

function bindUserProfile_callback (msg) {
    data = JSON.parse(msg);
    profile = data['data'];
    $('#full-name').val(profile['title'] + profile['firstname'] + ' ' + profile['lastname']);
    $('#cid').val(profile['cid']);
    $('#dob').val(profile['dob_th']);
    
    $('#tel').val(profile['tel']);
    
}

function registerCOD () {
    loadContentPage('#content', contentPath + "deathContent.html"); // load task
}