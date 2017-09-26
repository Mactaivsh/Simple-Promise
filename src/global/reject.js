var Promise = require('../core')

module.exports = Promise

Promise.reject = function(reason) {
  return new Promise(function(resolve, reject) {
    reject(reason)
  })
}
