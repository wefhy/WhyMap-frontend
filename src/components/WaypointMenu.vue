<!-- Copyright (c) 2023 wefhy -->

<template>
  <div style="font-size: 18px"><b>{{waypointName}}</b></div>
  <div>Coords: {{getCoords()}}</div>
  <div>Distance: {{distance}}m</div>

  <input type="text" v-model="waypointName" />
  <input id="color" type="color" v-model="color"/>
  <button @click="updateWaypoint">Update</button>
  <button @click="deleteWaypoint">Delete</button>
</template>

<script>
import emitter from 'tiny-emitter/instance'
import {addWaypoint, deg2coord, distanceToPlayer, host} from "../MapTools.js";
export default {
  name: "WaypointMenu",
  data() {
    return {
      waypointName: "BB",
      color: "#ff0000",
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
    },
    updateWaypoint() {
      fetch(host+"/waypoint", {
        method: 'DELETE',
        headers: {
          // 'Content-Type': 'text/plain'
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.waypoint)
      }).finally(() => {
        emitter.emit('newWaypoint', deg2coord(this.position.lat, this.position.lng), this.waypointName, this.height, this.color)
        addWaypoint({name: this.waypointName, loc: {lat: this.position.lat, lng: this.position.lng}, color: this.color})
        // emitter.emit('refreshWaypoints')
        this.waypoint.name = this.waypointName
        this.waypoint.color = this.color
      })


      // fetch(host+"/waypoint", {
      //   method: 'PUT',
      //   headers: {
      //     // 'Content-Type': 'text/plain'
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     name: this.waypointName,
      //     color: this.color,
      //     position: this.position
      //   })
      // }).finally(() => {emitter.emit('refreshWaypoints')})
    }
  },
}
</script>

<style scoped>

</style>