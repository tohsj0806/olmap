import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'

let streetMap = () => {
    let mapType = 0
    if(window.location.href.indexOf("10.")>-1) {
        mapType = 1
    }
    let mapLayer = null
    switch(mapType){
        case 0:
            //在线
            mapLayer = new TileLayer({
                source: new XYZ({
                    url:'https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}'
                })
            })
            break
        case 1:
            // 离线
            mapLayer = new TileLayer({
                source: new XYZ({
                    url:"自己的地图"
                })
            })
            break
    }
    return [mapLayer]
}

let mapConfig = {
    x: 110,
    y: 37.5,
    zoom: 5,
    streetMap:streetMap,
    baseUrl: {
        dev: '/',
        pro: '/'
    },
}

export default mapConfig