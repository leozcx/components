const _config = {
  common: {
  // put env independent variables here
  },
  development: {
    url1: '/data/a.json'
  },
  stage: {
    url1: 'http://stage-endpoint/data/a.json'
  },
  production: {
    url1: 'http://production-endpoint/data/a.json'
  }
}
let config
if (typeof Proxy !== 'function') {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Proxy is not supported in your browser')
  }
  let envConfig = _config[process.env.NODE_ENV || 'production']
  config = {..._config.common, ...envConfig}
} else {
  let handler = {
    get (target, name) {
      if (name in target) {
        return target[name]
      } else {
        let envConfig = target[process.env.NODE_ENV || 'production']
        return envConfig[name]
      }
    }
  }
  config = new Proxy(_config, handler)
}
export {config}
