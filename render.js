var env = require('system').env
var page = require('webpage').create()

var type = env.PHANTOM_TYPE || 'pdf'
page.settings.localToRemoteUrlAccessEnabled = true

if (type == 'pdf')
  page.paperSize = { format: 'Letter', orientation: 'portrait', border: '1cm' }

function render () {
  setTimeout(function () {
    page.render(env.PHANTOM_TMP_NAME)
    phantom.exit()
  }, env.PHANTOM_DELAY)
}

if (env.PHANTOM_URL) {
  console.log('rendering - ', env.PHANTOM_URL)
  page.open(env.PHANTOM_URL, render)
} else {
  console.log('rendering - ', env.PHANTOM_HTML)
  page.content = env.PHANTOM_HTML
  if (env.PHANTOM_HTML.match(/http/)) setTimeout(render, 2000) // assumed content has ext. resources -> crude way to load requests until we have an event triggered after all resources have been loaded
  else render()
}
