<template>
  <div id="mapContainer"> </div>
</template>

<script>
import * as L from "leaflet";
import ContextMenu from "@/components/ContextMenu";
import {createApp, defineComponent} from 'vue'
import emitter from 'tiny-emitter/instance'
import {deg2coord, setMap} from "@/MapTools";

const host = "http://localhost:7542"
const url = host + "/tiles/{z}/{x}/{y}"
const defaultTileOptions = {
  tileSize: 256,
  attribution: '<a href="https://www.github.com/wefhy">wefhy</a>',
  noWrap: true
}
const thumbnailNativeZoom = 15
const regularNativeZoom = 17
const detailNativeZoom = 22

export default {
  name: "LeafletMap",
  components: {
    ContextMenu
  },
  data() {
    return {
      map: null
    };
  },
  methods: {
    setupLeafletMap: function () {
      // let config = {
      //   fadeAnimation: false,
      //   zoomSnap: 0,
      //   wheelDebounceTime: 16,
      // }
      this.map = L.map("mapContainer").setView([0,0], 18, )
      setMap(this.map)
      this.map.attributionControl.setPosition('topright')
      let thumbnails = L.tileLayer(url, {...defaultTileOptions, minZoom: 14, maxZoom: 20, minNativeZoom: thumbnailNativeZoom, maxNativeZoom: thumbnailNativeZoom}).addTo(this.map);
      let regularTiles = L.tileLayer(url, {...defaultTileOptions, minZoom: 17, maxZoom: 24, minNativeZoom: regularNativeZoom, maxNativeZoom: regularNativeZoom}).addTo(this.map);
      let zoomTiles = L.tileLayer(url, {...defaultTileOptions, minZoom: 22, maxZoom: 24, minNativeZoom: detailNativeZoom, maxNativeZoom: detailNativeZoom}).addTo(this.map);

      const popup = L.popup();
      let tthis = this
      this.map.on('contextmenu',function(latlng){
        console.log(latlng);
        const mountPoint = document.createElement('div');

        const menu = defineComponent({
          extends: ContextMenu, data() {
            return {
              position: latlng.latlng
            }
          }
        })
        createApp(menu).mount(mountPoint)
        popup.setContent(
            mountPoint
        )
        popup.setLatLng(latlng.latlng);
        tthis.map.openPopup(popup);

      });




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
      this.map.addControl(controlMousePosition);
      this.map.addControl(controlPlayerPosition);


      this.map.addEventListener('mousemove', (event) => {
        let xz = deg2coord(event.latlng.lat, event.latlng.lng)
        controlMousePosition.updateHTML("Mouse position: {x: " + xz[0] + ", z: " + xz[1] + "}");
      });

      let thismap = this.map

      let playerMarker = L.marker([0, 0], {rotationAngle: 45}).addTo(this.map);

      fetch(host + "/player").then(function(response) {
        return response.json();
      }).then(function(player) {
        let pos = new L.LatLng(player.position.lat, player.position.lng)
        thismap.panTo(pos);
      }).catch(function(reason) {
        console.log("Booo: " + reason);
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


          playerMarker.setIcon(icon)

          playerMarker.setLatLng(pos)

          controlPlayerPosition.updateHTML( "Player position: {x:" + player.position.x.toFixed(1) + ", y:" + player.position.y.toFixed(1) + ", z:" + player.position.z.toFixed(1) + "}")
        }).catch(function(reason) {
          console.log("Booo: " + reason);
        });
      }

      setInterval(updatePlayerPosition, 500)
























    }
  },
  mounted() {
    this.setupLeafletMap();
    emitter.on('centerOn', (latlng) => {
      // console.log("Centering on " + latlng)
      console.log("Centering on " + L.latLng(latlng) + "current Center: " + this.map.getCenter())
      // if(this.map.getCenter() === latlng) {
      //   this.map.setZoom(20)
      // } else {
      //   this.map.panTo(latlng)
      // }
      this.map.panTo(latlng)
    })
  },
  // async beforeMount() {
  //   this.mapIsReady = true;
  // },
};

</script>

<style scoped>
#mapContainer {
  width: 100%;
  height: 100%;
}
</style>