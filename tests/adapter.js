const Promise = require('../src/index')

function deferred() {
  var resolve, reject
  var promise = new Promise(function(_resolve,_reject) {
    resolve = _resolve
    reject = _reject
  })

  return {
    promise,
    resolve,
    reject
  }
}

module.exports = {
  deferred,
  resolved: Promise.resolve,
  rejected: Promise.reject
}
