javascript
var transformRequest = (url, resourceType) => {
    var isMapboxRequest =
        url.slice(8,22) === "api.mapbox.com" ||
        url.slice(10,26) === "tiles.mapbox.com";
    return {
        url: isMapboxRequest
            ? url.replace("?", "?pluginName=sheetMapper&")
            : url
    };
};

mapboxgl.accessToken = 'pk.eyJ1IjoiamxhdWVybWEiLCJhIjoiY2xzeTByanM2MDh2NzJrbzJ1czk1NDhxMSJ9.jc_JLbR6Hn2OWQFC9b6ClA'; 
var map = new mapboxgl.Map({
    container:'map',
    style:'mapbox://styles/mapbox/navigation-night-v1',
    center:[-73.963,40.691],
    zoom:17,
    transformRequest:transformRequest
});

$(document).ready(function() {
    $.ajax({
        type:"GET",
        url:'https://docs.google.com/spreadsheets/d/1iDEE-Xv8c-Kif7pxB2yoPzyPzRTwxVlhiKO2X6cspmk/gviz/tq?tqx=out:csv&sheet=Sheet1',
        dataType:"text",
        success:function(csvData) { makeGeoJSON(csvData); }
    });

    function makeGeoJSON(csvData) {
        csv2geojson.csv2geojson(csvData, {
            latfield:'Latitude',
            lonfield:'Longitude',
            delimiter:','
        }, function(err, data) {
            map.on('load', function() {

                map.addLayer({
                    'id':'csvData',
                    'type':'circle',
                    'source':{
                        'type':'geojson',
                        'data':data
                    },
                    'paint':{
                        'circle-radius':5,
                        'circle-color':"purple"
                    }
                });

                map.on('click', 'csvData', function(e) {
                    var coordinates = e.features[0].geometry.coordinates.slice();

                    var description = `<h3>` + e.features[0].properties.Name + `</h3>` + `<img src="` + e.features[0].properties.Media + `" style="max-width:100%;height:auto;">` + `<h4>` + `<b>` + `Artist:` + `</b>` + e.features[0].properties.Artist + `</h4>` + `<h4>` + `<b>` + `Year:` + `</b>` + e.features[0].properties.Year + `</h4>`;

                    while (Math.abs(e.lngLat.lng - coordinates[0]) >180) {
                        coordinates[0] += e.lngLat.lng > coordinates[0] ?360 :-360;
                    }

                    new mapboxgl.Popup()
                        .setLngLat(coordinates)
                        .setHTML(description)
                        .addTo(map);
                });

                map.on('mouseenter', 'csvData', function() {
                    map.getCanvas().style.cursor = 'pointer';
                });

                map.on('mouseleave', 'places', function() {
                    map.getCanvas().style.cursor = '';
                });

                var bbox = turf.bbox(data);
                map.fitBounds(bbox, {padding:50});
            });
        });
    };
});
