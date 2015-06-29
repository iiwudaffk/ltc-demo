
$(document).ready(function () {
    var CID = getCurrentCID();
    if (CID != null) {
        $('.content-header h1').text('แผนบริการของ ' + getCurrentName());
        clearJobs();
        addPlan(CID);
    }
});

function addPlan(CID) {
    var data = sessionStorage.getItem("JOB" + CID);
    if (data) {
        var jobs = JSON.parse(data);
        for (var i = 0; i < jobs.length; i++) {
            var job = jobs[i];
            if (job['lastProvision'].length > 0) {
                addJob(job['SVCName'], true, job['StartPlanTime']);
            }
            else {
                addJob(job['SVCName'], false, job['StartPlanTime']);
            }
        }
    }
}