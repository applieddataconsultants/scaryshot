var request = require('supertest')
var fs = require('fs')
var assert = require('assert')
var app = require('../')
var sampleUrlWithProtocol = "http://www.google.com/"
var sampleUrl = "www.google.com"

describe('/generate', function () {
  this.timeout(20000)

  it('should fail if no url or html param supplied', function (done) {
    request(app)
      .get('/generate')
      .expect('content-type', 'application/json')
      .expect(400)
      .end(function (er, res) {
        if (er) return done(er)

        assert.equal(res.body.status, 400, 'expected 400 status property')
        assert.ok(res.body.message, 'expected an error message')
        done()
      })
  })
  it('should fail if invalid type param supplied', function (done) {
    request(app)
      .post('/generate')
      .type('form')
      .send({ url: 'google.com', type: 'tiff' })
      .expect('content-type', 'application/json')
      .expect(400)
      .end(function (er, res) {
        if (er) return done(er)

        assert.equal(res.body.status, 400, 'expected 400 status property')
        assert.ok(/tiff/.test(res.body.message), 'expected tiff within error message')
        done()
      })
  })
  it('should accept url with protocol', function (done) {
    request(app)
      .get('/generate')
      .query({ url: sampleUrlWithProtocol })
      .expect('content-type', 'application/pdf')
      .expect(200, done)
  })
  it('should accept url without protocol', function (done) {
    request(app)
      .post('/generate')
      .type('form')
      .send({ url: sampleUrl })
      .expect('content-type', 'application/pdf')
      .expect(200, done)
  })
  it('should generate png files', function (done) {
    request(app)
      .get('/generate')
      .query({ url: sampleUrl, type: 'png' })
      .expect('content-type', 'image/png')
      .expect(200, done)
  })
  it('should generate gif files', function (done) {
    request(app)
      .post('/generate')
      .type('form')
      .send({ url: sampleUrl, type: 'gif' })
      .expect('content-type', 'image/gif')
      .expect(200, done)
  })
  it('should generate jpeg files', function (done) {
    request(app)
      .get('/generate')
      .query({ url: sampleUrl, type: 'jpeg' })
      .expect('content-type', 'image/jpeg')
      .expect(200, done)
  })
  it('should generate jpg files', function (done) {
    request(app)
      .post('/generate')
      .type('form')
      .send({ url: sampleUrl, type: 'jpg' })
      .expect('content-type', 'image/jpeg')
      .expect(200, done)
  })
  it('should generate output from html', function (done) {
    request(app)
      .get('/generate')
      .query({ html: '<h1>Hello World</h1>', type: 'png' })
      .expect('content-type', 'image/png')
      .expect(200, done)
  })
  it('should handle large html input', function (done) {
    request(app)
      .post('/generate')
      .type('form')
      .send({ html: fs.readFileSync(__dirname+'/fixtures/large.html').toString(), type: 'png' })
      // .expect('content-type', 'image/png')
      .expect(200, function (er, res) {
        console.log(res.body)
        done()
      })
  })
})
