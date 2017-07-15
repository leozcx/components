// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import App from '@/App'
import * as dep from '@/import'

/* eslint-disable no-new */
new dep.Vue({
  el: '#app',
  router: dep.router,
  i18n: dep.i18n,
  template: '<App/>',
  components: { App }
})
