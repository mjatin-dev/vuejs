import Vue from 'vue'
import App from './App.vue'
// import './registerServiceWorker'
import router from './AppRouter'
import store from './AppStore'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

Vue.config.productionTip = false

Vue.use(ToastService)
Vue.use(ConfirmationService)
Vue.filter('currency', (value) => {
  if (typeof value !== 'number') {
    return value
  }
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  })
  return formatter.format(value)
})

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')
