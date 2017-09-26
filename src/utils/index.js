function isFunction(fn) {
  return typeof fn === 'function'
}

function isObjectOrFunction(x) {
  var type = typeof x
  return (type === 'object' && x !== null) || type === 'function'
}

function getThen(x) {
  // if error occured when retrieving then property
  // then the promise became rejected
  try {
    return x.then
  } catch(err) {
    return new ErrorObject(err)
  }
}


function ErrorObject(e) {
  this.error = e
}

function NOOP() {}

const PENDING = 0
const FULFILLED = 1
const REJECTED = 2
const ADOPTED = 3

module.exports = {
  isFunction,
  isObjectOrFunction,
  ErrorObject,
  getThen,
  NOOP,
  PENDING,
  FULFILLED,
  REJECTED,
  ADOPTED
}
