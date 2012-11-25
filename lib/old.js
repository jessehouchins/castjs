
  // ### PRIVATE METHODS & VARS

  var methods = {}

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
        })(self, methods, shims, name)
      }
    }
    // add references to each shim
    for (var shim in shims) {
      for (var ref in shims) {
        (function(shims, shim, ref){
          if (!shims[shim][ref]) {
            shims[shim][ref] = function(){
              var cast = shims[shim].call()
              if (cast.valid || cast.converted.valid) cast = shims[ref].apply(cast.converted.value, arguments)
              return cast
            }
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
      if (valid === undefined) valid = !(cv === undefined || cv === null || (cv !== cv) || (cv.getTime && isNaN(cv.getTime())))
      cast.converted.valid = !!valid
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
    if (x instanceof Object) return null // not trying to clone objects yet...
    return x
  }

  function makeString(x){
    return x.toString ? x.toString() : ''
  }

  function realTypeof(x){
    return typeof x === 'object' ? Object.prototype.toString.call(x).replace(/^\[object |\]$/g,'').toLowerCase() : typeof x 
  }


  // ### PUBLIC METHODS

  Cast.fn({

    // ### NUMERIC

    integer: function(respondWith, x){
      respondWith(Math.round(parseFloat(x, 10)))
    },

    lessThan: function(respondWith, x, limit){
      respondWith(x < limit)
    },

    greaterThan: function(respondWith, x, limit){
      respondWith(x > limit)
    },

    // ### TEXT

    text: function(respondWith, x){
      respondWith(makeString(x).replace(/^\s+|\s+$/g, ''))
    },

    shorterThan: function(respondWith, x, limit){ 
      respondWith(x.length < (limit.length || limit))
    },

    longerThan: function(respondWith, x, limit){
      respondWith(x.length > (limit.length || limit))
    },

    email: function(respondWith, x){
      respondWith(!!x.match(/.+@.+\..+/))
    },

    // ### DATE

    date: function(respondWith, x){
      respondWith(isNaN(Date.parse(x)) ? false : new Date(x))
    },

    beginningOfDay:function(respondWith, x){
      respondWith(x.getTime && x.getTime() ? (x.setSeconds(0) && x.setMinutes(0) && x.setHours(0) && x) : false)
    },

    endOfDay:function(respondWith, x){
      respondWith(x.getTime && x.getTime() ? (x.setSeconds(59) && x.setMinutes(59) && x.setHours(23) && x) : false)
    },

    // ### MULTI FORMAT

    max: function(respondWith, x, limit){
      switch (realTypeof(x)) {
        case 'number': return respondWith(x > limit ? limit : x)
        case 'date'  : return respondWith(x.getTime() > Date.parse(limit) ? new Date(limit) : x)
        case 'string': return respondWith(x.substring(0, limit))
        default: respondWith(false)
      }
    },

    min: function(respondWith, x, limit){
      switch (realTypeof(x)) {
        case 'number': return respondWith(x < limit ? limit : x)
        case 'date'  : return respondWith(x.getTime() > Date.parse(limit) ? new Date(limit) : x)
        default: respondWith(false)
      }
    }
    
  })