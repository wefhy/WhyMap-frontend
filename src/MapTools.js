import * as L from "leaflet";

import {regularNativeZoom} from "@/components/LeafletMap";

const _rad = Math.PI / 180
const _deg = 180 / Math.PI


export var mappp = "map not initialized!";


export function setMap(newMap) {
    mappp = newMap
}

function deg2normalized(lat, lng) {
    let x = (lng + 180) * (1 / 360.0)
    let y = (1 - Math.asinh(Math.tan(lat * _rad)) / Math.PI) / 2
    return [x, y]
}

export function deg2coord(lat, lng) {
    let normalized = deg2normalized(lat, lng)
    let scale = Math.pow(2, 26)
    return [
        ((normalized[0] - 0.5) * scale).toFixed(1),
        ((normalized[1] - 0.5) * scale).toFixed(1)
    ]
}

function getMapCenter() {
    let latLng = mappp.getCenter();
    return deg2coord(latLng.lat, latLng.lng);
}

export function distanceToMapCenter(x, z) {
    let mapCenter = getMapCenter()
    return Math.sqrt(Math.pow(x - mapCenter[0], 2) + Math.pow(z - mapCenter[1], 2))
}

let markers = []
let markers2 = new Map();

export function addWaypoint(entry) {
    const myCustomColour = entry.color === undefined ? 'red' : entry.color
    // const myCustomColour = '#00ff00'
    const markerHtmlStyles = `
          background-color: ${myCustomColour};
          width: 1.6rem;
          height: 1.6rem;
          display: block;
          left: -0.5rem;
          top: -1.6rem;
          position: relative;
          border-radius: 1.6rem 1.6rem 0;
          transform: rotate(45deg);
          border: 2px solid #FFFFFF`

    const icon = L.divIcon({
        className: "my-custom-pin",
        // iconAnchor: [0, 24],
        // labelAnchor: [-6, 0],
        // popupAnchor: [0, -36],
        html: `<span style="${markerHtmlStyles}" />`
    })
    // markers.push();
    markers2.set(entry.id, L.marker([entry.loc.lat, entry.loc.lng], {icon: icon}).addTo(mappp).bindPopup(entry.name))
}

export function popupWaypoint(i) {
    // markers[i].openPopup()
    markers2.get(i).openPopup()
}

export function clearWaypoints() {
    for (let marker of markers2.values()) {
        mappp.removeLayer(marker)
    }
    // for (let marker of markers) {
    //     mappp.removeLayer(marker)
    // }
    // markers = []
}

let debugGrid = L.GridLayer.DebugCoords = L.GridLayer.extend({
    createTile: function (coords) {
        var tile = document.createElement('div');
        tile.innerHTML = [coords.x - (1 << (coords.z - 1)), coords.y - (1 << (coords.z - 1))].join(', ');
        tile.style.outline = '1px solid red';
        tile.style.fontSize = "16px";
        tile.style.textAlign = "center"
        return tile;
    }
});

L.gridLayer.debugCoords = function(opts) {
    return new L.GridLayer.DebugCoords(opts);
};

let debugLayer =  L.gridLayer.debugCoords({minZoom: 16.5, maxZoom: 20, minNativeZoom: regularNativeZoom, maxNativeZoom: regularNativeZoom})

export function enableDebugGrid() {
    mappp.addLayer(debugLayer);
}

export function disableDebugGrid() {
    mappp.removeLayer(debugLayer)
}