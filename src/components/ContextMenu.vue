<template>
  <div>Coords: {{getCoords()}}</div>
  <div>Distance: {{distance}}m</div>
  <div>Block: {{block}}</div>
  <div>Overlay: {{overlay}}</div>
  <div>Biome: {{biome}}</div>
  <div>Height: {{height}}</div>
  <div>Depth: {{depth}}</div>
<!--  <div>Raw: {{position}}</div>-->
<!--  <div>Light: {{light}}</div>-->
  <button @click="centerOn">Center on</button>
  <button @click="newWaypoint">Create new waypoint</button>
  <button @click="reloadTile">Reload tile</button>
  <br>
  <button @click="browse3dSmall">Browse small area in 3D</button>
  <button @click="browse3dBig">Browse big area in 3D</button>
<!--  <button @click="reloadTile">Force reload tile</button>-->
</template>

<script>
import emitter from 'tiny-emitter/instance'
import {addWaypoint, deg2coord, distanceToPlayer, host} from "../MapTools.js";
export default {
  name: "ContextMenu",
  data() {
    return {
      message: "BB",
      position: "AA",
      block: "fetching...",
      overlay: "fetching...",
      biome: "fetching...",
      height: "fetching...",
      depth: "fetching...",
      light: "fetching..."
    }
  },
  computed: {
    distance() {
      let xz = deg2coord(this.position.lat, this.position.lng)
      return distanceToPlayer(xz[0], xz[1]).toFixed(1)
    }
  },
  methods: {
    centerOn() {
      // console.log("should center on?")
      emitter.emit('centerOn', this.position)
    },
    newWaypoint() {
      let name = prompt("Select name for the waypoint:", "");
      emitter.emit('newWaypoint', deg2coord(this.position.lat, this.position.lng), name, this.height)
      addWaypoint({name: name, loc: {lat: this.position.lat, lng: this.position.lng}})
    },
    reloadTile() {
      let coords = this.getCoords()
      fetch(`${host}/reloadTileWithBlock/${Math.floor(coords[0])}/${Math.floor(coords[1])}`)
    },
    getCoords() {
      return deg2coord(this.position.lat, this.position.lng)
    },
    browse3dSmall() {
      let coords = this.getCoords()
      open(`${host}/three/browseSmall?x=${coords[0]}&z=${coords[1]}`, '_blank').focus()
    },
    browse3dBig() {
      let coords = this.getCoords()
      open(`${host}/three/browseBig?x=${coords[0]}&z=${coords[1]}`, '_blank').focus()
    },
    getBiome() {
      return "not implemented yet"
    },
    getBlock() {
      return "not implemented yet"
    },
    getHeight() {
      return "not implemented yet"
    }

  },
  mounted() {
    let coords = this.getCoords()
    fetch(`${host}/block/${Math.floor(coords[0])}/${Math.floor(coords[1])}`)
        .then(response => response.json())
        .then(data => {
          this.block = data.block
          this.biome = data.biome
          this.height = data.height
          this.depth = data.depth
          this.overlay = data.overlay
          this.light = data.light
        })
  }
}
</script>

<style scoped>

</style>