<template>
  <div ref="rootmap" class="map">
    <!-- Popup -->
    <div id="popup" class="ol-popup" ref="popup">
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

export default {
  name: 'olMap',
  props: {
    modal: {},
  },
  data(){
    return {
      map: null,
      mapTarget: null,
      vectorLayer: null,
      vectorSource: null,
      markersData: [],
      featuerInfo: {
        geo: [],
        att: {
            title: "北京市(中华人民共和国首都)", //标注信息的标题内容
            text: "", //内容
        }
      },
      clickEvent: null
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
  },
  mounted(){
    this.initMap()
  },
  methods:{
    initMap(){
      let map = this.$refs.rootmap
      map.style.cursor = "pointer"
      let beijing = [116.28, 39.54]
      let changsha = [113,	28.21]
      this.map = new Map({
        target: map,
        layers: mapConfig.streetMap(),
        view: new View({
          projection: "EPSG:4326", 
          center: [mapConfig.x, mapConfig.y],  
          minZoom: 1,
          zoom: mapConfig.zoom
        })
      })
      //矢量标注的数据源
      this.vectorSource = new VectorSource({
          features: []
      })
      //矢量标注图层
      this.vectorLayer = new VectorLayer({
          source: this.vectorSource
      })
      this.map.addLayer(this.vectorLayer)
    },
    clearMap(){
      let features = this.vectorSource.getFeatures()
      if(features.length > 0) {
        features.forEach(item => {
          this.vectorSource.removeFeature(item)
        })
      }
    },
    /**
    * 删除marker坐标
    * @param {feature} id
    */
    removeMarker(id){
      let features = this.vectorSource.getFeatures()
      let removeFeatureMarker = features.find(item => item.get('id') == id)
      if(removeFeatureMarker) this.vectorSource.removeFeature(removeFeatureMarker)
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
      this.vectorSource.addFeature(feature)
      if(marker.content){
          this.map.addOverlay(this.setPopup("popup"))
          let popup = this.map.getOverlayById("popup")
          popup.setPosition(marker.position); //设置popup的位置
          this.featuerInfo.geo = marker.position
          this.featuerInfo.att.text = marker.content;//正文
          this.featuerInfo.att.title = marker.title;//标题
          this.$refs.content.innerHTML = ''; //清空popup的内容容器
          this.addFeatrueInfo(this.featuerInfo); //在popup中加载当前要素的具体信息
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
      markers.forEach(item => { 
        //实例化Vector要素，通过矢量图层添加到地图容器中
        let iconFeature = new Feature({
          id: item.id,
          title: item.title,
          geometry: new Point(item.position),
          icon: item.icon,
        })
        iconFeature.setStyle(this.createLabelStyle(iconFeature))
        this.vectorSource.addFeature(iconFeature)
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
          popup.setPosition(popupData.position); //设置popup的位置
        }
      });
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
      // let param = "index=0" + "&" + "n_jd=" +  point[0]+ "&" + "n_wd=" + point[1];
      // getAddress(param).then(res=>{
      //   console.log(res)
      //   this.$emit("positionResult", res)
      // })
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
          autoPanAnimation: {
            //当Popup超出地图边界时，为了Popup全部可见，地图移动的速度
            duration: 250
          }
      });
    },
    closePopup(){
      let popup = this.map.getOverlayById("popup")
      popup.setPosition(undefined);
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
      this.vectorSource.addFeature(newFeature);
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
</style>
