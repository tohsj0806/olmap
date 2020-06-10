import olMap from './components/olMap.vue'
import clusterMap from './components/clusterMap.vue'
let components = [
    olMap,
    clusterMap
]
function install(Vue) {
    components.forEach(cpt => {
        Vue.component(cpt.name, cpt)
    })
}
export default {
    install,
    olMap,
    clusterMap
}