<template>
    <div ref="rootmap" class="map">
      <div id="popup" class="ol-popup" ref="popup" v-show="popupShow">
        <a href="#" id="popup-closer" class="ol-popup-closer" @click="closePopup"></a>
        <div id="popup-content" ref="content">
        </div>
      </div>
    </div>
</template>
<script>
import "ol/ol.css"
import {Map, View} from "ol"
import Point from 'ol/geom/Point'
import Cluster from 'ol/source/Cluster';
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
import Text from 'ol/style/Text';
import Circle from 'ol/style/Circle';
import {getVectorContext} from 'ol/render';
export default {
  name:'clusterMap',
  props: {
    mapSource:{
      type:String
    },
    zoom:{
      type: Number,
      default:5
    },
    center:{
      type: Array,
      default: () => [103.9271879196, 30.7462617980]
    },
  },
  data(){
    return{
      map: null,
      clusterSource:null,
      clusterLayer:null,
      clusterFeaturesSource:null,
      popupShow: false,
      featuerInfo: {
        geo: [],
        att: {
            title: "北京市(中华人民共和国首都)", //标注信息的标题内容
            text: "", //内容
        }
      },
    }
  },
  mounted(){
    this.$nextTick(()=>{
      this.initMap()
    })
  },
  methods:{
    initMap(){
      let map = this.$refs.rootmap
      this.map = new Map({
        target: map,
        layers:mapConfig.streetMap(this.mapSource),
        view: new View({
          projection: "EPSG:4326", 
          center: this.center,  
          minZoom: 1,
          zoom: this.zoom
        })
      })
      this.clusterFeaturesSource = new VectorSource({
         features: []
      });
      let that = this
      this.clusterSource = new Cluster({
        distance:50,
        source:this.clusterFeaturesSource
      })
        //矢量标注图层
      this.clusterLayer = new VectorLayer({
          source: this.clusterSource,
          style:function(feature) {  
              return that.setClusterStyle(feature);  
          }  
      })
      this.map.addLayer(this.clusterLayer)
    },
    clearMap(){
      let clusterFeatures = this.clusterFeaturesSource.getFeatures()
      if(clusterFeatures && clusterFeatures.length > 0) {
        clusterFeatures.forEach(item => {
          this.clusterFeaturesSource.removeFeature(item)
        })
      }
      this.closePopup()
    },
    closePopup(){
      let popup = this.map.getOverlayById("popup")
      if(popup) popup.setPosition(undefined);
      this.popupShow = false
      return false;
    },
    setClusterPoints(points){
        //散列点资源
        for(var i = 0; i < points.length; i++){
            var feature = new Feature({
                id:points[i].id,
                title:points[i].title,
                geometry:new Point(points[i].position)
            });
            this.clusterFeaturesSource.addFeature(feature);
        } 
        this.clusterSource.setSource
        //矢量标注图层
        this.map.addOverlay(this.setPopup("popup"));
        this.markersData = points
        this.map.on('click', this.Popup);
        let mapPadding = [80, 60, 80, 60] 
        if(points.length > 1){
          let extent = this.clusterFeaturesSource.getExtent()
          this.map.getView().fit(extent, {
            size: this.map.getSize(),
            padding: mapPadding,
            nearest: true
          })
          return
        }
        if(points.length==1){
          //只有一个坐标的时候居中就ok
          this.map.getView().setCenter(points[0].position)
        }
        this.clusterSource.refresh();
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
    Popup(evt){
      //判断当前单击处是否有要素，捕获到要素时弹出popup
      var features = this.map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) { return feature });
      if(!!!features) return
      var featuresList = features.get('features')
      if(featuresList.length > 1) return
      if (featuresList[0] && featuresList[0].get('id')){
        let popupData = this.markersData.find(item => item.id == featuresList[0].get('id'))
        if(popupData){
          var content = popupData.content;
          var title = popupData.title;
          this.featuerInfo.geo = popupData.position
          this.featuerInfo.att.text = content;//正文
          this.featuerInfo.att.title = title;//标题
          this.$refs.content.innerHTML = ''; //清空popup的内容容器
          this.addFeatrueInfo(this.featuerInfo); //在popup中加载当前要素的具体信息
          let popup = this.map.getOverlayById("popup")
          this.popupShow = true
          popup.setPosition(popupData.position); //设置popup的位置
          //this.map.getView().setCenter(popupData.position)
        }
       
      }
    },
    findMarkerAndPopup(popupData, zoom){
      this.popupShow = false
      if(!!popupData){
          var content = popupData.content;
          var title = popupData.title;
          this.featuerInfo.geo = popupData.position
          this.featuerInfo.att.text = content;//正文
          this.featuerInfo.att.title = title;//标题
          this.$refs.content.innerHTML = ''; //清空popup的内容容器
          this.addFeatrueInfo(this.featuerInfo); //在popup中加载当前要素的具体信息
          let popup = this.map.getOverlayById("popup")
          this.popupShow = true
          popup.setPosition(popupData.position); //设置popup的位置
          this.map.getView().setCenter(popupData.position)
          this.map.getView().setZoom(zoom)
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
      this.$refs.content.appendChild(elementDiv) // 为content添加div子节点     
    },
    //设置聚类样式
    setClusterStyle(feature){
      var features = feature.get('features');  
      var size = features.length; 
      var style = null
      let icon = require('../assets/car_online.png')
      if(size === 1){
      style = new Style({  
          image: new Icon({  
              src: icon,
              opacity: 0.85,
          }),
          text: new Text({
            offsetY:"-25",
            //位置
            textAlign: 'center',
            //基准线
            textBaseline: 'middle',
            //文字样式
            font: 'normal 12px 微软雅黑',
            //文本内容
            text: features[0].get('title'),
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
      }else{
        style = new Style({  
          image: new Circle({  
              radius: 18,  
              stroke: new Stroke({  
                  color: '#fff'  
              }),  
              fill: new Fill({  
                  color: '#3399CC'  
              }),
              opacity: 0.85,
            }),  
          text: new Text({  
              font: '15px sans-serif',  
              text: size.toString(),  
              fill: new Fill({  
                  color: '#fff'  
              })  
          })  
        }); 
      }
      return style;  
    },
    /**
    * 动态设置元素文本内容（兼容）
    */
    setInnerText(element, text) {
      element.innerHTML = text;
    },
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