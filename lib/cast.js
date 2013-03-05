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
      return this
    },

    fail: function(){
      return this.set(null)
    },

    rangeError: function(x){
      this.outOfRange = true
      return this
    },

    // Expose usefull helpers for user modules
    makeString: makeString,
    realTypeof: realTypeof,
    trimString: trimString,
    isBlank: isBlank,
    isValid: isValid,

    // handle errors
    if: function(handlers){
      if (handlers.blank && this.blank) {
        handlers.blank()
      } else if (handlers.outOfRange && this.outOfRange) {
        handlers.outOfRange(this.value)
      } else if (handlers.valid && this.valid) {
        handlers.valid(this.value)
      } else if (handlers.invalid && this.invalid) {
        handlers.invalid(this.original)
      }
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

  /*////  CAST MODULES  ///////////////////////*/

  var modules = {

    date: {
      initialize: function(x){
        if (isNaN(Date.parse(x))) this.fail()
        this.set(new Date(x))
      },
      beginningOfDay: function(x){
        if (this.realTypeof(x) !== 'date') this.fail()
        this.set(x.setSeconds(0) && x.setMinutes(0) && x.setHours(0) && x)
      },
      endOfDay: function(x){
        if (this.realTypeof(x) !== 'date') this.fail()
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

        tokens = {
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
        if (!x.match(/.+@.+\..+/)) this.fail()
        this.set(x)
      }
    },

    integer: {
      initialize: function(x){
        this.set(this.makeString(x).match(/[^\D|\S]/g) ? null : Math.round(parseFloat(x, 10)))
      }
    }

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
    return isBlank(x) ? '' : x.toString && trimString(x.toString()) || ''
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

  return cast

})







// test attrs

var log = function(msg){
  document.write('<ul><li>'+msg+'</li></ul>')
}


var attrs = {
  start_date: 'Jan 4 2013',
  end_date: 'Jan 2 2013',
  number: "4",
  name: "  Foobar    ",
  email: "  foo@bar.net   ",
  // password: "erhgSD2@#x++=__ert<script>foo</script>"
  password: "12345678"
}

console.log('Original Attrs:', JSON.parse(JSON.stringify(attrs)))

cast(attrs, 'start_date').date().beginningOfDay().before(attrs.end_date).format('yyyy-mm-dd HH:MM:SS').if({
  blank: function(){ log('Start Date is required.') },
  outOfRange: function(x){ log('Start Date must be before End Date') },
  invalid: function(x){ log('"'+x+'" is not a valid date.') },
  valid: function(x){ log('Start Date ('+x+') is valid.') }
})

cast(attrs, 'end_date').date().endOfDay().after(attrs.start_date).format('yyyy-mm-dd HH:MM:SS').if({
  blank: function(){ log('End Date is required.') },
  outOfRange: function(x){ log('End Date must be after Start Date') },
  invalid: function(x){ log('"'+x+'" is not a valid date.') },
  valid: function(x){ log('End date ('+x+') is valid.') }
})

cast(attrs, 'number').integer().if({
  blank: function(){ log('Number is required.') },
  invalid: function(x){ log('"'+x+'" is not a whole number.') },
  valid: function(x){ log('Number ('+x+') is valid.') }
})

cast(attrs, 'name').text().if({
  blank: function(){ log('Name is required.') },
  invalid: function(x){ log('"'+x+'" is not a valid name.') },
  valid: function(x){ log('Name ('+x+') is valid.') }
})

cast(attrs, 'email').email().if({
  blank: function(){ log('Email Address is required.') },
  invalid: function(x){ log('"'+x+'" is not a valid email address.') },
  valid: function(x){ log('Email ('+x+') is valid.') }
})

cast(attrs, 'password').text().min(8).max(16).if({
  blank: function(){ log('Password is required.') },
  outOfRange: function(x){ log('Password must be between 8 and 16 characters.') },
  invalid: function(x){ log('Password is invalid.') },
  valid: function(x){ log('Password ('+x+') is valid.') }
})

console.log('Cast Attrs:', attrs)
