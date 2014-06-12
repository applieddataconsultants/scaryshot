var page = require('webpage').create()
var system = require('system')

var env = JSON.parse(system.stdin.read())

var type = env.PHANTOM_TYPE || 'pdf'
var header = env.PHANTOM_HEADER || null
var footer = env.PHANTOM_FOOTER || null
var orientation = env.PHANTOM_ORIENTATION || 'portrait'

page.settings.localToRemoteUrlAccessEnabled = true

if (type == 'pdf')
  page.paperSize = {
    format: 'Letter',
    orientation: orientation,
    border: '1cm',
    header: header && {
      height: "0.9cm",
      contents: phantom.callback(function(pageNum, numPages) {
        return header.replace(/{{page}}/g, pageNum).replace(/{{pages}}/g, numPages)
      })
    },
    footer: footer && {
      height: "0.9cm",
      contents: phantom.callback(function(pageNum, numPages) {
        return footer.replace(/{{page}}/g, pageNum).replace(/{{pages}}/g, numPages)
      })
    }
  }

page.onLoadFinished = function () {
  setTimeout(function () {
    page.render(env.PHANTOM_TMP_NAME)
    phantom.exit()
  }, env.PHANTOM_DELAY)
}

setTimeout(function () { phantom.exit() }, 20000)

if (env.PHANTOM_URL) {
  console.log('rendering - ', env.PHANTOM_URL)
  page.open(env.PHANTOM_URL)
} else {
  console.log('rendering - ', env.PHANTOM_HTML.substring(0, 2000))
  page.setContent(env.PHANTOM_HTML, 'http://localhost')
}
