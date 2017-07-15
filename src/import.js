import Vue from 'vue'
import router from '@/router'
export { router }
import '@/main.postcss'
import VueI18n from 'vue-i18n'
import { messages, lang } from '@/locales.js'
Vue.use(VueI18n)
const i18n = new VueI18n({
  locale: lang,
  messages
})
export { i18n }

Vue.config.productionTip = false

export { Vue }
