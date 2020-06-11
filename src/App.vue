<template>
  <div id="app">
    <div>
      <button @click="addMarker('crosshair')" style="height:40px;width:150px">监听鼠标点击新增标注</button>
      <button @click="addMarker('pointer')" style="height:40px;width:150px">停止鼠标点击事件</button>
      <button @click="setMarker()" style="height:40px;width:150px">新增一个标注</button>
      <button @click="setMarkers()" style="height:40px;width:150px">新增多个</button>
      <button @click="$refs.map1.removeMarker('beijing')" style="height:40px;width:150px">清除某个坐标</button>
      <button @click="$refs.map1.clearMap()" style="height:40px;width:150px">清空地图坐标</button>
      <button @click="setRoute()" style="height:40px;width:150px">邮路规划</button>
      <button @click="setPolyline()" style="height:40px;width:150px">显示轨迹</button>
      <button @click="$refs.map3.startAnimation(true)" style="height:40px;width:150px">播放轨迹</button>
      <button @click="$refs.map3.pauseAnimation()" style="height:40px;width:150px">暂停播放</button>
      <button @click="$refs.map3.startAnimation(false)" style="height:40px;width:150px">继续播放</button>
      <button @click="$refs.map3.setCenter([114.30, 30.60])" style="height:40px;width:150px">设置中心点</button>
      <button @click="setSpeed(100)" style="height:40px;width:50px">慢速</button>
      <button @click="setSpeed(50)" style="height:40px;width:50px">中速</button>
      <button @click="setSpeed(10)" style="height:40px;width:50px">快速</button>
      <button @click="gjms=false" style="height:40px;width:150px">轨迹模式-单一</button>
      <button @click="gjms=true" style="height:40px;width:150px">轨迹模式-速度</button>
      <button @click="cljz=!cljz" style="height:40px;width:150px">车辆居中</button>
      <button @click="xxcgs=!xxcgs" style="height:40px;width:150px">信息窗跟随</button>
      <button @click="$refs.map3.previousAnimation()" style="height:40px;width:150px">上一条</button>
      <button @click="$refs.map3.previousNextAnimation()" style="height:40px;width:150px">下一条</button>
      <button @click="setClusterPoints()" style="height:40px;width:150px">动态聚合</button>{{mapShow}}
    </div>
    <ol-map v-show="mapShow==1" class="map" :modal="modal" ref="map1" :zoom="zoom" 
    :center="center" :mapSource="mapSource" @positionResult="getPostionResult"/>
    <clusterMap ref="map2" class="map" v-show="mapShow==2"/>
    <trackThePlaybackMap ref="map3" class="map"  :xxcgs="xxcgs" :gjms="gjms" :cljz="cljz" :speed="speed" v-show="mapShow==3"/>
  </div>
</template>

<script>
import olMap from './components/olMap.vue'
import clusterMap from './components/clusterMap.vue'
import trackThePlaybackMap from './components/trackThePlaybackMap.vue'
import mapMinxin from "./base/mapUtils.js"
export default {
  name: 'App',
  components: {
    //olMap,clusterMap
  },
   mixins: [mapMinxin],
  data(){
    return {
      mapShow:3, // 测试olmaop 1，clusterMap 2,trackThePlaybackMap:3
      zoom:11,
      gjms:false,
      cljz:false,
      xxcgs:false,
      speed:10,
      center: [116.28, 39.54],
      mapSource: 'https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}',
      modal:{
        cursorStyle: "pointer",
        markerIcon: require('./assets/station.png'),
      }
    }
  },
  methods:{
    getPostionResult(val){
      alert(val)
    },
    setSpeed(value){
      this.speed = value
    },
    pointListType(pointList){
      let ponitLists=[]
      pointList.forEach(item=>{
        let point ={}
        point.speed = item.Speed
        point.title= "川ZD0667"
        point.position = [item.Lon,item.Lat]
         var img = this.getMarkerIconByType(this.getDirectionByAngle(item.Fx).jd);
        point.icon = require('./assets/' + img)
        point.content=`<div class='gjhf-card'>
                      <table border class='table table-bordered'>
                      <tbody>
                      <tr>
                       <td style="font-weight:bold;text-align: center;">里程</td><td style="text-align: center;display:block;">0.7公里</td> <td style="font-weight:bold;text-align: center;">时长</td><td style="text-align: center;display:block;">0.7公里</td>
                      </tr>
                       <tr>
                       <td style="font-weight:bold;text-align: center;">速度</td><td style="text-align: center;display:block;">0.7公里</td> <td style="font-weight:bold;text-align: center;">ACC</td><td style="text-align: center;display:block;">0.7公里</td>
                      </tr>
                       <tr>
                       <td style="font-weight:bold;text-align: center;">位置</td><td style="text-align: center;display:block;">0.7公里</td> <td style="font-weight:bold;text-align: center;">方向</td><td style="text-align: center;display:block;">0.7公里</td>
                      </tr>
                       <tr>
                       <td style="font-weight:bold;text-align: center;">时间</td><td style="text-align: center;display:block;">2020-05-09 09:05:00</td> <td style="font-weight:bold;text-align: center;">位置</td><td style="text-align: center;display:block;">0.7公里</td>
                      </tr>
                       <tr>
                       <td style="font-weight:bold;text-align: center;">来源</td><td style="text-align: center;display:block;">0.7公里</td> 
                      </tr>
                      </tbody>
            </div>`,
        ponitLists.push(point)
      })
      return ponitLists
    },
    stationListType(stationList){
      let stationLists=[]
      
      stationList.forEach(item=>{
        let station ={}
        station.icon = require('./assets/station.png')
        station.id = item.id
        station.position = [item.zdjd,item.zdwd]
        station.title = item.zdmc
        station.content="<div class='card'><div class='pop-up-top'>" +
                    "<span class='pop-up-tit f-left'><strong>"+item.zdmc+"</strong></span>" +
                    "</div>" +
                    "<div style='width:100%;height:1px;border-top:solid rgb(85,85,85) 1px;'></div>"+
                    "<div class='pop-up-middle'>" +
                    "<div class='row-fluid'><label>站点简称：</label><span>"+item.zdjc+"</span></div>" +
                    "<div class='row-fluid'><label>站点半径：</label><span>"+item.zdbj+"</span></div>" +
                    "<div class='row-fluid'><label>站点类型：</label><span>"+item.zdlx+"</span></div>" +
                    "<div class='row-fluid'><label>联系人：</label><span>"+item.lxr+"</span></div>" +
                    "<div class='row-fluid'><label>联系电话：</label><span>"+item.lxdh+"</span></div>" +
                    "</div>" +
                    "</div>",
        stationLists.push(station)
      })
      return stationLists
    },
     initData(trackList,stationList){ //处理数据
      this.$refs.map3.setPolyline(this.stationListType(stationList),this.pointListType(trackList))
        },
    setPolyline(){
      let gj = require("./base/gj.json")
      let station = require("./base/rw.json")
      this.initData(gj.data.rows,station.data.rwmx)
    },
    setRoute(){
       let routeCoords =
                    [[120.97202539443971,29.149083495140076],[120.97365617752077,29.147656559944153],[120.97478270530702,29.146594405174255],
                        [120.97543716430665,29.14593994617462],[120.97596287727357,29.145285487174988],[120.9764349460602,29.144577383995056],
                        [120.97669243812561,29.14408653974533],[120.97699284553528,29.143426716327667],[120.97723960876465,29.142654240131378],
                        [120.97735226154329,29.142230451107025],[120.97756683826448,29.141243398189545],[120.97781896591188,29.140020310878754],
                        [120.97790479660036,29.139483869075775],[120.97804427146912,29.138880372047424],[120.97839832305908,29.137893319129944],
                        [120.97876310348511,29.137163758277893],[120.97941756248474,29.13626253604889],[120.9810483455658,29.134342074394226],
                        [120.9818959236145,29.133376479148865],[120.98270595073701,29.132418930530548],[120.98334968090059,29.131678640842438],
                        [120.98402559757234,29.130959808826447],[120.98470687866212,29.13033217191696],[120.985227227211,29.12989765405655],
                        [120.9860908985138,29.129264652729034],[120.98707258701324,29.12864774465561],[120.9880542755127,29.12812203168869],
                        [120.98936319351196,29.127537310123444],[120.99144458770752,29.126807749271393],[120.99297881126404,29.126287400722504],
                        [120.99447548389435,29.125772416591644],[120.99569857120514,29.125321805477142],[120.99704504013062,29.124737083911896],
                        [120.99830567836761,29.12410408258438],[120.99883675575256,29.123830497264862],[120.99963068962097,29.1233691573143],
                        [121.00059628486633,29.122741520404816],[121.00166380405426,29.122038781642914],[121.00329995155334,29.120981991291046],
                        [121.00475907325745,29.120016396045685],[121.00560128688812,29.119447767734528],[121.00612163543701,29.11910980939865],
                        [121.0070389509201,29.11860018968582],[121.00769877433777,29.118267595767975],[121.00861608982086,29.1178759932518],
                        [121.00979626178741,29.117489755153656],[121.01091742515564,29.117216169834137],[121.01166307926178,29.117071330547336],
                        [121.01268768310547,29.116931855678562],[121.0139536857605,29.116878211498264],[121.01507484912872,29.116931855678562],
                        [121.01689338684082,29.117071330547336],[121.01934492588043,29.117291271686558],[121.02029979228975,29.117350280284885],
                        [121.02101325988771,29.117339551448826],[121.02191984653474,29.117242991924286],[121.02294981479646,29.117001593112946],
                        [121.02402269840242,29.116583168506622],[121.02478981018068,29.1161647439003],[121.0260719060898,29.115327894687653]]
      // 模拟站点位置
      let stationList = [
        {
        id: "11",
        position: [120.97202539443971,29.149083495140076],
        title:"11",
        icon: require('./assets/station.png'),
        content: "<div class='card'><div class='pop-up-top'>" +
                    "<span class='pop-up-tit f-left'><strong>11</strong></span>" +
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
      },
          {
        id: "22",
        position: [120.97543716430665,29.14593994617462],
        title:"22",
        icon: require('./assets/station.png'),
        content: "<div class='card'><div class='pop-up-top'>" +
                    "<span class='pop-up-tit f-left'><strong>22</strong></span>" +
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
      },
       {
        id: "33",
        position: [121.0260719060898,29.115327894687653],
        title:"33",
        icon: require('./assets/station.png'),
        content: "<div class='card'><div class='pop-up-top'>" +
                    "<span class='pop-up-tit f-left'><strong>33</strong></span>" +
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
      },
    ]
      this.$refs.map1.setRoute(stationList, routeCoords)
    },
    addMarker(val){
      this.map1= true
      this.modal.cursorStyle = val
    },
    setMarker(){
      this.$refs.map1.clearMap()
      let beijing = [116.28, 39.54]
      let marker = {
          id: "beijing",
          position: beijing,
          title:"北京",
          icon: require('./assets/station.png'),
      }
      this.$refs.map1.setMarker(marker)
      this.center = beijing
    },
    setClusterPoints(){
        this.$refs.map1.clearMap()
        this.$refs.map2.clearMap()
      
        // //散列点数组
        var coordinate = new Array();
        //散列点
        var coordinate1 = [104.1005229950, 30.6743128087];
        var coordinate2 = [103.9271879196, 30.7462617980];
        var coordinate3 = [103.6227035522, 30.9932085864];
        var coordinate4 = [103.5752069950, 31.4663367378];
        var coordinate5 = [103.4307861328, 30.1941019446];
        var coordinate6 = [106.5885615349, 29.5679608922];
        var coordinate7 = [106.4500522614, 29.5811456252];
        var coordinate8 = [107.7666950226, 29.4161988273];
        var coordinate9 = [118.1862562895, 24.4891501310];
        var coordinate10 = [118.1982564926, 24.4947641146];
        var coordinate11 = [79.1592185000, 12.9721456000];
        var coordinate12 = [80.2164941000, 12.9914031000];

        coordinate.push(coordinate1);
        coordinate.push(coordinate2);
        coordinate.push(coordinate3);
        coordinate.push(coordinate4);
        coordinate.push(coordinate5);
        coordinate.push(coordinate6);
        coordinate.push(coordinate7);
        coordinate.push(coordinate8);
        coordinate.push(coordinate9);
        coordinate.push(coordinate10);
        coordinate.push(coordinate11);
        coordinate.push(coordinate12);
        let points = []
        coordinate.forEach((item,index)=>{
          points.push({
            id: "id"+index,
            position: item,
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
          })
        })
      this.$refs.map2.setClusterPoints(points)
    },
    setMarkers(){
      this.$refs.map1.clearMap()
      this.$refs.map3.clearMap()
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
       },
        {
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
        }
      ]
      if(this.mapShow==1){
        this.$refs.map1.setMarkers(markers)
      }else if(this.mapShow==3){
        this.$refs.map3.setMarkers(markers)
      }
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
.gjhf-card{
    width: 300px;
    
}
.table-boedered>tbody > tr >td{
  border: 1px solid #ddd;
}
table {
    display: table;
    border-collapse: separate;
    box-sizing: border-box;
    border-spacing: .1px;
    border-color: grey;
}
.table>tbody > tr >td{
  border: 1px solid #ddd;
   padding: 2px 3px;
  vertical-align: middle;
  
}
.gjhf-card>table{
  margin-bottom: 0;
  width: 100%;
  border: 1px solid #ddd;
  max-width: 100%;
}
.gjhf-card>.pop-up-middle>.row-fluid{
  line-height: 1.5em;
   margin: 5px 0px;
   width: 50%;
   text-align: left;
   display: inline-block;
}
/* .gjhf-card > .pop-up-top{
        background-color: #e4e8f0;
        height: 31px;
        line-height: 31px;
        padding: 0 12px;
} */
/* .gjhf-card > .pop-up-top >#toSsjk{
  margin-right:30px;
  float: right;
  } */
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
