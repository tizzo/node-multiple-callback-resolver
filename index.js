'use strict';

/**
 * Create an array of callbacks and call done only once all have been resolved.
 *
 * @param {integer} callbackNumber - The number of callbacks to produce and require.
 * @param {object} options - An optional object with settings.
 * @param {object} options.timeoutMicroseconds - An optional timeout to set.
 * @param {function} done - The callback to call once all
 * @return {Array} - An array of functions to be bound to callbacks.
 */
function resolver(callbackNumber, options, done) {
  var timeout;
  var timeoutMicroseconds;
  var callbacks = [];
  var results = [];
  var calledCallbacks = 0;
  if (typeof options == 'function') {
    done = options;
    options = {};
  }
  timeoutMicroseconds = options.timeoutMicroseconds || 3000;
  timeout = setTimeout(function() {
    done(new Error('Timeout exceeded waiting for callback to be called.'));
  }, timeoutMicroseconds);
  function createCallback() {
    return function() {
      var error = null;
      results.push(arguments);
      calledCallbacks++;
      if (calledCallbacks === callbackNumber) {
        if (hasErrors(results)) {
          error = new Error('Errors occurred');
          error.errors = getErrors(results);
        }
        clearTimeout(timeout);
        done(error, results);
      }
    };
  }
  for (var i = 0; i < callbackNumber; i++) {
    callbacks.push(createCallback());
  }
  return callbacks;
}

function hasErrors(results) {
  return getErrors(results).length;
}

function getErrors(results) {
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


module.exports = resolver;
