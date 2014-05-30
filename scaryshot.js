#!/usr/bin/env node

var cp = require('child_process')
var os = require('os')
var fs = require('fs')
var http = require('http')
var url = require('url')
var qs = require('querystring')
var port = process.argv[2] || 3000

var tmpdir = os.tmpdir() + '/'
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
  function error (code, message) {
    res.writeHead(code, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: code, message: message }))
  }

  if (!opts || (!opts.url && !opts.html)) return error(400, 'The "url" or "html" parameter is required')

  var type = opts.type || 'pdf'
  if (!mimes[type]) return error(400, 'Type "'+type+'" is not supported.  The following types are supported: '+Object.keys(mimes))

  var name = opts.name || 'output'
  var path = tmpdir+'phantom-'+(tmpid++)+'.'+type

  if (opts.url && !/^http/.test(opts.url)) opts.url = 'http://'+opts.url

  var env = JSON.stringify({
    PHANTOM_URL: opts.url || '',
    PHANTOM_TYPE: type,
    PHANTOM_TMP_NAME: path,
    PHANTOM_HTML: opts.html || '',
    PHANTOM_DELAY: opts.delay || 0,
    PHANTOM_HEADER: opts.header || '',
    PHANTOM_FOOTER: opts.footer || ''
  })

  var child = cp.spawn('phantomjs', [__dirname+'/render.js'], { stdio: [ 'pipe', process.stdout, process.stderr ] })
  child.stdin.write(env)
  child.stdin.end()

  child.on('error', function (er) {
    return error(500, 'Unable to render webpage')
    child.kill()
  })
  child.on('exit', function () {
    if (res.headersSent) return // sent an error

    res.writeHead(200, {
      'Content-Type': mimes[type],
      'Content-Disposition': 'attachment; filename='+name+'.'+type
    })
    fs.createReadStream(path)
      .on('error', function (er) {
        res.end()
      })
      .on('end', function () {
        fs.unlink(path, function (er) { // clean up tmp file
          if (er) return console.error(er)
          else console.log('unlinked', path)
        })
      })
      .pipe(res)
  })
}

var server = module.exports = http.createServer(function (req, res) {
  var parsed = url.parse(req.url, true)
  if (req.method == 'GET') return route(parsed.query)

  var data = ''
  req.setEncoding('utf8')
  req.on('data', function (chunk) { data += chunk })
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
})

if (!module.parent) {
  server.listen(port)
  console.log('Scaryshot listening on port', port)
}
