import Vue from 'vue'
import App from './App.vue'
import olMap from './index.js'

Vue.use(olMap)
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
