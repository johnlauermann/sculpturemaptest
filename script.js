mapboxgl.accessToken = 'pk.eyJ1IjoiamxhdWVybWEiLCJhIjoiY2xoMHh4anlkMDM4eTNjcXJpZG5idjN5dCJ9.Ph4gYrj6b2Krr3qd0YCfAw';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-73.963, 40.691],
    zoom: 14
});

// Add a marker for each point from Google Sheets data
// You can fetch and parse the Google Sheets data using Fetch API or other methods

// Add click event listener to display point attributes and galleries in the sidebar
map.on('click', 'points', function (e) {
    var pointAttributes = e.features[0].properties;

    var sidebarContent = '<h2>' + pointAttributes.title + '</h2>';
    sidebarContent += '<p>' + pointAttributes.description + '</p>';

    sidebarContent += '<div id="imageGallery">';
    pointAttributes.images.forEach(function(imageUrl) {
        sidebarContent += '<img src="' + imageUrl + '" />';
    });
    sidebarContent += '</div>';

    sidebarContent += '<div id="pdfGallery">';
    pointAttributes.pdfs.forEach(function(pdfUrl) {
        sidebarContent += '<embed src="' + pdfUrl + '" type="application/pdf" width="100%" height="600px" />';
    });
    sidebarContent += '</div>';

    document.getElementById('sidebar').innerHTML = sidebarContent;

    // Initialize Fancybox for image gallery
    $("#imageGallery").find('img').each(function() {
        $(this).wrap('<a data-fancybox="gallery" href="' + $(this).attr('src') + '"></a>');
    });

    // Display PDF files using PDF.js
    document.getElementById('pdfGallery').querySelectorAll('embed').forEach(function(embedElement) {
        var pdfUrl = embedElement.getAttribute('src');

        pdfjsLib.getDocument(pdfUrl).promise.then(function(pdfDoc) {
            pdfDoc.getPage(1).then(function(page) {
                var scale = 1.5;
                var viewport = page.getViewport({ scale: scale });

                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                var renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };

                page.render(renderContext);
                embedElement.parentNode.replaceChild(canvas, embedElement);
            });
        });
    });
});

// Add layers and sources to the map for displaying points

// Add navigation control to the map
map.addControl(new mapboxgl.NavigationControl());
