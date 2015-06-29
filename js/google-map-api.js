var map;
var infoWindow;
var geocoder;
var currentDDL;
var currentDDL_filter;
var currentData;
var locationResult;
var loadingItem;
var addressLocation = '';


function initialize(address) { 
    

    var mapDiv = document.getElementById('map-canvas');
    geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': address }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            addressLocation = results[0].geometry.location;

            
            map = new google.maps.Map(mapDiv, {
                center: results[0].geometry.location,
                zoom: 7,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                disableDefaultUI: true,

            });

            // map.set('styles',);
            createMarker(map, results[0].geometry.location, 'home', address);
            locationResult = results[0].geometry.location;
        } else {
            alert("Geocode was not successful for the following reason: " + status);
        }
    });
}

//clear anything in map and set center to home address
function clearMap() {
    var address = getAddress();
    var mapDiv = document.getElementById('map-canvas');
    map = new google.maps.Map(mapDiv, {
        center: latlng,
        zoom: 7,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    createMarker(map, latlng, 'home', address);
    infoWindow = new google.maps.InfoWindow();
}

//get address from hidden field
function getAddress() {
    return addressLocation;
}

//get all value from DropdownList and send to createMarker() for drop pin
function addMarkers() {
    var value = document.getElementById("DropDownListRecommend");
    for (var i = 0; i < value.options.length; i++) {
        var latLng = new google.maps.LatLng(value.options[i].value.split(',')[1], value.options[i].value.split(',')[2]);
        createMarker(map, latLng, 'default', value.options[i].value.split(',')[0]);
    }
}


/*
createMarker : Drop pin in google map
input        : googleMap latituge-longtitude icon-name message
output       : "drop pin in map"
contract     : google.maps.Map google.maps.LatLng string string => "drop pin in map"
*/
function createMarker(map, position, iconType, msg) {
    var icon = new google.maps.MarkerImage('google-map/icons/' + iconType + '.png', null, null, new google.maps.Point(0, 0));
    var marker = new google.maps.Marker({
        position: position,
        map: map,
        icon: icon       
    });
    google.maps.event.addListener(marker, 'click', function () {
        var myHtml = msg;
        infoWindow.setContent(myHtml);
        infoWindow.open(map, marker);
    });
}

/*
    collect and divide data to 25 items/query
*/
function findAll(data) {
    var origin = getAddress();
    var destination = new Array();
    for (var i = 0; i < data.length; i++) {
        if (destination.length <= 24) {
            var latLng = new google.maps.LatLng(data[i].split(',')[0], data[i].split(',')[1]);
            destination[i] = latLng;
        }
        else {
            googleMatrixRequest(origin, destination);
            destination = [];
            start = 0;
        }
    }
    googleMatrixRequest(origin, destination);
}

/*
    googleMatrixRequest : send request to google matrix service, Information return in function callback()
    input        : string or array of string or latituge-longtitude of 2 address(source-destination)
    output       : "information from google matrix service(Ex. distances, durations)"
    contract(select once)     
                 : string string => "information from google matrix service(Ex. distances, durations)"
                 : string[] string => "information from google matrix service(Ex. distances, durations)"
                 : string string[] => "information from google matrix service(Ex. distances, durations)"
                 : string[] string[] => "information from google matrix service(Ex. distances, durations)"
                 : latituge-longtitude latituge-longtitude => "information from google matrix service(Ex. distances, durations)"
*/
function googleMatrixRequest(origin, destination) {
    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix({
        origins: [origin],
        destinations: destination,
        travelMode: google.maps.TravelMode.DRIVING,
        avoidHighways: false,
        avoidTolls: false
    },
      callback);
}

function callback(response, status) {
    var index = 0;
    if (status == google.maps.DistanceMatrixStatus.OK) {
        var origins = response.originAddresses;
        var destinations = response.destinationAddresses;
        for (var i = 0; i < origins.length; i++) {
            var results = response.rows[i].elements;
            for (var j = 0; j < results.length; j++) {
                var element = results[j];
                if (element.status == google.maps.DistanceMatrixStatus.OK) {
                    var distance = element.distance.text;
                    var duration = element.duration.text;
                    var from = origins[i];
                    var to = destinations[j];
                    if (currentData[index].length > 0) {
                        currentData[index] = currentData[index].split(":")[0] + ' (' + distance + ')' + ':' + currentData[index].split(":")[1];
                    }
                }
                else
                {
                    if (currentData[index].length > 0) {
                        currentData[index] = currentData[index].split(":")[0] + ' (' + 'ไม่สามารถคำนวณได้' + ')' + ':' + currentData[index].split(":")[1];
                    }
                }
                index++;
            }
        }
        currentDDL.options.length = 0;
        var optn = document.createElement("OPTION");
        optn.text = 'กรุณาเลือกรายการ';
        optn.value = 'กรุณาเลือกรายการ';
        currentDDL.options.add(optn);
        currentData.sort(function (a, b) {
            if (a.length > 0 && b.length > 0) {
                a = (a.split(":")[0].split("(")[1].split(" ")[0]).replace(",", "");
                b = (b.split(":")[0].split("(")[1].split(" ")[0]).replace(",", "");
                return a - b;
            }
            return 0;
        });

        for (i = 0; i < currentData.length; i++) {
            if (currentData[i].length > 0) {
                var optn = document.createElement("OPTION");
                optn.text = currentData[i].split(":")[0];
                optn.value = currentData[i].split(":")[1];
                currentDDL.options.add(optn);
            }
        }
    }
    else {
        alert('Error');
    }
}

/*
    findDirection : find direction from A(source) to B(destination)
    input         : string or latituge-longtitude of 2 address(source-destination)
    output        : "show direction on map, information from google service(Ex. distance, duration)"
    contract(select once) 
                  : string string => "direction on map with distance and duration"
                  : latituge-longtitude latituge-longtitude => "direction on map with distance and duration"
*/
function findDirection(source, destination) {
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var directionsService = new google.maps.DirectionsService();
    var myOptions = {
        zoom: 7,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
    directionsDisplay.setMap(map);
    var request = {
        origin: source,
        destination: destination,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    };
    directionsService.route(request, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {

            //            // Display the distance:
            //document.getElementById('test').innerHTML = 'Distance : ' + '<br />' +
            //response.routes[0].legs[0].distance.text;
            var str = currentDDL.options[currentDDL.selectedIndex].text.split('(')[0];
            currentDDL.options[currentDDL.selectedIndex].text = str + '  (' + response.routes[0].legs[0].distance.text + ')';
            //            // Display the duration:
            //            document.getElementById('duration').innerHTML = 'Duration : ' + '<br />' +
            //            response.routes[0].legs[0].duration.text;
            directionsDisplay.setDirections(response);
        }
        else {
            var str = currentDDL.options[currentDDL.selectedIndex].text.split('(')[0];
            currentDDL.options[currentDDL.selectedIndex].text = str + '  (ไม่สามารถคำนวณได้)';
        }
    });
    //addMarkers();
}