# Multiple Callback Resolver
[![Build Status](https://travis-ci.org/tizzo/node-multiple-callback-resolver.svg?branch=master)](https://travis-ci.org/tizzo/node-multiple-callback-resolver)
[![Coverage Status](https://coveralls.io/repos/tizzo/node-multiple-callback-resolver/badge.svg?branch=master&service=github)](https://coveralls.io/github/tizzo/node-multiple-callback-resolver?branch=master)

This project contains a simple class that allows you to instantiate callback functions
and then execute a final callback when all of the generated callbacks complete. This
is especially useful in testing that a set of events is emitted in a test case or in
fanning out a set of work and running some code after all of a set of callbacks has
been invoked.

Let's say you have a class called `Something` and it emits 3 events when
when the `run()` method is processed.

```` javascript
var Resolver = require('multiple-callback-resolver');
var resolver = new Resolver();
resolver.resolve(function(error, results) {
  // Get the data sent on the 'start' event.
  results[0];
  // Get the data sent on the 'in progress' event.
  results[1];
  // Get the data sent on the 'end' event.
  results[2];
  // Data sent to the callback provided to the `run()` method.
  results[3];
};
var something = new Something();
something.on('start', resolver.createCallback());
something.on('in progress', resolver.createCallback());
something.on('end', resolver.createCallback());
something.run(resolver.createCallback());
````

Optionally, you may set a timeout:

```` javascript
var Resolver = require('multiple-callback-resolver');
var callbacks = Resolver.resolve(2, {timeoutMilliSeconds: 10}  function(error, results) {
  console.log(error);
  // `[ 'Timeout exceeded waiting for callback to be called.' ]`
};
// Here we call one of the two callbacks created, but not both.
callbacks[0]();
````


