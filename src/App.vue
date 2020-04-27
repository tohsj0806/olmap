<template>
  <div id="app">
    <div>
      <button @click="addMarker('crosshair')" style="height:40px;width:150px">监听鼠标点击新增标注</button>
      <button @click="addMarker('pointer')" style="height:40px;width:150px">停止鼠标点击事件</button>
      <button @click="setMarker()" style="height:40px;width:150px">新增一个标注</button>
      <button @click="setMarkers()" style="height:40px;width:150px">新增多个</button>
      <button @click="$refs.map.removeMarker('beijing')" style="height:40px;width:150px">清除某个坐标</button>
      <button @click="$refs.map.clearMap()" style="height:40px;width:150px">清空地图坐标</button>
    </div>
    <ol-map class="map" :modal="modal" ref="map" :zoom="zoom" :center="center" :mapSource="mapSource"/>
  
  </div>
</template>

<script>
import olMap from './components/olMap.vue'

export default {
  name: 'App',
  components: {
    olMap
  },
  data(){
    return {
      zoom:9,
      center: [116.28, 39.54],
      mapSource: 'https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}',
      modal:{
        cursorStyle: "pointer",
        markerIcon: require('./assets/station.png'),
      }
    }
  },
  methods:{
    addMarker(val){
      this.modal.cursorStyle = val
    },
    setMarker(){
     this.$refs.map.clearMap()
     let beijing = [116.28, 39.54]
     let marker = {
        id: "beijing",
        position: beijing,
        title:"北京",
        icon: require('./assets/station.png'),
        content: "<div class='card'><div class='pop-up-top'>" +
                    "<span class='pop-up-tit f-left'><strong>北京</strong></span>" +
                    "</div>" +
                    "<div style='width:100%;height:1px;border-top:solid rgb(85,85,85) 1px;'></div>"+
                    "<div class='pop-up-middle'>" +
                    "<div class='row-fluid'><label>站点简称：</label><span>xzd</span></div>" +
                    "<div class='row-fluid'><label>站点半径：</label><span>500</span></div>" +
                    "<div class='row-fluid'><label>站点类型：</label><span>营业部</span></div>" +
                    "<div class='row-fluid'><label>联系人：</label><span>李66</span></div>" +
                    "<div class='row-fluid'><label>联系电话：</label><span>1867876788</span></div>" +
                    "</div>" +
                    "</div>"
     }
     this.$refs.map.setMarker(marker)
 
    },
    setMarkers(){
      this.$refs.map.clearMap()
      let beijing = [116.28, 39.54]
      let changsha = [113,	28.21]
      let markers = [{
        id: "beijing",
        position: beijing,
        title:"北京",
        icon: require('./assets/station.png'),
        content: "<div class='card'><div class='pop-up-top'>" +
                    "<span class='pop-up-tit f-left'><strong>北京</strong></span>" +
                    "</div>" +
                    "<div style='width:100%;height:1px;border-top:solid rgb(85,85,85) 1px;'></div>"+
                    "<div class='pop-up-middle'>" +
                    "<div class='row-fluid'><label>站点简称：</label><span>xzd</span></div>" +
                    "<div class='row-fluid'><label>站点半径：</label><span>500</span></div>" +
                    "<div class='row-fluid'><label>站点类型：</label><span>营业部</span></div>" +
                    "<div class='row-fluid'><label>联系人：</label><span>李66</span></div>" +
                    "<div class='row-fluid'><label>联系电话：</label><span>1867876788</span></div>" +
                    "</div>" +
                    "</div>"
      },{
        id: "changsha",
        position: changsha,
        title: "长沙",
        icon: require('./assets/station.png'),
        content: "<div class='card'><div class='pop-up-top'>" +
                    "<span class='pop-up-tit f-left'><strong>长沙</strong></span>" +
                    "</div>" +
                    "<div style='width:100%;height:1px;border-top:solid rgb(85,85,85) 1px;'></div>"+
                    "<div class='pop-up-middle'>" +
                    "<div class='row-fluid'><label>站点简称：</label><span>xzd</span></div>" +
                    "<div class='row-fluid'><label>站点半径：</label><span>500</span></div>" +
                    "<div class='row-fluid'><label>站点类型：</label><span>营业部</span></div>" +
                    "<div class='row-fluid'><label>联系人：</label><span>李66</span></div>" +
                    "<div class='row-fluid'><label>联系电话：</label><span>1867876788</span></div>" +
                    "</div>" +
                    "</div>"
      }]
      this.$refs.map.setMarkers(markers)
      this.center = changsha
      this.zoom = 5

    }
  }
}
</script>

<style>
*{padding:0; margin:0;}
html,body{
  height: 100%;
}
#app {
  display: flex;
  height: 100%;
  flex-direction: column;
}
.map{
  flex: 1;
}
.card {
  width: 190px;
}
.card>.pop-up-middle{
    color: #555555;
    font-size: 12px;
    padding-right:0px; 
    padding-bottom: 0px;
}
.pop-up-middle>.row-fluid{
    line-height: 1.5em;
    margin: 5px 10px;
}
.row-fluid>label{
    width:70px;
    display: inline-block;
    text-align: right;
}
.row-fluid>span{
    display:inline !important;
}
</style>
