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

  function clone(x){
    if (x instanceof Array) return [].concat(x)
    if (x instanceof Date) return new Date(x)
    if (x === null || x === undefined || isNaN(x) || x instanceof Object) return undefined
    return x
  }


  var casting = false

  var Cast = function(x){
    this.valid = true
    this.invalid = false
    this.value = x
    if (!casting) {
      casting = true
      this.converted = new Cast(clone(x))
      casting = false
    }
  }

  Cast.fn = function(name, fn){
    fnc = function(){
      var args = Array.prototype.slice.call(arguments, 0)
      return fn.apply(this, [this.converted.value].concat(args))
    }
    var proto = Cast.prototype
    for (var prop in proto){
      if (!~proto.baseMethods.indexOf(prop)) fnc[prop] = proto[prop]
      if (proto[prop] instanceof Function && !proto[prop][name]) proto[prop][name] = fnc
    }
    proto[name] = fnc
  }

  Cast.prototype = {

    VERSION: '0.0.1',

    baseMethods: ['baseMethods', 'VERSION', 'Converter', 'Validation'],

    setAsValid: function(bool){
      this.valid = !!bool
      this.invalid = !bool
      return this
    },

    validate: function(bool){
      this.setAsValid(bool)
      if (!bool && this.converted) this.converted.setAsValid(false)
      return this
    },

    convert: function(x){
      var v = this.value
      if (this.converted){
        this.setAsValid(v === x)
        this.converted.value = x
        arguments.callee.caller.call(this.converted)
      }
      else {
        this.setAsValid(0
        || v === x
        || v !== undefined
        || v !== null
        || !isNaN(v)
        || (v.getTime && isNaN(v.getTime()))
        )
      }
      return this
    }
  }


  Cast.fn('integer', function(x){
    return this.convert(Math.round(parseFloat(x, 10)))
    //return this.validIf(typeof x === 'number' && x % 1 === 0)
  })
  Cast.fn('lessThan', function(x, limit){
    return this.validate(x < limit)
  })
  Cast.fn('greaterThan', function(x, limit){
    return this.validate(x > limit)
  })

  return function(x){ return new Cast(x) }

})
