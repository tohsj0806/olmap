// import olMap from "./components/olMap.vue"
// const olMapObj = {}
// olMapObj.install = (Vue) =>{
//     if(olMapObj.install.installed) return
//     Vue.component(olMapObj.name, olMap)
// }
// if (typeof window !== "undefined" && window.Vue){
//     olMapObj.install(window.Vue)
// }
// export default olMapObj

import olMap from './components/olMap.vue'

olMap.install = Vue => Vue.component(olMap.name, olMap) // 给组件配置install方法 

export default olMap;