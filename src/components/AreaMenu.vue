<!-- Copyright (c) 2023 wefhy -->

<template>
  <div>Area: {{ areaStart }} - {{ areaEnd }}</div>
  <div>Szie: {{ size }} ({{width}}x{{height}})</div>
    <select v-model="format">
        <option value="jpeg">JPEG</option>
        <option value="png">PNG</option>
    </select>
  <button @click="exportArea">Export area</button>
<!--  <button @click="showStats">Show statistics</button>-->

</template>

<script>
import {deg2coord, deg2coordInt, host} from "../MapTools";

export default {
    name: "AreaMenu",
    data() {
        return {
            posStart: "AA",
            posEnd: "BB",
            format: "jpeg",
            width: "calculating...",
            height: "calculating...",
            areaStart: "calculating...",
            areaEnd: "calculating...",
            size: "calculating..."
        }
    },
    methods: {
        showStats() {
            fetch(`${host}/getAreaStats/${this.areaStart[0]}/${this.areaStart[1]}/${this.areaEnd[0]}/${this.areaEnd[1]}`)
                .then(response => response.json())
                .then(data => {
                    alert(JSON.stringify(data))
                })
        },
        exportArea() {
            open(`${host}/exportArea/${this.areaStart[0]}/${this.areaStart[1]}/${this.areaEnd[0]}/${this.areaEnd[1]}/${this.format}`, '_blank').focus()
            // fetch(`${host}/exportArea/${this.areaStart[0]}/${this.areaStart[1]}/${this.areaEnd[0]}/${this.areaEnd[1]}/${this.format}`)
        }
    },
    mounted() {
        this.areaStart = deg2coordInt(this.posStart.lat, this.posStart.lng)
        this.areaEnd = deg2coordInt(this.posEnd.lat, this.posEnd.lng)
        this.width = Math.abs(this.areaEnd[0] - this.areaStart[0])
        this.height = Math.abs(this.areaEnd[1] - this.areaStart[1])
        this.size = this.width * this.height
    }
}
</script>

<style scoped>

</style>