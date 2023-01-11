<template>
<!--  <img alt="Vue logo" src="./assets/logo.png">-->
 <div id="container">
   <div id="maphere" class="inline">
     <LeafletMap/>
   </div>
   <div id="sidebar" class="inline">
     <SideBar/>
   </div>
 </div>
</template>

<script>
import SideBar from './components/SideBar.vue'
import LeafletMap from "./components/LeafletMap.vue";

export default {
  name: 'App',
  components: {
    LeafletMap,
    SideBar
  }
}
</script>

<style>
* {
  margin: 0
}
html {
  background-color: black;
  color:white;
}
#container {
  width: 100vw;
  height: 100vh;
  display: flex;
}

#maphere {
  height: 100vh;
  width: calc(100vw - 320px);
  background: #004444;
}

#sidebar {
  /*float:right;*/
  height: 100vh;
  width: 325px;
  overflow: scroll;
}
.inline {
  /*display: inline-block;*/
}



/*#container {*/
/*  width: 100vw;*/
/*  height: 100vh;*/
/*  overflow: hidden;*/
/*  !*width: 100%;*!*/
/*  display: table;*/
/*  !*height: 100vh;*!*/
/*}*/
/*.sidebar {*/
/*  !*position: fixed;*!*/
/*  top: 0;*/
/*  bottom: 0;*/
/*  float:right;*/
/*  width: 320px;*/
/*  !*height: 100vh;*!*/
/*  !*max-height: 100%;*!*/
/*  overflow-y: scroll;*/
/*  !*overflow-y:auto;*!*/
/*  background-color: black;*/
/*}*/
/*.inline {*/
/*  display: table-cell;*/
/*  !*display: inline-block;*!*/
/*  !*border: 1px solid red;*!*/
/*}*/
/*#maphere {*/
/*  !*position: relative;*!*/
/*  !*float:left;*!*/
/*  overflow: hidden;*/
/*  background: yellowgreen;*/
/*  width: 100vw;*/
/*  height: fit-content;*/
/*  !*height: 10%;*!*/
/*}*/
/*#app {*/
/*  font-family: Avenir, Helvetica, Arial, sans-serif;*/
/*  -webkit-font-smoothing: antialiased;*/
/*  -moz-osx-font-smoothing: grayscale;*/
/*  text-align: center;*/
/*  color: #2c3e50;*/
/*  !*margin-top: 60px;*!*/

/*}*/
</style>
