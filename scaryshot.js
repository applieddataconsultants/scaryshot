#!/usr/bin/env node

var cp = require('child_process')
var os = require('os')
var fs = require('fs')
var http = require('http')
var url = require('url')
var qs = require('querystring')
var port = process.argv[2] || 3000

var tmpdir = os.tmpdir()
var tmpid = Date.now()
var indexHtml = fs.readFileSync(__dirname+'/index.html').toString()

var mimes = {
  'pdf': 'application/pdf',
  'png': 'image/png',
  'jpeg': 'image/jpeg',
  'jpg': 'image/jpeg',
  'gif': 'image/gif'
}

function make (opts, res) {
  function error (message) {
    res.writeHead(200)
    res.end(message)
  }

  if (!opts || (!opts.url && !opts.html)) return error('The "url" or "html" parameter is required')

  var type = opts.type || 'pdf'
  if (!mimes[type]) return error('Type "'+type+'" is not supported.  The following types are supported: '+Object.keys(mimes))

  var name = opts.name || 'output'
  var path = tmpdir+'phantom-'+(tmpid++)+'.'+type

  if (opts.url && !/^http/.test(opts.url)) opts.url = 'http://'+opts.url

  var env = {
    PHANTOM_URL: opts.url,
    PHANTOM_TYPE: type,
    PHANTOM_TMP_NAME: path,
    PHANTOM_HTML: opts.html,
    PHANTOM_DELAY: opts.delay || 0
  }
  cp.exec('phantomjs '+__dirname+'/render.js', { env: env, timeout: 30000 }, function (er, stdout, sterr) {
    console.log(stdout, sterr)
    if (er) {
      console.error(er)
      return error('Unable to render webpage')
    }
    res.writeHead(200, {
      'Content-Type': mimes[type],
      'Content-Disposition': 'attachment; filename='+name+'.'+type
    })
    console.log(path)
    fs.createReadStream(path).on('error', function (er) {
      res.end()
    }).pipe(res)
  })
}

http.createServer(function (req, res) {
  var parsed = url.parse(req.url, true)
  if (req.method == 'GET') return route(parsed.query)

  var data = ''
  req.setEncoding('utf8')
  req.on('readable', function () { data += req.read() })
  req.on('end', function () { route(qs.parse(data)) })
  req.on('error', console.error)

  function route (query) {
    switch (parsed.pathname) {
      case '/generate':
      case '/generate/':
        make(query, res)
        break;
      default:
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(indexHtml)
    }
  }
}).listen(port)

console.log('Scaryshot listening on port', port)
