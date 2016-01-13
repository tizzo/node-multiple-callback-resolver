'use strict';

class Resolver {

  /**
   * Create an array of callbacks and call done only once all have been resolved.
   *
   * @param {integer} callbackNumber - The number of callbacks to produce and require.
   * @param {object} options - An optional object with settings.
   * @param {object} options.timeoutMilliSeconds - An optional timeout to set.
   * @param {object} options.nonError - Do not assume that the first parameter is an error.
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
   * @param {object} options - An optional object with settings.
   * @param {object} options.timeoutMilliSeconds - An optional timeout to set.
   * @param {object} options.nonError - Do not assume that the first parameter is an error.
   */
  constructor(options) {
    options = options || {};
    this.callbacks = [];
    this.results = [];
    this.timeoutMilliSeconds = options.timeoutMilliSeconds || false;
    this.nonError = options.nonError || false;
    this.resolveFunction = null;
  }

  resolve(done) {
    this.resolveFunction = done;
  }

  createCallbacks(callbackNumber, done) {
    this.resolve(done);
    for (var i = 0; i < callbackNumber; i++) {
      this.createCallback();
    }
    this.startTimer();
    return this.callbacks;
  }

  startTimer() {
    var self = this;
    if (this.timeoutMilliSeconds) {
      this.timeout = setTimeout(function() {
        self.resolveFunction(new Error('Timeout exceeded waiting for callback to be called.'));
      }, this.timeoutMilliSeconds);
    }
  }

  createCallback() {
    var self = this;
    var callback = function() {
      var error = null;
      self.results.push(arguments);
      if (self.results.length === self.callbacks.length) {
        if (!self.nonError && self.hasErrors(self.results)) {
          error = new Error('Errors occurred');
          error.errors = self.getErrors(self.results);
        }
        clearTimeout(self.timeout);
        self.resolveFunction(error, self.results);
      }
      else if (self.results.length > self.callbacks.length) {
        throw new Error('Callback called more than once.');
      }
    };
    self.callbacks.push(callback);
    return callback;
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
