var request = require('supertest')
var test = require('tape')
var fs = require('fs')
var app = require('./')
var sampleUrlWithProtocol = 'http://www.google.com/'
var sampleUrl = 'www.google.com'
var join = require('path').join

function end(t) {
  return function(er) {
    t.notOk(er)
    t.end()
  }
}

test('/generate', function(ts) {
  ts.test('should fail if no url or html param supplied', function(t) {
    request(app)
      .get('/generate')
      .expect('content-type', 'application/json')
      .end(function(er, res) {
        t.equal(res.body.status, 400, 'expected 400 status property')
        t.ok(res.body.message, 'expected an error message')
        t.end()
      })
  })

  ts.test('should fail if invalid type param supplied', function(t) {
    request(app)
      .post('/generate')
      .type('form')
      .send({url: 'google.com', type: 'tiff'})
      .end(function(er, res) {
        t.equal(res.body.status, 400, 'expected 400 status property')
        t.ok(/tiff/.test(res.body.message), 'expected tiff within error message')
        t.end()
      })
  })

  ts.test('should accept url with protocol', function(t) {
    request(app)
      .get('/generate')
      .query({url: sampleUrlWithProtocol})
      .expect('content-type', 'application/pdf')
      .expect(200, end(t))
  })

  ts.test('should accept url without protocol', function(t) {
    request(app)
      .post('/generate')
      .type('form')
      .send({url: sampleUrl})
      .expect('content-type', 'application/pdf')
      .expect(200, end(t))
  })
  ts.test('should generate png files', function(t) {
    request(app)
      .get('/generate')
      .query({url: sampleUrl, type: 'png'})
      .expect('content-type', 'image/png')
      .expect(200, end(t))
  })
  ts.test('should generate gif files', function(t) {
    request(app)
      .post('/generate')
      .type('form')
      .send({url: sampleUrl, type: 'gif'})
      .expect('content-type', 'image/gif')
      .expect(200, end(t))
  })
  ts.test('should generate jpeg files', function(t) {
    request(app)
      .get('/generate')
      .query({url: sampleUrl, type: 'jpeg'})
      .expect('content-type', 'image/jpeg')
      .expect(200, end(t))
  })
  ts.test('should generate jpg files', function(t) {
    request(app)
      .post('/generate')
      .type('form')
      .send({url: sampleUrl, type: 'jpg'})
      .expect('content-type', 'image/jpeg')
      .expect(200, end(t))
  })
  ts.test('should generate output from html', function(t) {
    request(app)
      .get('/generate')
      .query({html: '<h1>Hello World</h1>', type: 'png'})
      .expect('content-type', 'image/png')
      .expect(200, end(t))
  })
  ts.test('should handle large html input', function(t) {
    request(app)
      .post('/generate')
      .type('form')
      .send({html: fs.readFileSync(join(__dirname, '/testdata/large.html')).toString(), type: 'png'})
      .expect('content-type', 'image/png')
      .expect(200, end(t))
  })
})
