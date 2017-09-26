'use strict'

const asap = require('asap/raw')
const {
  isFunction,
  isObjectOrFunction,
  ErrorObject,
  getThen,
  NOOP,
  PENDING,
  FULFILLED,
  REJECTED,
  ADOPTED
} = require('./utils')


// States:
//
// PENDING: 0
// FULFILLED: 1
// REJECTED: 2
// ADOPTED: 3, adopt the state of other promises
//
function Promise (executor) {
  // current state of the promise
  this._state = PENDING
  // result of the promise once its fulfilled or rejected
  this._result = null
  // store the handlers attached by calling then
  this.handlers = []

  if(!(this instanceof Promise)) {
    throw new TypeError('Construt promise without using new operator !')
  }

  if(!isFunction(executor)) {
    throw new TypeError('The promise executor is not a function')
  }

  // if the promise was the return value of then method
  // there's no need to invoke the executor
  if(executor !== NOOP) {
    execute(executor, this)
  }
}

Promise.prototype.then = function(onFulfilled, onRejected) {
  var next = new Promise(NOOP)
  deferredHandlers(this, new Handler(onFulfilled, onRejected, next))
  // then method always return a new promise
  return next
}

Promise.prototype.catch = function(onRejected) {
  // dont forget to return the promise
  return this.then(null, onRejected)
}

// alter the state of the promise to fulfilled
function fulfill(promise, value) {
  promise._state =  FULFILLED
  promise._result = value

  done(promise)
}

// alter the state of the promise to rejected
function reject(promise, reason) {
  promise._state = REJECTED
  promise._result = reason

  done(promise)
}

function resolve(promise, x) {
  // if an error occured during the resolution
  // then the promise became rejected
  if(promise === x) {
    reject(promise, new TypeError('A promise can not be resolved with itself !'))
    return
  }
  // if x is either a function or an object
  if(isObjectOrFunction(x)) {
    var then = getThen(x)

    // if error occured when retrieving the then property
    // reject with the thrown error
    if(then instanceof ErrorObject) {
      reject(promise, then.error)
      return
    }

    // if x is a promise
    if(then === promise.then && x instanceof Promise) {
      promise._state = ADOPTED
      promise._result = x
      return
    }
    // if then is a function
    // call it with x as this
    else if(isFunction(then)) {
      execute(then.bind(x), promise)
      return
    }
  }
  // if x is neither an object nor a function
  // fulfill the promise with x
  fulfill(promise, x)
}

// this function does the actual resove part
function execute(fn, promise) {
  // the promise can only resolve or
  // reject once
  var settled = false
  try {
    fn(function(value) {
      if (settled) return
      settled = true
      resolve(promise, value)
    }, function(reason) {
      if (settled) return
      settled = true
      reject(promise, reason)
    })
  } catch(err) {
    reject(promise, err)
  }
}

// Handler object
function Handler(onFulfilled, onRejected, promise) {
  this.onFulfilled = isFunction(onFulfilled) ? onFulfilled : null
  this.onRejected = isFunction(onRejected) ? onRejected : null
  this.next = promise
}

function deferredHandlers(promise, deferred) {
  // retrieve the depest promise
  // as we using a promise to resovle its parent promise before
  // hence, the outermost promise's result equivalents to
  // the innermost promise's result
  while(promise._state === ADOPTED) {
    promise = promise._result
  }

  if(promise._state === PENDING) {
    promise.handlers.push(deferred)
    return
  }

  triggerHandlers(promise, deferred)
}

function done(promise) {
  if(promise.handlers.length === 1) {
    deferredHandlers(promise, promise.handlers.pop())
    promise.handlers = []
  }
  if(promise.handlers.length > 1) {
    for(let i = 0; i< promise.handlers.length; i++) {
      deferredHandlers(promise, promise.handlers[i])
    }
    promise.handlers = []
  }
}

function triggerHandlers(promise, handler) {
  // handlers were called asynchorously
  // with 'asap' module
  asap(function() {
    // retrieve the callback as fulfilled handler or rejected handler
    var callback = promise._state === FULFILLED ? handler.onFulfilled : handler.onRejected

    if(callback === null) {
      // if there's no given handler
      // we pass the result to the next promise
      // and resolve it with the same result
      // or reject it with the same reason
      if(promise._state === FULFILLED) {
        resolve(handler.next, promise._result)
      } else {
        reject(handler.next, promise._result)
      }
      return
    } else {
      try {
        // this is where we actually invoke the handler
        // and use its return value as the next promise's resolution
        var ret = callback(promise._result)
        resolve(handler.next, ret)
      } catch(err) {
        reject(handler.next, err)
      }
    }
  })
}

module.exports = Promise
