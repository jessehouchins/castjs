/*!
  * cast - validation and conversion library
  * https://github.com/jessehouchins/castjs
  * copyright Jesse Houchins
  * MIT License
  */

/*

1.  Date         min, max, within range
2.  Number       min, max, within range round (places)
  - Integer
3.  String       trim, min, max, limit chars
  - Email        custom validation for email
4.

*/



!function (name, definition) {
  if (typeof module != 'undefined') module.exports = definition()
  else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
  else this[name] = definition()
}('cast', function () {


  // ### EXPOSED CONSTRUCTOR

  var cast = function(obj, prop){ return new Caster(obj, prop) }
  cast.VERSION = '0.0.3'


  // ### `Caster`
  //
  // Packages arguments to be converted by first chained method call

  function Caster(obj, prop){
    this.obj = obj
    this.prop = prop
    this.is = this
    this.as = this
    this.a = this
    this.an = this
  }
  Caster.prototype = {}


  // ### `Base`
  //
  // The base module that gets extended through `cast.register`.
  // All registered modules will contain these methods.
  // Do not overload these or your modules will misbehave.

  Base = function(methods){
    for (var method in methods) {
      (function(module, methods, method){
        module[method] = function(){
          if (this.valid) {
            var args = Array.prototype.slice.call(arguments)
            args.unshift(this.value)
            methods[method].apply(this, args)
          }
          return this
        }
      })(this, methods, method)
    }
  }
  Base.prototype = {
    set: function(x){
      // set value
      this.value = x
      if (this.prop) this.obj[this.prop] = x
      // track valid state
      if (this.valid) {
        this.valid = this.blank || this.isValid(x)
        this.invalid = !this.valid
      }
    },

    fail: function(){
      this.set(null)
    },

    rangeError: function(x){
      this.outOfRange = true
      this.fail()
    },

    // Expose usefull helpers for user modules
    makeString: makeString,
    makeNumber: makeNumber,
    realTypeof: realTypeof,
    trimString: trimString,
    isBlank: isBlank,
    isValid: isValid,

    // handle errors
    if: function(handlers){
      if (this.blank && handlers.blank) handlers.blank()
      else if (this.outOfRange && handlers.outOfRange) handlers.outOfRange(this.value)
      else if (this.valid && handlers.valid) handlers.valid(this.value)
      else if (this.invalid && handlers.invalid) handlers.invalid(this.original)
      return this
    }
  }


  // ### `cast.register`
  //
  // Register a converter as a cast module. Supports (method, fn) or object syntax.
  // When using object syntax, the `initialize` method will be used as the constructor.
  // All other methods will be prototype methods on the converter.

  cast.register = function(type, fn) {

    // Support string/fn or object syntax
    var obj = fn ? {} : type
    if (fn) obj[type] = {initialize: fn}

    for (var type in obj) {
      var module = obj[type]
      var fn = module.initialize
      if (!fn) continue

      ;delete module.initialize; // yay for semicolons :(

      (function(Caster, module, setup, fn, Base){
        function Casting(obj, prop){
          setup(this, obj, prop)
          var args = Array.prototype.slice.call(arguments, 2)
          args.unshift(this.value)
          fn.apply(this, args)
        }
        Casting.prototype = new Base(module)
        Caster.prototype[type] = function(opts){
          return new Casting(this.obj, this.prop, opts)
        }
        Caster.prototype[type].prototype = module
      })(Caster, module, setup, fn, Base)

    }
  }

  // Used when testing
  cast.unregister = function() {
    for (var i=0; i<arguments.length; i++){
      delete Caster.prototype[arguments[i]]
    }
  }

  /*////  CAST MODULES  ///////////////////////*/

  var numeric = {
    lessThan: function(x, max){
      if (x >= max) this.rangeError()
    },
    greaterThan: function(x, min){
      if (x <= min) this.rangeError()
    },
    noMoreThan: function(x, max){
      if (x > max) this.rangeError()
    },
    atLeast: function(x, min){
      if (x < max) this.rangeError()
    }
  }

  var modules = {

    date: {
      initialize: function(x){
        if (isNaN(Date.parse(x))) return this.fail()
        this.set(new Date(x))
      },
      beginningOfDay: function(x){
        if (this.realTypeof(x) !== 'date') return this.fail()
        this.set(x.setSeconds(0) && x.setMinutes(0) && x.setHours(0) && x)
      },
      endOfDay: function(x){
        if (this.realTypeof(x) !== 'date') return this.fail()
        this.set(x.setSeconds(59) && x.setMinutes(59) && x.setHours(23) && x)
      },
      before: function(x, limit){
        if (Date.parse(x) >= Date.parse(limit)) this.rangeError()
      },
      after: function(x, limit){
        if (Date.parse(x) <= Date.parse(limit)) this.rangeError()
      },
      format: function(x, str){
        var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
        var months = ['January','February','March','April','May','June','July','August','September','October','November','December']
        var UTC = str.replace(/\s*UTC$/,'')
        UTC = (str != UTC) ? (str = UTC) && 'UTC' : ''
        var day = x['get'+UTC+'Day']()
        var month = x['get'+UTC+'Month']()
        var date = x['get'+UTC+'Date']()
        var year = x['get'+UTC+'FullYear']()
        var hour = x['get'+UTC+'Hours']()
        var min = x['get'+UTC+'Minutes']()
        var sec = x['get'+UTC+'Seconds']()
        var str = str.split(/(day|DAY|dy|DY|D|month|MONTH|mon|MON|mm|m|yyyy|yy|dd|d|HH|H|MM|M|SS|S)/)

        var tokens = {
          day: days[day],
          DAY: days[day].toUpperCase(),
          dy: days[day].substring(0,3),
          DY: days[day].substring(0,3).toUpperCase(),
          D: days[day].substring(0,1),
          month: months[month],
          MONTH: months[month].toUpperCase(),
          mon: months[month].substring(0,3),
          MON: months[month].substring(0,3).toUpperCase(),
          mm: month > 9 ? month+1 : "0"+(month+1),
          m: month+1,
          yyyy: year,
          yy: year.toString().substring(2),
          dd: date > 9 ? date : "0"+date,
          d: date,
          HH: hour > 9 ? hour : "0"+hour,
          H: hour,
          MM: min > 9 ? min : "0"+min,
          M: min,
          SS: sec > 9 ? sec : "0"+sec,
          S: sec
        }

        for ( var i=0; i<str.length; i++) {
          var token = str[i]
          if (tokens[token]) str[i] = tokens[token]
        }

        this.set(str.join(''))
      }
    },

    text: {
      initialize: function(x){
        this.set(this.makeString(x))
      },
      matches: function(x, regex){
        if (!x.match(regex)) this.fail()
      },
      doesNotmatch: function(x, regex){
        if (x.match(regex)) this.fail()
      },
      min: function(x, min){
        if (x.length < min) this.rangeError()
      },
      max: function(x, max){
        if (x.length > max) this.rangeError()
      }
    },

    email: {
      initialize: function(x){
        x = this.makeString(x)
        if (!x.match(/.+@.+\..+/)) return this.fail()
        this.set(x)
      }
    },

    number: defaults({
      initialize: function(x, d){
        this.set(this.makeNumber(x, d))
      }
    }, numeric),

    integer: defaults({
      initialize: function(x){
        this.set(this.makeNumber(x, 0))
      }
    }, numeric)

  }

  cast.register(modules)


  // ### PRIVATE HELPER METHODS

  function setup(self, obj, prop){
    var x = obj
    if (typeof prop === 'string') {
      x = obj[prop]
      self.obj = obj
      self.prop = prop
    }
    self.valid = true
    self.invalid = false
    self.original = trimString(x)
    self.blank = isBlank(self.original)
    self.set(clone(x))
  }

  function isBlank(x){
    return x === undefined || x === null || x === ''
  }

  function isValid(x){
    return !(x === undefined || x === null || (x !== x) || (x.getTime && isNaN(x.getTime())))
  }

  function makeString(x){
    if (isBlank(x)) return ''
    var str = x.toString && x.toString() || ''
    return (str.match(/\n|\f|\r/)) ? str : trimString(str)
  }

  function makeNumber(x, d){
    if (makeString(x).match(/[^\d|\s|\$|\.|,]/g)) return NaN
    var num = parseFloat(x, 10)
    return d !== undefined ? parseFloat(num.toFixed(d)) : num
  }

  function trimString(x){
    return (typeof x === 'string') ? x.replace(/^\s+|\s+$/g, '') : x
  }

  function realTypeof(x){
    return typeof x === 'object' ? Object.prototype.toString.call(x).replace(/^\[object |\]$/g,'').toLowerCase() : typeof x
  }

  function clone(x){
    if (x instanceof Array) return [].concat(x)
    if (x instanceof Date) return new Date(x)
    if (x instanceof Object) JSON.parse(JSON.stringify(x))
    return x
  }

  function defaults(obj, src){
    for (var method in src) {
      if (obj[method] === undefined) obj[method] = src[method]
    }
    return obj
  }

  return cast

})