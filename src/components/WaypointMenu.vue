<!-- Copyright (c) 2023 wefhy -->

<template>
  <div style="font-size: 18px"><b>{{waypointName}}</b></div>
  <div>Coords: {{getCoords()}}</div>
  <div>Distance: {{distance}}m</div>
  <button @click="deleteWaypoint">Delete Waypoint</button>
</template>

<script>
import emitter from 'tiny-emitter/instance'
import {deg2coord, distanceToPlayer, host} from "../MapTools.js";
export default {
  name: "WaypointMenu",
  data() {
    return {
      waypointName: "BB",
      position: "AA",
      waypoint: "",
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
    getCoords() {
      return deg2coord(this.position.lat, this.position.lng)
    },
    deleteWaypoint() {
      fetch(host+"/waypoint", {
        method: 'DELETE',
        headers: {
          // 'Content-Type': 'text/plain'
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.waypoint)
      }).finally(() => {emitter.emit('refreshWaypoints')})
    }
  },
}
</script>

<style scoped>

</style>