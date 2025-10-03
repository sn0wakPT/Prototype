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

        // Add a tile layer to the map. Using OpenStreetMap as the tile provider.
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

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
