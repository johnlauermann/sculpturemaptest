mapboxgl.accessToken = 'pk.eyJ1IjoiamxhdWVybWEiLCJhIjoiY2xzeTByanM2MDh2NzJrbzJ1czk1NDhxMSJ9.jc_JLbR6Hn2OWQFC9b6ClA';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-73.963, 40.691],
    zoom: 14
});

// Fetch Google Sheets data using Fetch API or other methods
fetch('https://docs.google.com/spreadsheets/d/1iDEE-Xv8c-Kif7pxB2yoPzyPzRTwxVlhiKO2X6cspmk/edit?usp=sharing')
    .then(response => response.json())
    .then(data => {
        // Process the data and add markers to the map
        data.forEach(point => {
            var marker = new mapboxgl.Marker()
                .setLngLat([point.Longitude, point.Latitude])
                .addTo(map)
                .setPopup(new mapboxgl.Popup().setHTML('<h3>' + point.Name + '</h3><p>' + point.Artist + '</p>'))
                .addTo(map)
                .getElement()
                .addEventListener('click', function() {
                    var sidebarContent = '<h2>' + point.Name + '</h2>';
                    sidebarContent += '<p>' + point.Artist + '</p>';

                    sidebarContent += '<div id="imageGallery">';
                    point.images.forEach(function(imageUrl) {
                        sidebarContent += '<img src="' + imageUrl + '" />';
                    });
                    sidebarContent += '</div>';

                    sidebarContent += '<div id="pdfGallery">';
                    point.pdfs.forEach(function(pdfUrl) {
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
        });
    });

// Add layers and sources to the map for displaying points

// Add navigation control to the map
map.addControl(new mapboxgl.NavigationControl());
