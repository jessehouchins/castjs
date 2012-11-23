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


  // ### EXPOSED CONSTRUCTOR

  var cast = function(x){ return new Cast(x) }


  // ### REGISTER CONVERTER

  cast.register = function(obj, fn) {
    // support 'name', function and object syntax
    if (typeof obj === 'string') {
      var name = obj
      obj = {}
      obj[obj] = fn
    }

      // register caller for fn on prototype
      //cast.as[name] = Cast.prototype[name] = caller
  }




  // ### CAST MODULE

  function Cast(x){
    this.original = x
    this.value = clone(x)
  }

  Cast.prototype = {
    VERSION: '0.0.3',
    as: {}
  }


  // ### PRIVATE METHODS

  function clone(x){
    if (x instanceof Array) return [].concat(x)
    if (x instanceof Date) return new Date(x)
    if (x instanceof Object) return null // not trying to clone objects yet...
    return x
  }



  return cast

})
