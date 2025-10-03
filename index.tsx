/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Declare the Leaflet global variable loaded from the script tag.
declare var L: any;

/**
 * Initializes the Leaflet map.
 */
function initializeMap() {
    try {
        // Initialize the map and set its view to the desired coordinates and zoom level.
        const map = L.map('map').setView([30, 0], 1.5);

        // Add a dark, minimalist base tile layer from CARTO, similar to app.warera.io.
        // This "Dark Matter" style provides a clean, stylized look with visible borders.
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(map);

        // Function to fetch and display countries with unique colors.
        async function addCountryLayers() {
            try {
                // Fetch country boundary data from Natural Earth, which includes population data.
                const response = await fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                let highlightedLayer: any = null;
                let geoJsonLayer: any = null;

                /**
                 * Assigns a color based on discrete population buckets for a clear choropleth map.
                 * @param {number} population The population of the country.
                 * @returns {string} A hex color code.
                 */
                function getPopulationColor(population: number): string {
                    if (typeof population !== 'number' || population < 0) {
                        return '#555555'; // Gray for no data (e.g., -99)
                    }
                    return population > 100000000 ? '#b30000' : // > 100M
                           population > 50000000  ? '#e34a33' : // > 50M
                           population > 20000000  ? '#fc8d59' : // > 20M
                           population > 10000000  ? '#fdbb84' : // > 10M
                           population > 1000000   ? '#fee8c8' : // > 1M
                                                    '#fff7ec';  // <= 1M
                }


                const defaultStyle = {
                    weight: 1,
                    opacity: 1,
                    color: 'rgba(255, 255, 255, 0.5)',
                    fillOpacity: 0.7
                };

                const highlightStyle = {
                    weight: 2,
                    color: '#FFFFFF',
                    fillOpacity: 0.9
                };
                
                function style(feature: any) {
                    // Use population estimate from the new data source ('pop_est').
                    const population = feature.properties.pop_est;
                    return {
                        ...defaultStyle,
                        fillColor: getPopulationColor(population),
                    };
                }

                function highlightFeature(e: any) {
                    const layer = e.target;

                    if (highlightedLayer) {
                        geoJsonLayer.resetStyle(highlightedLayer);
                    }

                    layer.setStyle(highlightStyle);
                    layer.bringToFront();
                    highlightedLayer = layer;
                }

                function onEachFeature(feature: any, layer: any) {
                    const population = feature.properties.pop_est;
                    // Safely format the population number, providing a fallback for missing data.
                    const popFormatted = (typeof population === 'number' && population >= 0)
                        ? population.toLocaleString()
                        : 'N/A';
                    
                    // Use the correct property 'admin' for country name from the new data source.
                    const label = `${feature.properties.admin}<br>Population: ${popFormatted}`;
                    layer.bindTooltip(label, {
                        sticky: true,
                        direction: 'top',
                        offset: [0, -10]
                    });

                    layer.on({
                        click: (e: any) => {
                            L.DomEvent.stopPropagation(e); // Prevent map click from firing
                            highlightFeature(e);
                        }
                    });
                }
                
                geoJsonLayer = L.geoJSON(data, {
                    style: style,
                    onEachFeature: onEachFeature
                }).addTo(map);

                map.on('click', () => {
                    if (highlightedLayer) {
                        geoJsonLayer.resetStyle(highlightedLayer);
                        highlightedLayer = null;
                    }
                });

                // Add a legend to the map to explain the colors.
                const legend = L.control({position: 'bottomright'});

                legend.onAdd = function () {
                    const div = L.DomUtil.create('div', 'info legend');
                    const grades = [0, 1000000, 10000000, 20000000, 50000000, 100000000];
                    const colors = [
                        '#fff7ec',
                        '#fee8c8',
                        '#fdbb84',
                        '#fc8d59',
                        '#e34a33',
                        '#b30000'
                    ];

                    div.innerHTML += '<h4>Population</h4>';

                    // Loop through population intervals and generate a label with a colored square for each.
                    for (let i = 0; i < grades.length; i++) {
                        const from = grades[i];
                        const to = grades[i + 1];
                        div.innerHTML +=
                            '<i style="background:' + colors[i] + '"></i> ' +
                            (from / 1000000) + 'M' + (to ? '&ndash;' + (to / 1000000) + 'M<br>' : '+');
                    }
                    div.innerHTML += '<br><i style="background:#555555"></i> N/A';

                    return div;
                };

                legend.addTo(map);

            } catch (e) {
                console.error("Could not load or add country GeoJSON layer:", e);
            }
        }

        addCountryLayers();

    } catch (error) {
        console.error("Failed to initialize map:", error);
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.innerHTML = `<div style="display: flex; justify-content: center; align-items: center; height: 100%; color: red; font-family: sans-serif;">Failed to load map. This may be due to browser security settings or network issues.</div>`;
        }
    }
}

// The defer attribute on the script tag in index.html ensures this code
// runs after the DOM is ready, so we can call initializeMap directly.
initializeMap();