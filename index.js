'use strict';

class Resolver {

  /**
   * Create an array of callbacks and call done only once all have been resolved.
   *
   * @param {integer} callbackNumber - The number of callbacks to produce and require.
   * @param {object} options - An optional object with settings.
   * @param {object} options.timeoutMilliSeconds - An optional timeout to set.
   * @param {function} done - The callback to call once all
   * @return {Array} - An array of functions to be bound to callbacks.
   */
  static resolver(callbackNumber, options, done) {
    if (typeof options === 'function') {
      done = options;
      options = {};
    }
    var resolver = new Resolver(options);
    return resolver.createCallbacks(callbackNumber, done);
  }

  /**
   * Create an array of callbacks and call done only once all have been resolved.
   *
   * @param {integer} callbackNumber - The number of callbacks to produce and require.
   * @param {function} done - The callback to call once all
   * @return {Array} - An array of functions to be bound to callbacks.
   */
  constructor(options) {
    options = options || {};
    this.callbacks = [];
    this.results = [];
    this.calledCallbacks = 0;
    this.timeoutMilliSeconds = options.timeoutMilliSeconds || false;
  }

  createCallbacks(callbackNumber, done) {
    this.callbackNumber = callbackNumber;
    for (var i = 0; i < callbackNumber; i++) {
      this.callbacks.push(this.createCallback(done));
    }
    if (this.timeoutMilliSeconds) {
      this.timeout = setTimeout(function() {
        done(new Error('Timeout exceeded waiting for callback to be called.'));
      }, this.timeoutMilliSeconds);
    }
    return this.callbacks;
  }

  createCallback(done) {
    var self = this;
    return function() {
      var error = null;
      self.results.push(arguments);
      self.calledCallbacks++;
      if (self.calledCallbacks === self.callbackNumber) {
        if (self.hasErrors(self.results)) {
          error = new Error('Errors occurred');
          error.errors = self.getErrors(self.results);
        }
        clearTimeout(self.timeout);
        done(error, self.results);
      }
    };
  }

  hasErrors(results) {
    return this.getErrors(results).length;
  }

  getErrors(results) {
    var errors = [];
    for (let index in results) {
      if (results.hasOwnProperty(index)) {
        let result = results[index];
        if (result[0]) {
          var error = {
            callback: index,
            error: result[0],
          };
          errors.push(error);
        }
      }
    }
    return errors;
  }

}

module.exports = Resolver;
