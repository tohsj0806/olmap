<template>
  <div ref="rootmap" class="map">
    <!-- Popup -->
    <div id="popup" class="ol-popup" ref="popup" v-show="popupShow">
      <a href="#" id="popup-closer" class="ol-popup-closer" @click="closePopup"></a>
      <div id="popup-content" ref="content">
      </div>
    </div>
    <!--搜索框-->
    <div class="info" v-show="searchInputShow">
        <div class="input-item-map">
          <div class="input-item-prepend-map">
            <span class="input-item-text-map" style="width:6rem;">请输入关键字</span>
          </div>
          <input v-model="searchInput" id='tipinput' type="text" style="width:15rem;height:2.2rem;border: 1px solid #ced4da;border-radius:.25rem;"/>
        </div>
    </div>
    <div class="info-select"  v-show="searchInputShow">
      <ul>
          <li>web <span class="select-address">前端111111111111111111111111111111111144563w3533421</span></li>
          <li>php <span class="select-address">前端</span></li>
          <li>java <span class="select-address">前端</span></li>
          <li>ios <span class="select-address">前端</span></li>
          <li>安卓 <span class="select-address">前端</span></li>
      </ul>
    </div>
  </div>
</template>

<script>
import "ol/ol.css"
import {Map, View} from "ol"
import Point from 'ol/geom/Point'
import LineString from 'ol/geom/LineString'
import Style from 'ol/style/Style'
import Icon from 'ol/style/Icon'
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import Feature from 'ol/Feature'
import Overlay from 'ol/Overlay'
import mapConfig from '../config/mapConfig'
import Observable from 'ol/Observable';
//import MultiPoint from 'ol/geom/MultiPoint';
import Text from 'ol/style/Text';
//import {getAddress} from '@/api/geocode'
import {getVectorContext} from 'ol/render';

export default {
  name: 'olMap',
  props: {
    modal: {
      
    },
    center:{
      type: Array,
      default: () => [116.28, 39.54]
    },
    mapSource:{
      type:String
    },
    zoom:{
      type: Number
    },
    speed:{
      type:Number,
      default:10
    }
  },
  data(){
    return {
      map: null,
      mapTarget: null,
      vectorPointLayer: null,
      vectorPointSource: null,
      vectorLineLayer: null,
      vectorLineSource: null,
      markersData: [],
      popupShow: false,
      searchInputShow:false,
      searchInput:"",
      featuerInfo: {
        geo: [],
        att: {
            title: "北京市(中华人民共和国首都)", //标注信息的标题内容
            text: "", //内容
        }
      },
      clickEvent: null,
      animating: false,
      animation:null,
      route: [],
      now:null,
      geoMarker:null,
      progress:0,
    }
  },
  watch: {
    "modal.cursorStyle": {
        handler: function (newVal, oldVal) {
          if (this.map && newVal) {
            this.$refs.rootmap.style.cursor = newVal
            if(newVal == "crosshair") this.map.on('click', this.addMarker)
            if(newVal == "pointer" ) this.map.un('click', this.addMarker)
          }
        },
        immediate: true
    },
    'zoom':{
      handler: function(val, oldVal){
        if(this.map && val !== oldVal){
          this.map.getView().setZoom(val)
        }
      },
        immediate: true
    },
    'center':{
      handler: function(val, oldVal){
       if(this.map && val !== oldVal){
          this.map.getView().setCenter(val)
        }
      },
      immediate: true
    }
  },
  mounted(){
    this.$nextTick(()=>{
      this.initMap()
    })
  
  },
  methods:{
    moveFeature(event){
      this.progress += 1
      let car = require('../assets/car.png')
      if(this.progress%this.speed==0){

        let currentPoint = new Point(this.route[this.progress/this.speed])
        let dx = this.route[this.progress/this.speed][0] - this.route[this.progress/this.speed-1][0]
        let dy = this.route[this.progress/this.speed][1] - this.route[this.progress/this.speed-1][1]
        let rotation = Math.atan2(dy, dx);
        let movePoint = this.vectorLineSource.getFeatures().find(item => item.get('id') == "movePoint")
        this.vectorLineSource.removeFeature(movePoint)
        let currentFeature = new Feature({
          id:"movePoint",
          geometry: currentPoint
        })
        let styleGeomarker = new Style({
              image: new Icon({
                src: car,
                rotateWithView: false,
                rotation: -rotation
              })})
        currentFeature.setStyle(styleGeomarker)
        this.vectorLineSource.addFeature(currentFeature)
      }
      if(this.progress%this.speed!=0){
        let arcGenerator = new arc.GreatCircle(
                {x: this.route[Math.floor(this.progress/this.speed)][0], y: this.route[Math.floor(this.progress/this.speed)][1]},
                {x: this.route[Math.floor(this.progress/this.speed+1)][0], y: this.route[Math.floor(this.progress/this.speed+1)][1]});

        let arcLine = arcGenerator.Arc(this.speed, {offset: 0});//在两个点之间生成100个点
        let currentPoint = new Point(arcLine.geometries[0].coords[this.progress%this.speed]);
        let dx = arcLine.geometries[0].coords[this.progress%this.speed][0] - arcLine.geometries[0].coords[this.progress%this.speed-1][0];
        let dy = arcLine.geometries[0].coords[this.progress%this.speed][1] - arcLine.geometries[0].coords[this.progress%this.speed-1][1];
        let rotation = Math.atan2(dy, dx);
        let movePoint = this.vectorLineSource.getFeatures().find(item => item.get('id') == "movePoint")
        this.vectorLineSource.removeFeature(movePoint)



        let lineFeature = new Feature({
          geometry: new LineString(arcLine.geometries[0].coords, 'XY')
        }) 
        lineFeature.setStyle(this.lineMoveStyle)
        this.vectorLineSource.addFeature(lineFeature)


        let currentFeature = new Feature({
          id:"movePoint",
          geometry: currentPoint
        })
        let styleGeomarker = new Style({
              image: new Icon({
                src: car,
                rotateWithView: false,
                rotation: -rotation
              })})
        currentFeature.setStyle(styleGeomarker)
        this.vectorLineSource.addFeature(currentFeature)
      }
      if (this.progress/this.speed < this.route.length-1) {
        this.animation = requestAnimationFrame(this.moveFeature)
      }
    },
    startAnimation(start){
      if(!start && this.animating){
        this.animation = requestAnimationFrame(this.moveFeature)
      }
      if(start){
        this.progress = 0
        this.animating = true
        this.animation = requestAnimationFrame(this.moveFeature)
        this.map.render();
      }
    },
    pauseAnimation(){
      if(this.animation)
      window.cancelAnimationFrame(this.animation);
    },
    setRoute(stationList, routeCoords){
      let icon = require('../assets/station.png')
      let self = this
      this.markersData = []
      let lineFeature = new Feature({
        geometry: new LineString(routeCoords, 'XY')
      }) 
      lineFeature.setStyle(this.lineStyle)
      this.vectorLineSource.addFeature(lineFeature)

      //设置站点
      stationList.forEach((item, index)=>{
        let stationPoint = new Feature({
          id: item.id,
          geometry: new Point(item.position),
          icon:item.icon,
          title:item.title,
        })
        stationPoint.setStyle(this.createLabelStyle(stationPoint))
        this.vectorLineSource.addFeature(stationPoint)
      })

      this.map.addOverlay(this.setPopup("popup"));
      this.markersData = stationList
      this.map.on('click', function (evt) {
        //判断当前单击处是否有要素，捕获到要素时弹出popup
        var feature = self.map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) { return feature; });
        if (feature && feature.get('id')){
          let popupData = self.markersData.find(item => item.id == feature.get('id'))
          var content = popupData.content;
          var title = popupData.title;
          self.featuerInfo.geo = popupData.position
          self.featuerInfo.att.text = content;//正文
          self.featuerInfo.att.title = title;//标题
          self.$refs.content.innerHTML = ''; //清空popup的内容容器
          self.addFeatrueInfo(self.featuerInfo); //在popup中加载当前要素的具体信息
          let popup = self.map.getOverlayById("popup")
          self.popupShow = true
          popup.setPosition(popupData.position); //设置popup的位置
          self.map.getView().setCenter(popupData.position)
        }
      });



      //设置缩放
      let mapPadding = [80, 60, 80, 60] 
      let extent = this.vectorLineSource.getExtent()
      this.map.getView().fit(extent, {
        size: this.map.getSize(),
        padding: mapPadding,
        nearest: true
      })
    },
    setPolyline(){
      //模拟坐标位置
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
      let stationList = [[120.97202539443971,29.149083495140076], [120.97543716430665,29.14593994617462],  [120.98936319351196,29.127537310123444], [121.0070389509201,29.11860018968582],[121.02029979228975,29.117350280284885],[121.0260719060898,29.115327894687653]]

      this.route = routeCoords
      let icon = require('../assets/station.png')
      let car = require('../assets/car.png')

      let lineFeature = new Feature({
        geometry: new LineString(this.route, 'XY')
      }) 
      lineFeature.setStyle(this.lineStyle)
      this.vectorLineSource.addFeature(lineFeature)

      //设置站点
      stationList.forEach((item, index)=>{
        let title = ""
        if(index === 0) title = "起点"
        if(index === stationList.length -1)  title = "终点"
        let stationPoint = new Feature({
          geometry: new Point(item),
          icon:icon,
          title:title
        })
        stationPoint.setStyle(this.createLabelStyle(stationPoint))
        this.vectorLineSource.addFeature(stationPoint)
      })

      //移动坐标
      this.geoMarker = new Feature({
        id:"movePoint",
        icon: car,
        geometry: new Point(this.route[0])
      })
      this.geoMarker.setStyle(this.createLabelStyle(this.geoMarker))
      this.vectorLineSource.addFeature(this.geoMarker)

      window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
      let cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame

      //设置缩放
      let mapPadding = [80, 60, 80, 60] 
      let extent = this.vectorLineSource.getExtent()
      this.map.getView().fit(extent, {
        size: this.map.getSize(),
        padding: mapPadding,
        nearest: true
      })
    },
    initMap(){
      let map = this.$refs.rootmap
      map.style.cursor = "pointer"
      let beijing = [116.28, 39.54]
      let changsha = [113,	28.21]
      this.map = new Map({
        target: map,
        layers: mapConfig.streetMap(this.mapSource),
        view: new View({
          projection: "EPSG:4326", 
          center: this.center,  
          minZoom: 1,
          zoom: this.zoom
        })
      })
      //矢量标注的数据源
      this.vectorPointSource = new VectorSource({
        type: 'point',  
        features: []
      })
      //轨迹的数据源
      this.vectorLineSource = new VectorSource({
        type: 'LineString',  
        features: []
      })
      //矢量标注图层
      this.vectorPointLayer = new VectorLayer({
          source: this.vectorPointSource
      })
       //矢量轨迹图层
      this.vectorLineLayer = new VectorLayer({
          source: this.vectorLineSource
      })
      this.map.addLayer(this.vectorPointLayer)  
      this.map.addLayer(this.vectorLineLayer)
    },
    setCenter(point){
      this.map.getView().setCenter(point)
    },
    clearMap(){
      let pointFeatures = this.vectorPointSource.getFeatures()
      if(pointFeatures.length > 0) {
        pointFeatures.forEach(item => {
          this.vectorPointSource.removeFeature(item)
        })
      }
      let lineFeatures = this.vectorLineSource.getFeatures()
      if(lineFeatures.length > 0) {
        lineFeatures.forEach(item => {
          this.vectorLineSource.removeFeature(item)
        })
      }
      this.closePopup()
    },
    /**
    * 删除marker坐标
    * @param {feature} id
    */
    removeMarker(id){
      let features = this.vectorPointSource.getFeatures()
      let removeFeatureMarker = features.find(item => item.get('id') == id)
      if(removeFeatureMarker) {
        this.closePopup()
        this.vectorPointSource.removeFeature(removeFeatureMarker)
      }
    },
     /**
    * 新增新的标注（矢量要素）
    * @param 鼠标点要素,默认id为temp
    */
    addMarker(evt){
      //鼠标单击点坐标
      var point = evt.coordinate;
      //添加一个新的标注（矢量要素）
      this.removeMarker("temp")
      this.addVectorLabel("temp", point);
      this.GeocodeResult(point)
    },
    //为地图容器添加标注
    setMarker(marker) {
      let feature = new Feature({
        id: marker.id,
        title: marker.title,
        icon: marker.icon,
        geometry: new Point(marker.position)
      })
      feature.setStyle(this.createLabelStyle(feature))
      this.vectorPointSource.addFeature(feature)
      if(!!marker.content && marker.content!=""){
          this.popupShow = true
          this.map.addOverlay(this.setPopup("popup"))
          let popup = this.map.getOverlayById("popup")
          popup.setPosition(marker.position); //设置popup的位置
          this.featuerInfo.geo = marker.position
          this.featuerInfo.att.text = marker.content ||  marker.title;//正文
          this.featuerInfo.att.title = marker.title;//标题
          this.$refs.content.innerHTML = ''; //清空popup的内容容器
          this.addFeatrueInfo(this.featuerInfo); //在popup中加载当前要素的具体信息
          this.map.getView().setCenter(marker.position)
      }
    },
    /**
    * 添加多个新的标注（矢量要素）
    * @param {array} markers要素
    */
    setMarkers(markers){
      let positions = []
      let infoContent = []
      let self = this
      this.markersData = []
      let mapPadding = [80, 60, 80, 60] //top, right, bottom and left padding.
      if(markers.length == 0) return
      markers.forEach(item => { 
        //实例化Vector要素，通过矢量图层添加到地图容器中
        let iconFeature = new Feature({
          id: item.id,
          title: item.title,
          geometry: new Point(item.position),
          icon: item.icon,
        })
        iconFeature.setStyle(this.createLabelStyle(iconFeature))
        this.vectorPointSource.addFeature(iconFeature)
      })
      this.map.addOverlay(this.setPopup("popup"));
      this.markersData = markers
      this.map.on('click', function (evt) {
        //判断当前单击处是否有要素，捕获到要素时弹出popup
        var feature = self.map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) { return feature; });
        if (feature && feature.get('id')){
          let popupData = self.markersData.find(item => item.id == feature.get('id'))
          var content = popupData.content;
          var title = popupData.title;
          self.featuerInfo.geo = popupData.position
          self.featuerInfo.att.text = content;//正文
          self.featuerInfo.att.title = title;//标题
          self.$refs.content.innerHTML = ''; //清空popup的内容容器
          self.addFeatrueInfo(self.featuerInfo); //在popup中加载当前要素的具体信息
          let popup = self.map.getOverlayById("popup")
          self.popupShow = true
          popup.setPosition(popupData.position); //设置popup的位置
          self.map.getView().setCenter(popupData.position)
        }
      });

      if(markers.length > 1){
        let extent = this.vectorPointSource.getExtent()
        this.map.getView().fit(extent, {
          size: this.map.getSize(),
          padding: mapPadding,
          nearest: true
        })
        return
      }
      if(markers.length==1){
        //只有一个坐标的时候居中就ok
        this.map.getView().setCenter(markers[0].position)
      }

    },
    /**
    * 动态创建popup的具体内容
    * @param {string} title 
    */
    addFeatrueInfo(info) {        
      //新增a元素
      // var elementA = document.createElement('a');
      // elementA.className = "markerInfo";
      // this.setInnerText(elementA, info.att.title);
      // this.$refs.content.appendChild(elementA); // 新建的div元素添加a子节点
      //新增div元素
      var elementDiv = document.createElement('div');
      elementDiv.className = "markerText";
      //elementDiv.innerText = info.att.text;
      this.setInnerText(elementDiv, info.att.text);
      this.$refs.content.appendChild(elementDiv); // 为content添加div子节点     
    },
    /**
    * 动态设置元素文本内容（兼容）
    */
    setInnerText(element, text) {
      element.innerHTML = text;
    },
    lineStyle(){
      return new Style({
          stroke: new Stroke({
            width: 6, color: "#cfe7b4"
            //width: 6, color: "#1bac2e"
          })
        })
    },
    lineMoveStyle(){
      return new Style({
          stroke: new Stroke({
            //width: 6, color: "#cfe7b4"
            width: 6, color: "#1bac2e"
          })
        })
    },
    createLabelStyle(feature){
      return new Style({
        image: new Icon(
          ({
            //图标缩放比例
            // scale:0.5,
            //透明度
            opacity: 0.85,
            //图标的url
            src: feature.get('icon'),
          })
        ),
        text: new Text({
          offsetY:"-25",
          //位置
          textAlign: 'center',
          //基准线
          textBaseline: 'middle',
          //文字样式
          font: 'normal 12px 微软雅黑',
          //文本内容
          text: feature.get('title'),
          //文本填充样式（即文字颜色）
          fill: new Fill({ color: '#575757' }),
          stroke: new Stroke({ color: '#575757', width: 0.5 }),
          backgroundFill: new Fill({
            color:'#ffc125',
          }),
          backgroundStroke:new Stroke({ color: '#575757', width: 1}),
          padding:[1, 15, 1, 15]
        })
      });
    },
    GeocodeResult(point){
      this.$emit("positionResult", point)
    },
    /**
    * 添加popup元素
    * @param {} popup要素 
    */
    setPopup(id){
      return new Overlay({
          id: id,
          //要转换成overlay的HTML元素
          element: this.$refs.popup,
          //当前窗口可见
          autoPan: true,
          //Popup放置的位置
          positioning: 'bottom-center',
          //是否应该停止事件传播到地图窗口
          stopEvent: false,
      });
    },
    closePopup(){
      let popup = this.map.getOverlayById("popup")
      if(popup) popup.setPosition(undefined);
      this.popupShow = false
      return false;
    },
    /**
    * 添加一个新的标注（矢量要素）
    * @param {ol.Coordinate} coordinate 坐标点
    */
    addVectorLabel(id, coordinate) {
      //新建一个要素 ol.Feature
      var newFeature = new Feature({
        //几何信息
        id: id,
        geometry: new Point(coordinate),
        icon: this.modal.markerIcon,
        title:""
      });
      //设置要素的样式
      newFeature.setStyle(this.createLabelStyle(newFeature));
      //将新要素添加到数据源中
      this.vectorPointSource.addFeature(newFeature);
    }
  }
  
}
</script>
<style>
.map{height:100%;width:100%}
.ol-attribution,.ol-zoom { display: none;}
.ol-popup {
    position: absolute;
    background-color: white;
    -webkit-filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
    filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
    padding: 15px;
    border-radius: 10px;
    border: 1px solid #cccccc;
    bottom: 20px;
    left: -50px;
}

.ol-popup:after, .ol-popup:before {
    top: 100%;
    border: solid transparent;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
}

.ol-popup:after {
    border-top-color: white;
    border-width: 10px;
    left: 48px;
    margin-left: -10px;
}

.ol-popup:before {
    border-top-color: #cccccc;
    border-width: 11px;
    left: 48px;
    margin-left: -11px;
}

.ol-popup-closer {
    text-decoration: none;
    position: absolute;
    top: 2px;
    right: 8px;
}

.ol-popup-closer:after {
    content: "✖";
}

#popup-content {
    font-size: 14px;
    font-family: "微软雅黑";
}

#popup-content .markerInfo {
    font-weight: bold;
}
.info {
    padding: .75rem 1.25rem;
    margin-bottom: 1rem;
    border-radius: .25rem;
    position: fixed;
    top: 10rem;
    background-color: white;
    width: auto;
    min-width: 22rem;
    border-width: 0;
    right: 2rem;
    z-index: 2;
    box-shadow: 0 2px 6px 0 rgba(114, 124, 245, .5);
}
.info-select {
    padding:0.25rem 1rem;
    margin-bottom: 1rem;
    border-radius: .25rem;
    position: fixed;
    top: 13.5rem;
    background-color: white;
    width: 13rem;
    border-width: 0;
    right: 3.25rem;
    z-index: 2;
    border: 1px solid #ced4da;
}
.input-item-map {
    position: relative;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-wrap: wrap;
    flex-wrap: wrap;
    -ms-flex-align: center;
    align-items: center;
    width: 100%;
    height: 3rem;
}
.input-item-prepend-map {
    margin-right: -1px;
}
.input-item-text-map {
    width: 6rem;
    font-size: 14px;
    text-align: justify;
    padding: 0.0rem 0.7rem;
    display: inline-block;
    text-justify: distribute-all-lines;
    text-align-last: justify;
    -moz-text-align-last: justify;
    -webkit-text-align-last: justify;
    -ms-flex-align: center;
    align-items: center;
    margin-bottom: 0;
    font-weight: 400;
    line-height: 2.4;
    color: #495057;
    text-align: center;
    white-space: nowrap;
    background-color: #e9ecef;
    border: 1px solid #ced4da;
    border-radius: .25rem;
    border-bottom-right-radius: 0;
    border-top-right-radius: 0;
    height: 2.2rem;
}
ul{
  list-style:none;
  color: #495057;
  font-size: 14px;
}
.select-address{
  color: #c1c1c1;
  font-size:13px
}
</style>
