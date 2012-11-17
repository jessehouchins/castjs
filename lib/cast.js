/*!
  * cast - validation and conversion library
  * https://github.com/jessehouchins/castjs
  * copyright Jesse Houchins
  * MIT License
  */

!function (name, definition) {
  if (typeof module != 'undefined') module.exports = definition()
  else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
  else this[name] = definition()
}('cast', function () {

  // ### CAST MODULE

  function Cast(x){
    this.value = x
    this.converted = {
      valid: true,
      value: clone(x)
    }
    setup(this)
  }

  Cast.fn = function(name, fn){
    methods[name] = fn
  }

  Cast.prototype = {

    VERSION: '0.0.1',

    fn: Cast.fn

  }


  // ### VARIABLES

  var methods = {}


  // ### PRIVATE METHODS

  function setup(self){
    function responder(x){
      if (x !== self.value && x === true || x === false) validate(self, x)
      else convert(self, x)
    }
    // buld shim methods
    var shims = {}
    for (var name in methods) {
      if (self[name] === undefined) {
        (function(self, methods, shims, name){
          self[name] = shims[name] = function(){
            var args = [responder, self.converted.value].concat(Array.prototype.slice.call(arguments, 0))
            methods[name].apply(null, args)
            return self
          }
          self[name].castMethodName = name
          self[name].castMethod = true
        })(self, methods, shims, name)
      }
    }
    // add references to each shim
    for (var shim in shims) {
      for (var ref in shims) {
        (function(shims, shim, ref){
          shims[shim][ref] = function(){
            var cast = shims[shim].call()
            if (cast.valid || cast.converted.valid) cast = shims[ref].apply(cast.converted.value, arguments)
            return cast
          }
        })(shims, shim, ref)
      }
    }
  }

  function validate(cast, valid){
    var v = cast.value
    var cv = cast.converted.value
    // validate converted value
    if (cast.converted.valid !== false) {
      if (valid === undefined) valid = !(cv === undefined || cv === null || isNaN(cv) || (cv.getTime && isNaN(cv.getTime())))
      cast.converted.valid = valid
      cast.converted.invalid = !valid
    }
    // validate original value
    if (cast.valid !== false) {
      cast.valid = v === cv && cast.converted.valid
      cast.invalid = !cast.valid
    }
  }

  function convert(cast, x){
    cast.converted.value = x
    validate(cast)
  }

  function clone(x){
    if (x instanceof Array) return [].concat(x)
    if (x instanceof Date) return new Date(x)
    if (x instanceof Object) return null // not trying to deep clone objects yet...
    return x
  }

  function validType(x){
    return (x !== null && x !== undefined && !(x != x))
  }


  // ### CONVERTERS

  Cast.fn('integer', function(respondWith, x){
    respondWith(Math.round(parseFloat(x, 10)))
  })


  // ### VALIDATORS

  Cast.fn('lessThan', function(respondWith, x, limit){
    respondWith(x < limit)
  })
  Cast.fn('greaterThan', function(respondWith, x, limit){
    respondWith(x > limit)
  })

  return function(x){ return new Cast(x) }

})
