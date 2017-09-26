var Promise = require('../core')
const {
  FULFILLED,
  isFunction,
  isObjectOrFunction,
  NOOP
} = require('../utils')

function createPromiseWithValue(value) {
  var p = new Promise(NOOP)
  p._state = FULFILLED
  p._result = value
  return p
}

module.exports = Promise

Promise.resolve = function(value) {
  // if the value is a promise, return the promise
  if(value instanceof Promise) return value

  if(typeof value !== 'object' || typeof value === null) return createPromiseWithValue(value)

  if(isObjectOrFunction(value)) {
    try {
      var then = value.then
      if(isFunction(then)) {
        return new Promise(then.bind(value))
      }
    } catch(err) {
      return new Promise(function(resolve, reject) {
        reject(err)
      })
    }
  }

  return createPromiseWithValue(value)
}
