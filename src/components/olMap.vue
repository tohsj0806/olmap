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
import "../util/arc.js"
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
  },
  data(){
    return {
      map: null,
      mapTarget: null,
      vectorPointLayer: null,
      vectorPoint: null,
      vectorLinePoint:null,
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
      polylineItems:[],
      now:null,
      geoMarker:null,
      progress:0,
      previousStop:false
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
    moveFeatureStyle(polylineItem){
      return new Style({
          text: new Text({
                offsetY:"-25",
                //位置
                textAlign: 'center',
                //基准线
                textBaseline: 'middle',
                //文字样式
                font: 'normal 12px 微软雅黑',
                //文本内容
                text: polylineItem.title,
                //文本填充样式（即文字颜色）
                fill: new Fill({ color: '#575757' }),
                stroke: new Stroke({ color: '#575757', width: 0.5 }),
                backgroundFill: new Fill({
                  color:'#ffc125',
                }),
                backgroundStroke:new Stroke({ color: '#575757', width: 1}),
                padding:[1, 15, 1, 15]
              }),
              image: new Icon({
                src: polylineItem.icon,
                rotateWithView: false,
                //rotation: rotation
              })
      })
    },
    //邮路规划
    setRoute(stationList, routeCoords){
      this.clearMap()
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
      this.map.on('click', this.Popup);

      //设置缩放
      let mapPadding = [80, 60, 80, 60] 
      let extent = this.vectorLineSource.getExtent()
      this.map.getView().fit(extent, {
        size: this.map.getSize(),
        padding: mapPadding,
        nearest: true
      })
    },
    Popup(evt){
      //判断当前单击处是否有要素，捕获到要素时弹出popup
      var feature = this.map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) { return feature });
      if (feature && feature.get('id')){
        let popupData = this.markersData.find(item => item.id == feature.get('id'))
        if(popupData){
          var content = popupData.content;
          var title = popupData.title;
          this.featuerInfo.geo = popupData.position
          this.featuerInfo.att.text = content;//正文
          this.featuerInfo.att.title = title;//标题
          this.$refs.content.innerHTML = ''; //清空popup的内容容器
          this.addFeatrueInfo(this.featuerInfo,true); //在popup中加载当前要素的具体信息
          let popup = this.map.getOverlayById("popup")
          this.popupShow = true
          popup.setPosition(popupData.position); //设置popup的位置
          //this.map.getView().setCenter(popupData.position)
        }
       
      }
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
        this.vectorLinePoint = new VectorSource({
        type: 'PointString',  
        features: []
      })
       this.vectorPoint = new VectorLayer({
          source: this.vectorLinePoint
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
      this.map.addLayer(this.vectorPoint)  
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
          this.addFeatrueInfo(this.featuerInfo,true); //在popup中加载当前要素的具体信息
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
      this.map.on('click', this.Popup);

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
    addFeatrueInfo(info,boolen) {        
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
      boolen ?  this.$refs.content.appendChild(elementDiv):this.$refs.content1.appendChild(elementDiv); // 为content添加div子节点     
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
      if(id=='popup'){
        return new Overlay({
          id: id,
          //要转换成overlay的HTML元素
          element:this.$refs.popup,
          //当前窗口可见
          autoPan: false,
          //Popup放置的位置
          positioning: 'bottom-center',
          //是否应该停止事件传播到地图窗口
          stopEvent: false,
      });
      }else{
        return new Overlay({
          id: id,
          //要转换成overlay的HTML元素
          element:this.$refs.tipPop,
          //当前窗口可见
          autoPan: true,
          //Popup放置的位置
          positioning: 'bottom-center',
          //是否应该停止事件传播到地图窗口
          stopEvent: false,
      });
      }
      
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
