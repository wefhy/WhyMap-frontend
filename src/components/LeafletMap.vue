<template>
  <div id="mapContainer"> </div>
</template>

<script>
import * as L from "leaflet";
import ContextMenu from "./ContextMenu.vue";
import {createApp, defineComponent} from 'vue'
import emitter from 'tiny-emitter/instance'
import {
  deg2coord,
  dimensionVal,
  FollowPlayer, host,
  mappp,
  RealTime,
  setMap,
  setPlayerPosition,
  TileHandler, url
} from "../MapTools.js";

export const thumbnailNativeZoom = 15
export const regularNativeZoom = 17
export const detailNativeZoom = 22

export default {
  name: "LeafletMap",
  components: {
    ContextMenu
  },
  methods: {
    setupLeafletMap: function () {
      const defaultTileOptions = {
        tileSize: 256,
        fadeAnimation: false,
        attribution: '<a href="https://www.github.com/wefhy">wefhy</a>',
        noWrap: true,
        dimension: dimensionVal
        // style: {"opacity": 0.5},
        // opacity: 0.5,
        // background: "yellow",
        // transparency: 'true',
        // transparent: 'true',
        // format: 'image/png'
      }
      let config = {
        fadeAnimation: false,
        zoomSnap: 0.2,
        wheelDebounceTime: 16,
      }
      setMap(
          L.map("mapContainer", config).setView([0,0], 18, )
      )
      mappp.on('movestart', () => emitter.emit('movestart'))

      mappp.attributionControl.setPosition('topright')
      let thumbnails = L.tileLayer(url, {...defaultTileOptions, minZoom: 14, maxZoom: 20, minNativeZoom: thumbnailNativeZoom, maxNativeZoom: thumbnailNativeZoom}).addTo(mappp);
      let regularTiles = L.tileLayer(url, {...defaultTileOptions, minZoom: 17, maxZoom: 24, minNativeZoom: regularNativeZoom, maxNativeZoom: regularNativeZoom}).addTo(mappp);
      let zoomTiles = L.tileLayer(url, {...defaultTileOptions, minZoom: 21.5, maxZoom: 24, minNativeZoom: detailNativeZoom, maxNativeZoom: detailNativeZoom}).addTo(mappp);

      let thumbnailHandler = new TileHandler(thumbnails)
      let zoomTileHandler = new TileHandler(zoomTiles)
      let regularTileHandler = new TileHandler(regularTiles)

      const popup = L.popup();
      let createContextMenu = function(latlng){
        console.log(latlng);
        const mountPoint = document.createElement('div');
        const menu = defineComponent({
          extends: ContextMenu, data() {
            return {
              position: latlng
            }
          }
        })
        createApp(menu).mount(mountPoint)
        popup.setContent(
            mountPoint
        )
        popup.setLatLng(latlng);
        mappp.openPopup(popup);
      };

      mappp.on('contextmenu',pos => createContextMenu(pos.latlng));
      emitter.on('contextmenu',createContextMenu);




      let Position = L.Control.extend({
        _container: null,

        onAdd: function (map) {
          let latlng = L.DomUtil.create('div', 'mouseposition');
          latlng.onclick = () => console.log("Click!")
          this._latlng = latlng;
          return latlng;
        },

        updateHTML: function(newHtml) {
          //this._latlng.innerHTML = "Latitude: " + lat + "   Longitiude: " + lng;
          this._latlng.innerHTML = newHtml;
        }
      });

      let controlMousePosition = new Position({position: 'bottomleft'});
      let controlPlayerPosition = new Position({position: 'bottomright'});
      mappp.addControl(controlMousePosition);
      mappp.addControl(controlPlayerPosition);


      mappp.addEventListener('mousemove', (event) => {
        let xz = deg2coord(event.latlng.lat, event.latlng.lng)
        controlMousePosition.updateHTML("Mouse position: {x: " + xz[0] + ", z: " + xz[1] + "}");
      });

      let thismap = mappp

      let playerMarker = L.marker([0, 0], {rotationAngle: 45}).addTo(mappp);

      fetch(host + "/player").then(function(response) {
        return response.json();
      }).then(function(player) {
        let pos = new L.LatLng(player.position.lat, player.position.lng)
        thismap.panTo(pos, {noMoveStart: true});
      }).catch(function(reason) {
        // console.log("Booo: " + reason);
      });

      const markerHtmlStyles = `
          width: 0px;
          height: 0px;
          display: block;
          left: -.8rem;
          top: -.8rem;
          position: relative;
          border-left: 12px solid transparent;
          border-right: 12px solid transparent;
          border-top: 36px solid red;
          `
      // const n = 90
      // const icon = L.divIcon({
      //   className: "my-custom-player",
      //   html: `<span style="${markerHtmlStyles} transform: rotate(${n}deg);" />`
      // })
      //
      //
      // playerMarker.setIcon(icon)
      let lastEventsUpdate = 0
      let lastRegionUpdate = 0
      let lastThumbnailUpdate = 0
      let lastChunkUpdate = 0

      function centerOnPlayerOnce() {
        fetch(host + "/player").then(r => r.json()).then(player => {
          let pos = new L.LatLng(player.position.lat, player.position.lng)
          mappp.panTo(pos, {animate: false})
        })
      }

      let firstUpdate = true
      function updateOldTiles() {
        fetch(host + "/worldEvents/" + lastEventsUpdate).then(r => r.json()).then(updateData => {
          lastEventsUpdate = updateData.time
          let shouldReloadAll = updateData.updates.some(u => ((u === "DimensionChange") || ((u === "EnterWorld") && !firstUpdate)))
          if (shouldReloadAll) {
            lastRegionUpdate = updateData.time
            lastChunkUpdate = updateData.time
            lastThumbnailUpdate = updateData.time
            dimensionVal.item = Math.random()
            thumbnails.redraw()
            regularTiles.redraw()
            zoomTiles.redraw()
            centerOnPlayerOnce()
          }
          firstUpdate = false
        })
        if (!RealTime) return;
        fetch(host + "/lastRegionUpdates/" + lastRegionUpdate).then(r => r.json()).then(updateData => {
          lastRegionUpdate = updateData.time
          updateData.updates.forEach(update => {
            let tile = {x: update.x + (1 << (16)), y: update.z + (1 << (16)) , z: 17}
            regularTileHandler.update(tile)
          })
        })
        // fetch(host + "/lastChunkUpdates/" + lastChunkUpdate).then(r => r.json()).then(updateData => {
        //   lastChunkUpdate = updateData.time
        //   updateData.updates.forEach(update => {
        //     let tile = {x: update.x + (1 << (21)), y: update.z + (1 << (21)) , z: 22}
        //     zoomTileHandler.update(tile)
        //   })
        // })
      }

      setInterval(updateOldTiles, 1050)

      const playerUpdateInterval = 100 //ms

      function updatePlayerPosition() {
        fetch(host + "/player").then(function(response) {
          return response.json();
        }).then(function(player) {
          let pos = new L.LatLng(player.position.lat, player.position.lng)
          // thismap.removeLayer(playerMarker)
          // playerMarker = L.marker(pos, {rotationAngle: player.angle}).addTo(thismap);
          const icon = L.divIcon({
            className: "my-custom-player",
            html: `<span style="${markerHtmlStyles} transform: rotate(${player.angle}deg);" />`
          })
          if (FollowPlayer) {
            mappp.panTo(pos, {duration: playerUpdateInterval * 0.001, easeLinearity: 1.0, noMoveStart: true})
          }

          playerMarker.setIcon(icon)

          playerMarker.setLatLng(pos)
          setPlayerPosition(player.position.x, player.position.z)

          controlPlayerPosition.updateHTML( "Player position: {x:" + player.position.x.toFixed(1) + ", y:" + player.position.y.toFixed(1) + ", z:" + player.position.z.toFixed(1) + "}")
        }).catch(function(reason) {
          // console.log("Booo: " + reason);
        });
      }

      setInterval(updatePlayerPosition, playerUpdateInterval)
      }
  },
  mounted() {
    this.setupLeafletMap();
    emitter.on('centerOn', (latlng) => {
      // console.log("Centering on " + latlng)
      console.log("Centering on " + L.latLng(latlng) + "current Center: " + mappp.getCenter())
      // if(mappp.getCenter() === latlng) {
      //   mappp.setZoom(20)
      // } else {
      //   mappp.panTo(latlng)
      // }
      mappp.panTo(latlng)
    })
  },
  // async beforeMount() {
  //   mapppIsReady = true;
  // },
};

</script>

<style scoped>
#mapContainer {
  width: 100%;
  height: 100%;
}
</style>