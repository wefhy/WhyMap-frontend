<template>
  <div class="custom-select">
<!--        <div class="label">Sorting by {{sorting}}, reverse: {{reverse}}, continuous: {{continuous}}</div>-->
    <div id="search-div" class="inline-container">
      <label for="search">Search:</label>
      <input id="search" type="text" v-model="search">
    </div>
    <div class="inline-container">
      <input type="checkbox" id="reverse" value="Reverse" v-model="reverse">
      <label for="reverse">Reverse</label>


      <input type="checkbox" id="continuous" value="Continuous" v-model="continuous">
      <label for="continuous">Continuous</label>

      <!--    <div id="buttonSpace">-->
      <button id="sortButton" v-if="!continuous" @click="sort()">Re-sort</button>
      <!--    </div>-->
    </div>

    <select v-model="sorting">
      <option value="name">Name</option>
      <option value="player">Distance to player</option>
      <option value="map">Distance to map position</option>
<!--      <option value="recent">Recent</option>-->
      <option value="newest">Newest</option>
    </select>
  </div>
  <transition-group name="flip-list" tag="div">
    <WaypointButton v-for="waypoint in filteredItems" :key="waypoint.id" :waypoint-name="waypoint.name" :coords="waypoint.pos" :show-distance="showDistance" @click="centerOn(waypoint.id, waypoint.loc)"></WaypointButton>
  </transition-group>
  <div style="padding: 8px">
    <label for="myfile">Add more waypoints (xaero format):</label>
    <input  type="file" id="myfile" name="myfile" accept="text/plain" @change="uploadWaypoints">
  </div>
  <div style="padding: 8px">
    <input type="checkbox" id="debugGrid" value="Debug Grid" v-model="debugGrid">
    <label for="debugGrid">Debug Grid</label>
  </div>
  <div style="padding: 8px">
    <input type="checkbox" id="showDistance" value="Show Distance" v-model="showDistance">
    <label for="showDistance">Show Distance (reenable to update)</label>
  </div>

</template>

<script>
import WaypointButton from "@/components/WaypointButton";
import _ from "lodash";
import {addWaypoint, clearWaypoints, disableDebugGrid, distanceToMapCenter, distanceToPlayer, enableDebugGrid, popupWaypoint} from "@/MapTools";
import emitter from 'tiny-emitter/instance'

let interval = null
export default {
  name: "SideBar",
  components: {WaypointButton},
  data() {
    return {
      sorting: 'name',
      search: "",
      continuous: false,
      showDistance: false,
      reverse: false,
      debugGrid: false,
      nextId: 0,
      waypoints: []
    }
  },
  computed: {
    filteredItems() {
      return this.waypoints.filter(item => {
        return item.name.toLowerCase().indexOf(this.search.toLowerCase()) > -1
        //TODO search should also make waypoints disappear visually from the map!
      })
    }
  },
  methods: {
    sortByName() {
      console.log(this.waypoints)
      this.waypoints = _.orderBy(this.waypoints, [waypoint => waypoint.name.toLowerCase()], [this.reverse ? 'desc' : 'asc'])
    },
    sortByNewest() {
      this.waypoints = _.orderBy(this.waypoints, [waypoint => waypoint.id], [this.reverse ? 'asc' : 'desc'])
    },
    sortByPlayerDistance() {
      this.waypoints = _.orderBy(this.waypoints, [waypoint => distanceToPlayer(waypoint.pos.x, waypoint.pos.z)], [this.reverse ? 'desc' : 'asc'])
    },
    sortByMapDistance() {
      this.waypoints = _.orderBy(this.waypoints, [waypoint => distanceToMapCenter(waypoint.pos.x, waypoint.pos.z)], [this.reverse ? 'desc' : 'asc'])
    },
    fetchWaypoints() {
      fetch("http://localhost:7542/waypoints")
          .then(response => {let tmp = response.json();console.log(tmp); return tmp})
          .then(data => {
            this.waypoints = data.map((value, i) => {value.id = i; return value
            })
            this.sort()
          })
          .then(() => {
            clearWaypoints()
            for (let waypoint of this.waypoints) {
              addWaypoint(waypoint)
            }
          })
    },
    centerOn(i, latLng) {
      popupWaypoint(i)
      emitter.emit('centerOn', latLng)
    },
    shuffle() {
      this.waypoints = _.shuffle(this.waypoints)
    },
    sort() {
      console.log("sorting by: " + this.sorting + ", reverse: " + (this.reverse ? 'yes' : 'no') + this.reverse)
      switch(this.sorting) {
        case 'name': this.sortByName(); break;
        case 'newest': this.sortByNewest(); break;
        case 'player': this.sortByPlayerDistance(); break;
        case 'map': this.sortByMapDistance(); break;
      }
    },
    uploadWaypoints(event) {
      let tthis = this
      let reader = new FileReader();
      reader.onload =  function(e){
        let waypoints = e.target.result
        // console.log(reader.result)
        // console.log(reader.result.split('\n'))
        fetch("http://localhost:7542/importWaypoints", {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain'
            // 'Content-Type': 'application/json'
          },
          // body: JSON.stringify(waypoints)
          body: waypoints
        }).finally(() => {tthis.fetchWaypoints()})
      };
      let file = event.target.files[0]
      // console.log(file);
      reader.readAsText(file)
    }
  },
  mounted() {
    if (localStorage.sorting) {
      this.sorting = localStorage.sorting;
    }
    if (localStorage.continuous) {
      this.continuous = localStorage.continuous === 'true';
    }
    if (localStorage.reverse) {
      this.reverse = localStorage.reverse === 'true';
    }
    if (localStorage.debugGrid) {
      this.debugGrid = localStorage.debugGrid === 'true';
    }
    if (localStorage.showDistance) {
      this.showDistance = localStorage.showDistance === 'true';
    }
    this.fetchWaypoints()

    emitter.on('newWaypoint', (coords, name) => {
      console.log("Creating new waypoint "+ name +" on " + coords)
      let newWaypoint = {
        id: this.waypoints.length,
        name: name,
        pos: {
          x: Math.floor(coords[0]),
          y: 60,//TODO get position from map!
          z: Math.floor(coords[1])
        }
      }
      this.waypoints.push(newWaypoint)
      this.sort()
      fetch("http://localhost:7542/waypoint", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newWaypoint)
      })
    })
  },
  watch: {
    continuous(newContinuous) {
      localStorage.continuous = newContinuous
      if (newContinuous) {
        interval = setInterval(this.sort, 500);
        console.log("set interval")
      } else {
        clearInterval(interval);
        console.log("clear interval")
      }
    },
    reverse(newReverse) {
      localStorage.reverse = newReverse
      this.sort()
    },
    sorting(newSorting) {
      localStorage.sorting = newSorting
      this.sort()
    },
    debugGrid(newDebugGrid) {
      localStorage.debugGrid = newDebugGrid
      if (newDebugGrid)
        enableDebugGrid()
      else
        disableDebugGrid()
    },
    showDistance(newShowDistance) {
      localStorage.showDistance = newShowDistance
    }
  }
}
</script>

<style scoped>

label {
  margin: 0 1em 0 .4em;
}
.label {
  text-align: center;
  margin-bottom: 8px;
  width: 100%;
}

.custom-select {
  /*display: flex;*/
  /*justify-content: center;*/
  /*width: 100%;*/
  /*display: block;*/
  /*margin: 0 auto;*/
  /*overflow: hidden;*/
  padding: 8px;
}

.flip-list-move {
  transition: transform 0.4s;
}

#search {
  color: white;
  background: #222222;
  padding: 2px;
  width: 100%;
}

#search-div {
  margin: 4px 4px 8px;
}

#sortButton {
  color: white;
  padding: 4px;
  background: black;
  border-radius: 4px;
  width: 100%;
  display: inline-block;
  overflow: hidden;
  float:none
}
.inline-container {
  display: flex;
}

* select {
  text-align: center;
  border: 1px solid;
  font-size: 12pt;
  border-radius: 4px;
  padding: 0.4em 0.6em;
  /*margin: 8px;*/
  /*margin-top: 10px;*/
  /*background: transparent;*/
  background: #eeeeee11;
  color: white;
  transition: background-color .5s;
  width: 100%;
  margin-top: 8px;
  /*left: 50%;*/
  /*right: 50%;*/
}

#sidebar {
  width: 320px;
  overflow: scroll;
  background-color: black;
}
</style>