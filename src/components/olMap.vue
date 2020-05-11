<template>
  <div ref="rootmap" class="map">
    <!-- Popup -->
    <div id="popup" class="ol-popup" ref="popup" v-show="popupShow">
      <a href="#" id="popup-closer" class="ol-popup-closer" @click="closePopup"></a>
      <div id="popup-content" ref="content">
      </div>
    </div>
    <div id="tipPop" class="ol-popup" ref="tipPop" v-show="tooltipShow">
      <a href="#" id="tipPop-closer" class="ol-popup-closer" @click="closeTipPopup"></a>
      <div id="popup-content" ref="content1">
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
import mapMinxin from "@/base/mapUtils.js"
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
  mixins: [mapMinxin],
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
    gjms:{
      type:Boolean,
      default:false
    },
    cljz:{
      type:Boolean,
      default:false
    },
    xxcgs:{
      type:Boolean,
      default:false
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
      tooltipShow:true
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
    'speed':{
      handler: function(val, oldVal){
        if(this.map && val !== oldVal){
          //console.log(val)
         // this.setPolyline(this.markersData,this.polylineItems)
         // this.startAnimation(true)
        }
      },
        immediate: true
    },
    'gjms':{
      handler: function(val, oldVal){
        if(this.map && val !== oldVal){
          this.setPolyline(this.markersData,this.polylineItems)
          this.startAnimation(true)
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
    pointListType(pointList){
      let ponitLists=[]
      pointList.forEach(item=>{
        let point ={}
        point.speed = item.Speed
        point.title= "川ZD0667"
        point.position = [item.Lon,item.Lat]
         var img = this.getMarkerIconByType(this.getDirectionByAngle(item.Fx).jd);
        point.icon = require('@/assets/' + img)
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
        station.icon = require('../assets/station.png')
        station.id = item.id.toString()
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
    //轨迹回放
    setsetPoly(stationList, pointList){
      let stationLists= this.stationListType(stationList)
      let pointLists = this.pointListType(pointList)
      this.setPolyline(stationLists,pointLists)
    },
    setPolyline(stationList, pointList){
     
      this.clearMap()
      let icon = require('../assets/station.png')
      this.route = []
      this.polylineItems = pointList
      pointList.forEach(item=>{this.route.push(item.position)})
  

      let polylineFeature = new Feature({
        geometry: new LineString(this.route, 'XY')
      }) 
      polylineFeature.setStyle(this.lineStyle)
      this.vectorLineSource.addFeature(polylineFeature)
      //this.map.getView().setCenter([116.31441317113486, 39.89635729104322])
      //设置站点
      stationList.forEach((item, index)=>{
        let title = item.title
        if(index === 0) title = item.title + "(起点)"
        if(index === stationList.length -1)  title = item.title + "(终点)"
        let stationPoint = new Feature({
          id:item.id,
          geometry: new Point(item.position),
          title:title,
          icon: item.icon
        })
        stationPoint.setStyle(this.createLabelStyle(stationPoint))
        this.vectorLineSource.addFeature(stationPoint)
      })
      this.map.addOverlay(this.setPopup("popup"));
      this.markersData = stationList
      this.map.on('click', this.Popup);

      // //移动坐标
      this.geoMarker = new Feature({
        id:"movePoint",
        icon: pointList[0].icon,
        title: pointList[0].title,
        geometry: new Point(pointList[0].position)
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
    moveFeature(event){
      this.progress += 1
      let polylineItem = this.polylineItems[Math.floor(this.progress/this.speed)]
      this.map.addOverlay(this.setPopup("tipPop"));
      if(this.xxcgs) this.TipPop(polylineItem,polylineItem.position);
      if(this.progress%this.speed==0){
        //进度
        this.$emit("positionJd", (this.progress/this.speed/(this.route.length-1)*100).toFixed(2))
        let currentPoint = new Point(this.route[this.progress/this.speed])
        let dx = this.route[this.progress/this.speed][0] - this.route[this.progress/this.speed-1][0]
        let dy = this.route[this.progress/this.speed][1] - this.route[this.progress/this.speed-1][1]
        if(!isNaN(dx)&&!isNaN(dy)){
          let rotation = Math.atan2(dy, dx);
        let movePoints = this.vectorLineSource.getFeatures().filter(item => item.get('id') == "movePoint")
        movePoints.forEach(item=>{
          this.vectorLineSource.removeFeature(item)
        })
        if(this.cljz)  this.setCenter(currentPoint.flatCoordinates);
        // if(this.xxcgs) this.TipPop(polylineItem,currentPoint.flatCoordinates);
        let currentFeature = new Feature({
          id:"movePoint",
          icon:polylineItem.icon,
          title:polylineItem.title,
          geometry: currentPoint
        })
        currentFeature.setStyle(this.moveFeatureStyle(polylineItem))
        this.vectorLineSource.addFeature(currentFeature)
        }
        
      }
      if(this.progress % this.speed!=0){
        let arcGenerator = new arc.GreatCircle(
                {x: this.route[Math.floor(this.progress/this.speed)][0], y: this.route[Math.floor(this.progress/this.speed)][1]},
                {x: this.route[Math.floor(this.progress/this.speed+1)][0], y: this.route[Math.floor(this.progress/this.speed+1)][1]});
        let arcLine = arcGenerator.Arc(this.speed, {offset: 0});//在两个点之间生成100个点
        
        let currentPoint = new Point(arcLine.geometries[0].coords[this.progress%this.speed]);
        //if(currentPoint.flatCoordinates[0]!=NaN)
        let dx = arcLine.geometries[0].coords[this.progress%this.speed][0] - arcLine.geometries[0].coords[this.progress%this.speed-1][0];
        let dy = arcLine.geometries[0].coords[this.progress%this.speed][1] - arcLine.geometries[0].coords[this.progress%this.speed-1][1];
        if(!isNaN(dx)&&!isNaN(dy)){
          let rotation = Math.atan2(dy, dx);
        let movePoints = this.vectorLineSource.getFeatures().filter(item => item.get('id') == "movePoint")
        if(this.cljz)  this.setCenter(currentPoint.flatCoordinates);
        // if(this.xxcgs) this.TipPop(polylineItem,currentPoint.flatCoordinates);
        movePoints.forEach(item=>{
          this.vectorLineSource.removeFeature(item)
        })
        let currentFeature = new Feature({
          id:"movePoint",
          icon:polylineItem.icon,
          title:polylineItem.title,
          geometry: new Point(currentPoint.flatCoordinates) 
        })
        currentFeature.setStyle(this.moveFeatureStyle(polylineItem))
        this.vectorLineSource.addFeature(currentFeature)

        let positions = []
        arcLine.geometries[0].coords.forEach((item,index)=>{
          if(index <= this.progress%this.speed) positions.push(item)
        })

        let lineFeature = new Feature({
          geometry: new LineString(positions, 'XY')
        })
        if(this.gjms){
          if(polylineItem.speed < 19) lineFeature.setStyle(this.lineMoveStyle1)
          else if(19 < polylineItem.speed < 39) lineFeature.setStyle(this.lineMoveStyle2)
          else if(39 < polylineItem.speed < 79) lineFeature.setStyle(this.lineMoveStyle)
          else lineFeature.setStyle(this.lineMoveStyle3)
        }else{
          lineFeature.setStyle(this.lineMoveStyle)
        }

        this.vectorLineSource.addFeature(lineFeature)
        }

      }
     // this.tooltipShow =true
      
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
          this.map.getView().setCenter(popupData.position)
        }
       
      }
    },
    TipPop(data,point){
       var content = data.content;
          var title = data.title;
          this.featuerInfo.geo = point
          this.featuerInfo.att.text = content;//正文
          this.featuerInfo.att.title = title;//标题
          this.$refs.content1.innerHTML = ''; //清空popup的内容容器
          this.addFeatrueInfo(this.featuerInfo,false); //在popup中加载当前要素的具体信息
          let popup = this.map.getOverlayById("tipPop")
          this.tooltipShow = true
          popup.setPosition(point); //设置popup的位置
         // this.map.getView().setCenter(data.position)
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
    lineMoveStyle(){
      return new Style({
          stroke: new Stroke({
            //width: 6, color: "#cfe7b4"
            width: 6, color: "#1bac2e"
          }),
        })
    },
    lineMoveStyle1(){
      return new Style({
          stroke: new Stroke({
            //width: 6, color: "#cfe7b4"
            width: 6, color: "red"
          }),
        })
    },
     lineMoveStyle2(){
      return new Style({
          stroke: new Stroke({
            //width: 6, color: "#cfe7b4"
            width: 6, color: "#FF0AF7"
          }),
        })
    },
     lineMoveStyle3(){
      return new Style({
          stroke: new Stroke({
            //width: 6, color: "#cfe7b4"
            width: 6, color: "blue"
          }),
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
          autoPan: true,
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
    closeTipPopup(){
      let popup = this.map.getOverlayById("tipPop")
      if(popup) popup.setPosition(undefined);
      this.tooltipShow = false
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
