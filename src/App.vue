<template>
  <div id="app">
    <div>
      <button @click="addMarker('crosshair')" style="height:40px;width:150px">监听鼠标点击新增标注</button>
      <button @click="addMarker('pointer')" style="height:40px;width:150px">停止鼠标点击事件</button>
      <button @click="setMarker()" style="height:40px;width:150px">新增一个标注</button>
      <button @click="setMarkers()" style="height:40px;width:150px">新增多个</button>
      <button @click="$refs.map.removeMarker('beijing')" style="height:40px;width:150px">清除某个坐标</button>
      <button @click="$refs.map.clearMap()" style="height:40px;width:150px">清空地图坐标</button>
      <button @click="setRoute()" style="height:40px;width:150px">邮路规划</button>
      <button @click="setPolyline()" style="height:40px;width:150px">显示轨迹</button>
      <button @click="$refs.map.startAnimation(true)" style="height:40px;width:150px">播放轨迹</button>
      <button @click="$refs.map.pauseAnimation()" style="height:40px;width:150px">暂停播放</button>
      <button @click="$refs.map.startAnimation(false)" style="height:40px;width:150px">继续播放</button>
      <button @click="$refs.map.setCenter([114.30, 30.60])" style="height:40px;width:150px">设置中心点</button>
      <button @click="setSpeed(100)" style="height:40px;width:50px">慢速</button>
      <button @click="setSpeed(50)" style="height:40px;width:50px">中速</button>
      <button @click="setSpeed(10)" style="height:40px;width:50px">快速</button>
      <button @click="gjms=false" style="height:40px;width:150px">轨迹模式-单一</button>
      <button @click="gjms=true" style="height:40px;width:150px">轨迹模式-速度</button>
      <button @click="cljz=!cljz" style="height:40px;width:150px">车辆居中</button>
       <button @click="xxcgs=!xxcgs" style="height:40px;width:150px">信息窗跟随</button>
    </div>
    <ol-map class="map" :modal="modal" ref="map" :zoom="zoom" :xxcgs="xxcgs" :gjms="gjms" :cljz="cljz" :speed="speed"
    :center="center" :mapSource="mapSource" @positionResult="getPostionResult"/>
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
      zoom:11,
      gjms:false,
      cljz:false,
      xxcgs:false,
      speed:2,
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
     initData(trackList,stationList){ //处理数据
    
            let wzdata = [];  //位置表格数据
            let lineArr = []; //坐标数组 
            let max = 0;//设置eharts的最大值
            let ljlc = 0; //累计里程
            let index = 0;//索引
            this.total = 0;this.more ={};
            this.wzTablePage = 1;
            this.wzTableNum = 50;
            this.wzShowData = [];
            this.wzdata = [];
            this.index = 0; //数据索引
            this.bfIndex = 0; //百分比
             let xssc = 0 //行驶时长
             let xs_kssj ="";let xs_jssj="";let isXs = false;
             let sjArr = [];let sdArr = [];
             if(trackList === null || trackList.length === 0){//没有数据
                 return;
             }else{
                 this.total = trackList.length-1; //数据总数，用于显示百分比进度条
                 max = trackList[0].Speed; //设置eharts的最大值
                 ljlc = trackList[0]; //累计里程
             }
             if(!this.lockstar){
                 trackList.forEach(item => {
                    if(index > 0){
                        ljlc = this.getCumulativeMileage(item,wzdata[index-1]);//里程计算
                    }else{
                        ljlc = 0;
                    }
                    let wzxx = Object.assign( {index:index,ljlc:ljlc,xssc:xssc},item)
                    
                    if(item.Speed != 0){//计算行驶时长
                        if(isXs){
                            xs_jssj = new Date(item.GpsTime);
                            xssc += Math.round((xs_jssj - xs_kssj)/1000)
                            wzxx.xssc = xssc;
                        }
                        xs_kssj = new Date(item.GpsTime);
                        isXs = true;
                    }else{
                        isXs = false;
                    }
                    wzdata.push(wzxx)
    
                    sdArr.push(item.Speed);
                    sjArr.push(item.GpsTime);
                    if(item.Speed > max){ //最大速度，用于echarts显示高度设置
                        max = item.Speed
                    }
                    lineArr.push({x:item.Lat,y:item.Lon})  //坐标添加
                
                    index++; 
                 });
             }

            this.wzdata = Object.freeze(wzdata);
            this.wzShowData = this.wzdata.slice(0,this.wzTableNum)
            this.lineArr = lineArr;
            this.$refs.map.setsetPoly(stationList, this.wzdata)
           // this.$refs.mapView.setPolyline()
           
        },
         getCumulativeMileage(pos,pos_a){
            var result = 0;
            if(pos.n_lcjs>0&&pos_a.n_lcjs>0){
                let n_jsgdjl = pos.n_lcjs - pos_a.n_lcjs;	//距上个点距离
                let n_jsgdsj = (new Date(pos.GpsTime) - new Date(pos_a.GpsTime))/1000;	//距上个点时间
                
                if(n_jsgdsj>0&&n_jsgdjl>0){
                    let n_pjms = n_jsgdjl/n_jsgdsj;		//平均秒速
                    
                    if(n_pjms<40  || (n_jsgdsj<10 && n_pjms<100)){	//平均秒速小于40米才有效(144km/h)
                        result = result + n_jsgdjl;
                    }
                }
            }

            result += Number(pos_a.ljlc);
            
            return result.toFixed(1);
        },
    setPolyline(){
      let gj = require("./base/gj.json")
      let station = require("./base/rw.json")
      this.initData(gj.data.rows,station.data.rwmx)
      // this.$refs.map.setPolyline(stationList, routeCoords)
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
      this.$refs.map.setRoute(stationList, routeCoords)
    },
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
     }
    this.$refs.map.setMarker(marker)
    this.center = beijing
 
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
      this.$refs.map.setMarkers(markers)


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
