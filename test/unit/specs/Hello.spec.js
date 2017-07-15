import Vue from 'vue'
import Hello from '@/components/Hello'
import * as dep from '@/import'
import { config } from '@/config'
import { events } from './data.js'

import MockAdapter from 'axios-mock-adapter'
import axios from 'axios'
// mock data
let mock = new MockAdapter(axios)
mock.onGet('/data/test').reply(200, {
  data: {
    permission: false
  }
})

describe('Hello.vue', () => {
  it('should render correct contents', () => {
    const Constructor = dep.Vue.extend(Hello)
    expect(vm.$el.querySelector('.hello h1').textContent)
      .to.equal('Welcome to Your Vue.js App')
  })
})
