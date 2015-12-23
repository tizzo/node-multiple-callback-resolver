'use strict';

var should = require('should');
var Resolver = require('..');
var resolver = Resolver.resolver;

describe('multiple callback resolver', function() {
  it('should generate the configured number of callbacks and call the provided callback once all have completed', function(done) {
    var callbacks = resolver(3, done);
    callbacks.length.should.equal(3);
    callbacks[0]();
    callbacks[1]();
    callbacks[2]();
  });
  it('should work with just one function.', function(done) {
    var callbacks = resolver(1, done);
    callbacks.length.should.equal(1);
    callbacks[0]();
  });
  it('should exit with an error if any of the callbacks sent an error', function(done) {
    var callbacks = resolver(2, function(error, results) {
      should.exist(error);
      should.exist(error.errors);
      error.errors.length.should.equal(1);
      error.errors[0].error.message.should.equal('Something went wrong.');
      done();
    });
    callbacks[0](new Error('Something went wrong.'));
    callbacks[1]();
  });
  it('should not exit with an error if the callbacks are generated in nonError mode', function(done) {
    var callbacks = resolver(2, {nonError: true}, function(error, results) {
      should.not.exist(error);
      done();
    });
    callbacks[0](new Error('Something went wrong.'));
    callbacks[1]();
  });
  it('should return the data provided and errors that occurred for any callbacks that completed', function(done) {
    var callbacks = resolver(2, function(error, results) {
      results[0][1].foo.should.equal('bar');
      should.exist(error);
      results[0][0].message.should.equal('Error on item one');
      should.not.exist(results[1][0]);
      results[1][1].bar.should.equal('baz');
      done();
    });
    callbacks[0](new Error('Error on item one'), {foo: 'bar'});
    callbacks[1](null, {bar: 'baz'});
  });
  it('should allow a conifgurable timeout and should error if that timeout is reached', function(done) {
    var callbacks = resolver(2, {timeoutMilliSeconds: 2}, function(error, data) {
      done();
    });
    callbacks.pop()();
  });
  it('should allow the callbacks to be created individually and the reolve callback to be specified separately', function(done) {
    var resolver = new Resolver();
    var one = resolver.createCallback();
    var two = resolver.createCallback();
    resolver.resolve(done);
    one();
    two();
  });
});
