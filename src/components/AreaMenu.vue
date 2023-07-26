<!-- Copyright (c) 2023 wefhy -->

<template>
    <div>Area: {{ areaStart }} - {{ areaEnd }}</div>
    <div>Size: {{ size }} ({{width}}x{{height}})</div>
    <select v-model="format">
        <option value="jpeg">JPEG</option>
        <option value="png">PNG</option>
        <option value="webp" disabled="disabled">WEBP</option>
        <option value="tiff" disabled="disabled">TIFF</option>
        <option value="gif" disabled="disabled">GIF</option>
        <option value="bmp" disabled="disabled">BMP</option>
    </select>
    <select v-model="scale">
        <option value="0.0625" disabled="disabled">1/16x</option>
        <option value="0.125" disabled="disabled">1/8x</option>
        <option value="0.25" disabled="disabled">1/4x</option>
        <option value="0.5" disabled="disabled">1/2x</option>
        <option value="1">1x</option>
        <option value="2" disabled="disabled">2x</option>
        <option value="4" disabled="disabled">4x</option>
        <option value="8" disabled="disabled">8x</option>
        <option value="16">16x</option>
    </select>
    <div>Resolution: {{ outX }}x{{ outY }} ({{ megapixel }}MP)</div>
    <button @click="exportArea">Export area</button>
    <button @click="showStats">Show statistics</button>
    <button @click="browseIn3d">Browse in 3D</button>
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
            scale: 1,
            width: "calculating...",
            height: "calculating...",
            areaStart: "calculating...",
            areaEnd: "calculating...",
            size: "calculating..."
        }
    },
    computed: {
        outX() {
            return Math.ceil(this.width * parseFloat(this.scale))
        },
        outY() {
            return Math.ceil(this.height * parseFloat(this.scale))
        },
        megapixel() {
            return (this.outX * this.outY / 1000000).toFixed(1)
        }
    },
    methods: {
        showStats() {
            fetch(`${host}/analyzeArea/${this.areaStart[0]}/${this.areaStart[1]}/${this.areaEnd[0]}/${this.areaEnd[1]}`)
                .then(response => response.text())
                .then(data => {
                    alert(data)
                })
        },
        exportArea() {
            open(`${host}/exportArea/${this.areaStart[0]}/${this.areaStart[1]}/${this.areaEnd[0]}/${this.areaEnd[1]}/${this.format}/${this.scale}`, '_blank').focus()
            // fetch(`${host}/exportArea/${this.areaStart[0]}/${this.areaStart[1]}/${this.areaEnd[0]}/${this.areaEnd[1]}/${this.format}`)
        },
        browseIn3d() {
            open(`${host}/three/index.html?x1=${this.areaStart[0]}&z1=${this.areaStart[1]}&x2=${this.areaEnd[0]}&z2=${this.areaEnd[1]}`, '_blank').focus()
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