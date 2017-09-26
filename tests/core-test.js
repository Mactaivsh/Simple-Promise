const promisesAplusTests = require('promises-aplus-tests')
const adapter = require('./adapter')

promisesAplusTests(adapter, { reporter: "dot" }, function (err) {
  // As before.
});