<template>
  <div>Coords: {{getCoords()}}</div>
  <div>Block: {{block}}</div>
  <div>Distance: {{distance}}m</div>
  <div>Overlay: {{overlay}}</div>
  <div>Biome: {{biome}}</div>
  <div>Height: {{height}}</div>
  <div>Depth: {{depth}}</div>
  <div>Light: {{light}}</div>
  <button @click="centerOn">Center on</button>
  <button @click="newWaypoint">Create new waypoint</button>
</template>

<script>
import emitter from 'tiny-emitter/instance'
import {addWaypoint, deg2coord, distanceToPlayer} from "@/MapTools";
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
      emitter.emit('newWaypoint', deg2coord(this.position.lat, this.position.lng), name)
      addWaypoint({name: name, loc: {lat: this.position.lat, lng: this.position.lng}})
    },
    getCoords() {
      return deg2coord(this.position.lat, this.position.lng)
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
    fetch(`http://localhost:7542/block/${Math.floor(coords[0])}/${Math.floor(coords[1])}`)
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