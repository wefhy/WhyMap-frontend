import { createApp } from 'vue'
import App from './App.vue'
import "leaflet/dist/leaflet.css";
import "./main.css";
// import MapMixin from "@/mixins/MapMixin";
// import MapMixin from "./MapTools.js";

let app = createApp(App)
// app.mixin(MapMixin);
// app.provide("gloMap", [4,5])
// app.config.globalProperties.$globalMapN = 54
app.mount('#app')

// createApp({
//     extends: App,
//     mixins: [MapMixin]
// }).mount('#app')



// let globalMap = null