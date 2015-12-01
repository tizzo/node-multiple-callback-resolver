# Multiple Callback Resolver

This project contains a simple class that allows you to instantiate callback functions
and then execute a final callback when all of the generated callbacks complete. This
is especially useful in testing that a set of events is emitted in a test case or in
fanning out a set of work and then 

Let's say you have a class called `Something` and it emits 3 events when
when the `run()` method is processed.

```` javascript
var Resolver = require('multiple-callback-resolver');
var callbacks = Resolver.resolve(3, function(error, results) {
  // Get the data sent on the 'start' event.
  results[0];
  // Get the data sent on the 'in progress' event.
  results[1];
  // Get the data sent on the 'end' event.
  results[2];
};
var something = new Something();
something.on('start', callbacks[0]);
something.on('in progress', callbacks[1]);
something.on('end', callbacks[2]);
something.start();
````

*Optionally, you may set a timeout:*

```` javascript
var Resolver = require('multiple-callback-resolver');
var callbacks = Resolver.resolve(1, function(error, results) {
  console.log(error);
  // `[ 'Timeout exceeded waiting for callback to be called.' ]`
};
````


