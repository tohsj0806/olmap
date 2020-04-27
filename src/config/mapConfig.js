import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'

let streetMap = (xyzSource) => {
    let mapLayer = new TileLayer({
        source: new XYZ({
            url: xyzSource || 'https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}'
        })
    })
    return [mapLayer]
}

let mapConfig = {
    x: 110,
    y: 37.5,
    zoom: 9,
    streetMap:streetMap,
    baseUrl: {
        dev: '/',
        pro: '/'
    },
}

export default mapConfig