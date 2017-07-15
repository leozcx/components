var path = require('path')
var fs = require('fs')

const dataFilePath = path.join(__dirname, '..', 'data') 

function api(app, router) {
  router.route('/:filename').get(function(req, res) {
    processFile(req, res)
  })
  router.route('/:filename').post(function(req, res) {
    processFile(req, res)
  })
}

function processFile(req, res, basePath, filename) {
  basePath = basePath || dataFilePath
  filename = filename || req.params.filename
  if (filename.indexOf('json') === -1) {
    filename += '.json'
  }
  var file = path.join(basePath, filename)
  if(fs.existsSync(file)) {
    res.json(JSON.parse(fs.readFileSync(file, 'utf8')))
  } else {
    res.statusCode = 404
    res.end()
  }
}

module.exports = api
