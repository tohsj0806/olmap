import olMap from './components/olMap.vue'
import clusterMap from './components/clusterMap.vue'
import trackThePlaybackMap from './components/trackThePlaybackMap.vue'
let components = [
    olMap,
    clusterMap,
    trackThePlaybackMap
]
function install(Vue) {
    components.forEach(cpt => {
        Vue.component(cpt.name, cpt)
    })
}
export default {
    install,
    olMap,
    clusterMap,
    trackThePlaybackMap
}