var env = require('system').env
var page = require('webpage').create()

var type = env.PHANTOM_TYPE || 'pdf'
var header = env.PHANTOM_HEADER || null
var footer = env.PHANTOM_FOOTER || null

page.settings.localToRemoteUrlAccessEnabled = true

if (type == 'pdf')
  page.paperSize = {
    format: 'Letter',
    orientation: 'portrait',
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

if (env.PHANTOM_URL) {
  console.log('rendering - ', env.PHANTOM_URL)
  page.open(env.PHANTOM_URL)
} else {
  console.log('rendering - ', env.PHANTOM_HTML)
  page.setContent(env.PHANTOM_HTML, 'http://localhost')
}
