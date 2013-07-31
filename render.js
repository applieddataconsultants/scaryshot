var env = require('system').env
var page = require('webpage').create()

var type = env.PHANTOM_TYPE || 'pdf'

if (type == 'pdf')
  page.paperSize = { format: 'Letter', orientation: 'portrait', border: '1cm' }

page.open(env.PHANTOM_URL, function () {
  setTimeout(function () {
    page.render(env.PHANTOM_TMP_NAME)
    phantom.exit()
  }, env.PHANTOM_DELAY)
})
